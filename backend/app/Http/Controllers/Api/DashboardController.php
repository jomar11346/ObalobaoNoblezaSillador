<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailySale;
use App\Models\Order;
use App\Models\Flower;
use App\Services\DailySaleSyncService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private DailySaleSyncService $dailySaleSyncService
    ) {
    }

    public function getDashboardStats()
    {
        $totalSales = Order::where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Completed')
            ->sum('total_amount');

        $lowStockFlowers = Flower::where('tbl_flowers.is_deleted', false)
            ->where('tbl_flowers.stock_quantity', '<', 10)
            ->count();

        $pendingOrders = Order::where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Pending')
            ->count();

        return response()->json([
            'total_sales' => $totalSales,
            'low_stock_flowers' => $lowStockFlowers,
            'pending_orders' => $pendingOrders
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
}
