<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailySale;
use App\Models\Order;
use App\Models\Flower;
use App\Models\OrderItem;
use App\Services\DailySaleSyncService;
use App\Services\MonthlySalesService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct(
        private DailySaleSyncService $dailySaleSyncService,
        private MonthlySalesService $monthlySalesService
    ) {
    }

    public function getDashboardStats()
    {
        $now = Carbon::now();

        $totalSales = $this->dailySaleSyncService->currentMonthTotal();

        $lowStockFlowers = Flower::where('tbl_flowers.is_deleted', false)
            ->where('tbl_flowers.stock_quantity', '<', 10)
            ->count();

        $pendingOrders = Order::where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Pending')
            ->count();

        return response()->json([
            'total_sales' => $totalSales,
            'sales_month' => $now->format('Y-m'),
            'sales_month_label' => $now->format('F Y'),
            'low_stock_flowers' => $lowStockFlowers,
            'pending_orders' => $pendingOrders
        ], 200);
    }

    public function getDailySaleFlowers(Request $request)
    {
        $validated = $request->validate([
            'sale_date' => ['required', 'date'],
        ]);

        $saleDate = Carbon::parse($validated['sale_date'])->toDateString();

        $flowers = OrderItem::query()
            ->select(
                'tbl_flowers.flower_id',
                'tbl_flowers.name as flower_name',
                DB::raw('SUM(tbl_order_items.quantity) as total_quantity'),
                DB::raw('SUM(tbl_order_items.quantity * tbl_order_items.price) as line_total')
            )
            ->join('tbl_orders', 'tbl_order_items.order_id', '=', 'tbl_orders.order_id')
            ->join('tbl_flowers', 'tbl_order_items.flower_id', '=', 'tbl_flowers.flower_id')
            ->where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Completed')
            ->whereDate('tbl_orders.order_date', $saleDate)
            ->where('tbl_flowers.is_deleted', false)
            ->groupBy('tbl_flowers.flower_id', 'tbl_flowers.name')
            ->orderBy('tbl_flowers.name')
            ->get()
            ->map(fn ($row) => [
                'flower_id' => (int) $row->flower_id,
                'flower_name' => $row->flower_name,
                'total_quantity' => (int) $row->total_quantity,
                'line_total' => (float) $row->line_total,
            ]);

        $orderCount = Order::query()
            ->where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Completed')
            ->whereDate('order_date', $saleDate)
            ->count();

        return response()->json([
            'sale_date' => $saleDate,
            'order_count' => $orderCount,
            'flowers' => $flowers,
        ], 200);
    }

    public function loadMonthlySales()
    {
        return response()->json([
            'monthly_sales' => $this->monthlySalesService->loadMonthlySales(),
        ], 200);
    }

    public function syncDailySales()
    {
        $this->dailySaleSyncService->syncAll();

        return response()->json([
            'message' => 'Daily sales refreshed from completed orders.',
        ], 200);
    }

    public function loadDailySales()
    {
        $this->dailySaleSyncService->syncAll();

        $dailySales = DailySale::where('tbl_daily_sales.is_deleted', false)
            ->orderBy('tbl_daily_sales.sale_date', 'desc')
            ->get()
            ->map(fn (DailySale $dailySale) => [
                'daily_sale_id' => $dailySale->daily_sale_id,
                'sale_date' => $dailySale->sale_date,
                'amount' => $dailySale->amount,
                'notes' => $dailySale->notes,
                'source' => $dailySale->isAutoSynced() ? 'auto' : ($dailySale->source ?? 'manual'),
                'is_deleted' => (bool) $dailySale->is_deleted,
                'created_at' => $dailySale->created_at,
                'updated_at' => $dailySale->updated_at,
                'can_delete' => $dailySale->canBeDeleted(),
            ]);

        return response()->json([
            'daily_sales' => $dailySales,
        ], 200);
    }

    public function storeDailySale(Request $request)
    {
        $validated = $request->validate([
            'sale_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'max:255'],
        ]);

        $dailySale = DailySale::create([
            'sale_date' => $validated['sale_date'],
            'amount' => $validated['amount'],
            'notes' => $validated['notes'] ?? null,
            'source' => 'manual',
        ]);

        return response()->json([
            'message' => 'Daily sale record successfully saved.',
            'daily_sale' => $dailySale,
        ], 200);
    }

    public function destroyDailySale(int $dailySaleId)
    {
        $dailySale = DailySale::query()
            ->where('daily_sale_id', $dailySaleId)
            ->where('is_deleted', false)
            ->firstOrFail();

        if (! $dailySale->canBeDeleted()) {
            return response()->json([
                'message' => 'Auto-synced sales from completed orders cannot be deleted. Delete or update the related orders instead.',
            ], 403);
        }

        $dailySale->update([
            'is_deleted' => true,
        ]);

        return response()->json([
            'message' => 'Daily sale record successfully deleted.',
        ], 200);
    }

    public function destroyMonthlySale(string $yearMonth)
    {
        if (! preg_match('/^\d{4}-\d{2}$/', $yearMonth)) {
            return response()->json([
                'message' => 'Invalid month format. Use YYYY-MM.',
            ], 422);
        }

        $removedCount = $this->monthlySalesService->destroyMonthlySales($yearMonth);

        if ($removedCount === 0) {
            return response()->json([
                'message' => 'No monthly sales records found for the selected month.',
            ], 404);
        }

        return response()->json([
            'message' => 'Monthly sales record successfully deleted.',
            'removed_count' => $removedCount,
        ], 200);
    }
}
