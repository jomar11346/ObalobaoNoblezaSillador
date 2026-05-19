<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Flower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private const NON_DELETABLE_STATUSES = ['Pending', 'Confirmed', 'Ready'];

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
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:tbl_customers,customer_id'],
            'order_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.flower_id' => ['required', 'exists:tbl_flowers,flower_id'],
            'items.*.quantity' => ['required', 'integer', 'min:1']
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
                'status' => $newStatus
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order Status Successfully Updated.',
                'order' => $order->fresh(['customer', 'orderItems.flower'])
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating order status: ' . $e->getMessage()
            ], 500);
        }
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

            $order->update([
                'is_deleted' => true
            ]);

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
