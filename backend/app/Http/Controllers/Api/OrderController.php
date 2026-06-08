<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Flower;
use App\Services\DailySaleSyncService;
use App\Services\MonthlySalesService;
use App\Services\N8nWebhookService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private const NON_DELETABLE_STATUSES = ['Pending', 'Confirmed', 'Ready'];

    public function __construct(
        private DailySaleSyncService $dailySaleSyncService,
        private MonthlySalesService $monthlySalesService,
        private N8nWebhookService $n8nWebhookService
    ) {
    }

    public function loadOrders(Request $request)
    {
        $search = $request->input('search');

        $orders = Order::with(['customer', 'orderItems.flower'])
            ->where('tbl_orders.is_deleted', false)
            ->orderBy('tbl_orders.order_date', 'desc')
            ->orderBy('tbl_orders.created_at', 'desc');

        if ($search) {
            $orders->where(function ($order) use ($search) {
                $order->where('tbl_orders.status', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('tbl_customers.name', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $orders->paginate(15);

        return response()->json([
            'orders' => $orders
        ], 200);
    }

    public function storeOrder(Request $request)
    {
        $today = Carbon::now('Asia/Manila')->startOfDay()->toDateString();

        $validated = $request->validate([
            'customer_id' => ['required', 'exists:tbl_customers,customer_id'],
            'order_date' => ['required', 'date', "after_or_equal:{$today}"],
            'items' => ['required', 'array', 'min:1'],
            'items.*.flower_id' => ['required', 'exists:tbl_flowers,flower_id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ], [
            'order_date.after_or_equal' => 'The order date cannot be in the past.',
        ]);

        DB::beginTransaction();

        try {
            $totalAmount = 0;

            foreach ($validated['items'] as $item) {
                $flower = Flower::find($item['flower_id']);
                
                if ($flower->stock_quantity < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Insufficient stock for flower: {$flower->name}"
                    ], 400);
                }

                $totalAmount += $flower->price * $item['quantity'];
            }

            $order = Order::create([
                'customer_id' => $validated['customer_id'],
                'total_amount' => $totalAmount,
                'status' => 'Pending',
                'order_date' => $validated['order_date']
            ]);

            foreach ($validated['items'] as $item) {
                $flower = Flower::find($item['flower_id']);
                
                OrderItem::create([
                    'order_id' => $order->order_id,
                    'flower_id' => $item['flower_id'],
                    'quantity' => $item['quantity'],
                    'price' => $flower->price
                ]);

                $flower->update([
                    'stock_quantity' => $flower->stock_quantity - $item['quantity']
                ]);
            }

            DB::commit();

            $order->load(['customer', 'orderItems.flower']);
            $this->n8nWebhookService->notifyNewOrder($order);

            return response()->json([
                'message' => 'Order Successfully Created.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Pending,Confirmed,Ready,Completed,Cancelled']
        ]);

        $newStatus = $validated['status'];
        $oldStatus = $order->status;

        if ($newStatus === $oldStatus) {
            return response()->json([
                'message' => 'Order Status Successfully Updated.',
                'order' => $order->fresh(['customer', 'orderItems.flower'])
            ], 200);
        }

        DB::beginTransaction();

        try {
            $order->load('orderItems');

            if ($newStatus === 'Cancelled' && $oldStatus !== 'Cancelled') {
                $this->restoreOrderStock($order);
            } elseif ($oldStatus === 'Cancelled' && $newStatus !== 'Cancelled') {
                $stockError = $this->deductOrderStock($order);
                if ($stockError !== null) {
                    DB::rollBack();
                    return response()->json(['message' => $stockError], 400);
                }
            }

            $order->update([
                'status' => $newStatus,
            ]);

            $order->refresh();

            if ($newStatus === 'Completed') {
                $this->monthlySalesService->recordOrderSale($order);
            } elseif ($newStatus === 'Cancelled') {
                $this->monthlySalesService->removeOrderSale($order);
            }

            if ($oldStatus === 'Completed' || $newStatus === 'Completed' || $newStatus === 'Cancelled') {
                $this->dailySaleSyncService->syncDate($order->order_date);
            }

            DB::commit();

            $freshOrder = $order->fresh(['customer', 'orderItems.flower']);

            if ($newStatus === 'Completed' && $oldStatus !== 'Completed') {
                $this->n8nWebhookService->notifyOrderCompleted($freshOrder);
            }

            return response()->json([
                'message' => 'Order Status Successfully Updated.',
                'order' => $freshOrder
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating order status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function downloadOrderReceipt(int $orderId)
    {
        $order = Order::with(['customer', 'orderItems.flower'])
            ->where('order_id', $orderId)
            ->where('is_deleted', false)
            ->firstOrFail();

        $generatedAt = now()->timezone(config('app.timezone', 'Asia/Manila'))
            ->format('M d, Y h:i A');

        $pdf = Pdf::loadView('receipts.order', [
            'order' => $order,
            'customer' => $order->customer,
            'items' => $order->orderItems,
            'generatedAt' => $generatedAt,
        ])->setPaper('a4', 'portrait');

        return $pdf->download($this->receiptFilename($order));
    }

    private function receiptFilename(Order $order): string
    {
        $customerName = trim((string) ($order->customer?->name ?? ''));

        if ($customerName === '') {
            return 'Customer.pdf';
        }

        $safeName = preg_replace('/[\/\\\\:*?"<>|]/', '', $customerName);
        $safeName = preg_replace('/\s+/', ' ', trim($safeName));

        return ($safeName !== '' ? $safeName : 'Customer').'.pdf';
    }

    public function destroyOrder(Order $order)
    {
        if (in_array($order->status, self::NON_DELETABLE_STATUSES, true)) {
            return response()->json([
                'message' => 'Orders with Pending, Confirmed, or Ready status cannot be deleted. Cancel or complete the order first.',
            ], 403);
        }

        DB::beginTransaction();

        try {
            $order->load('orderItems');

            if ($order->status !== 'Cancelled') {
                $this->restoreOrderStock($order);
            }

            $orderDate = $order->order_date;
            $wasCompleted = $order->status === 'Completed';
            $wasCancelled = $order->status === 'Cancelled';

            if ($wasCancelled) {
                $this->monthlySalesService->removeOrderSale($order);
            }

            $order->update([
                'is_deleted' => true,
            ]);

            if ($wasCompleted || $wasCancelled) {
                $this->dailySaleSyncService->syncDate($orderDate);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order Successfully Deleted.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting order: ' . $e->getMessage()
            ], 500);
        }
    }

    private function restoreOrderStock(Order $order): void
    {
        foreach ($order->orderItems as $item) {
            $flower = Flower::find($item->flower_id);
            if ($flower) {
                $flower->increment('stock_quantity', $item->quantity);
            }
        }
    }

    private function deductOrderStock(Order $order): ?string
    {
        foreach ($order->orderItems as $item) {
            $flower = Flower::find($item->flower_id);

            if (!$flower) {
                return 'One or more flowers in this order no longer exist.';
            }

            if ($flower->stock_quantity < $item->quantity) {
                return "Insufficient stock for flower: {$flower->name}";
            }
        }

        foreach ($order->orderItems as $item) {
            $flower = Flower::find($item->flower_id);
            $flower->decrement('stock_quantity', $item->quantity);
        }

        return null;
    }
}
