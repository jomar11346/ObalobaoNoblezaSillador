<?php

namespace App\Services;

use App\Models\DailySale;
use App\Models\Order;
use Carbon\Carbon;

class DailySaleSyncService
{
    public function syncAll(): void
    {
        $orderDates = Order::where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Completed')
            ->distinct()
            ->pluck('order_date')
            ->map(fn ($date) => Carbon::parse($date)->toDateString());

        $autoDates = DailySale::query()
            ->where(function ($query) {
                $query->where('source', 'auto')
                    ->orWhere('notes', DailySale::AUTO_SYNC_NOTES);
            })
            ->pluck('sale_date')
            ->map(fn ($date) => Carbon::parse($date)->toDateString());

        $orderDates->merge($autoDates)->unique()->each(function (string $date) {
            $this->syncDate($date);
        });
    }

    public function syncDate(string $date): void
    {
        $saleDate = Carbon::parse($date)->toDateString();

        $total = (float) Order::where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Completed')
            ->whereDate('order_date', $saleDate)
            ->sum('total_amount');

        $autoSale = $this->findAutoSaleForDate($saleDate);

        if ($total > 0) {
            if ($autoSale) {
                $autoSale->update([
                    'amount' => $total,
                    'notes' => DailySale::AUTO_SYNC_NOTES,
                    'source' => 'auto',
                    'is_deleted' => false,
                ]);
            } else {
                DailySale::create([
                    'sale_date' => $saleDate,
                    'amount' => $total,
                    'notes' => DailySale::AUTO_SYNC_NOTES,
                    'source' => 'auto',
                ]);
            }

            return;
        }

        if ($autoSale && ! $autoSale->is_deleted) {
            $autoSale->update(['is_deleted' => true]);
        }
    }

    private function findAutoSaleForDate(string $saleDate): ?DailySale
    {
        return DailySale::query()
            ->whereDate('sale_date', $saleDate)
            ->where(function ($query) {
                $query->where('source', 'auto')
                    ->orWhere('notes', DailySale::AUTO_SYNC_NOTES);
            })
            ->orderByDesc('daily_sale_id')
            ->first();
    }
}
