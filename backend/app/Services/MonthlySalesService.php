<?php

namespace App\Services;

use App\Models\MonthlySale;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class MonthlySalesService
{
    /**
     * Orders counted toward monthly income after completion.
     * Stays when daily sales change or a completed order is deleted.
     * Removed only when the order is cancelled (sales_recorded_at cleared).
     */
    public function countedOrdersQuery()
    {
        return Order::query()
            ->whereNotNull('sales_recorded_at')
            ->where('status', '!=', 'Cancelled');
    }

    public function syncAll(): void
    {
        $yearMonths = $this->countedOrdersQuery()
            ->get(['order_date'])
            ->map(fn (Order $order) => Carbon::parse($order->order_date)->format('Y-m'))
            ->unique();

        $autoMonths = MonthlySale::query()
            ->where('source', 'auto')
            ->pluck('year_month');

        $yearMonths->merge($autoMonths)->unique()->each(function (string $yearMonth) {
            $this->syncMonth($yearMonth);
        });
    }

    public function syncMonth(string $yearMonth): void
    {
        $monthStart = Carbon::parse($yearMonth.'-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();

        $ordersQuery = $this->countedOrdersQuery()
            ->whereDate('order_date', '>=', $monthStart->toDateString())
            ->whereDate('order_date', '<=', $monthEnd->toDateString());

        $total = (float) $ordersQuery->sum('total_amount');
        $orderCount = (int) $ordersQuery->count();

        $autoSale = $this->findAutoSaleForMonth($yearMonth);

        if ($total > 0) {
            if ($autoSale) {
                $autoSale->update([
                    'amount' => $total,
                    'order_count' => $orderCount,
                    'notes' => MonthlySale::AUTO_SYNC_NOTES,
                    'source' => 'auto',
                    'is_deleted' => false,
                ]);
            } else {
                MonthlySale::create([
                    'year_month' => $yearMonth,
                    'amount' => $total,
                    'order_count' => $orderCount,
                    'notes' => MonthlySale::AUTO_SYNC_NOTES,
                    'source' => 'auto',
                ]);
            }

            return;
        }

        if ($autoSale && ! $autoSale->is_deleted) {
            $autoSale->update(['is_deleted' => true]);
        }
    }

    public function loadMonthlySales(): Collection
    {
        $this->syncAll();

        return MonthlySale::query()
            ->where('tbl_monthly_sales.is_deleted', false)
            ->orderByDesc('year_month')
            ->get()
            ->map(fn (MonthlySale $monthlySale) => [
                'monthly_sale_id' => $monthlySale->monthly_sale_id,
                'year_month' => $monthlySale->year_month,
                'label' => Carbon::parse($monthlySale->year_month.'-01')->format('F Y'),
                'amount' => (float) $monthlySale->amount,
                'order_count' => (int) $monthlySale->order_count,
            ]);
    }

    public function recordOrderSale(Order $order): void
    {
        if ($order->sales_recorded_at !== null) {
            return;
        }

        $order->update([
            'sales_recorded_at' => now(),
        ]);

        $this->syncMonth(Carbon::parse($order->order_date)->format('Y-m'));
    }

    public function removeOrderSale(Order $order): void
    {
        if ($order->sales_recorded_at === null) {
            return;
        }

        $yearMonth = Carbon::parse($order->order_date)->format('Y-m');

        $order->update([
            'sales_recorded_at' => null,
        ]);

        $this->syncMonth($yearMonth);
    }

    public function destroyMonthlySales(string $yearMonth): int
    {
        $monthStart = Carbon::parse($yearMonth.'-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();

        $ordersCleared = $this->countedOrdersQuery()
            ->whereDate('order_date', '>=', $monthStart->toDateString())
            ->whereDate('order_date', '<=', $monthEnd->toDateString())
            ->update(['sales_recorded_at' => null]);

        $recordDeleted = MonthlySale::query()
            ->where('year_month', $yearMonth)
            ->where('is_deleted', false)
            ->update(['is_deleted' => true]);

        if ($ordersCleared > 0 || $recordDeleted > 0) {
            return max($ordersCleared, 1);
        }

        return 0;
    }

    private function findAutoSaleForMonth(string $yearMonth): ?MonthlySale
    {
        return MonthlySale::query()
            ->where('year_month', $yearMonth)
            ->where('source', 'auto')
            ->orderByDesc('monthly_sale_id')
            ->first();
    }
}
