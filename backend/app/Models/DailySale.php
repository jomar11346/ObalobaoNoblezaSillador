<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailySale extends Model
{
    use HasFactory;

    public const AUTO_SYNC_NOTES = 'Auto-synced from completed orders';

    protected $table = 'tbl_daily_sales';
    protected $primaryKey = 'daily_sale_id';

    protected $fillable = [
        'sale_date',
        'amount',
        'notes',
        'source',
        'is_deleted',
    ];

    public function isAutoSynced(): bool
    {
        if ($this->source === 'auto') {
            return true;
        }

        $notes = trim((string) $this->notes);

        if ($notes !== '' && str_contains($notes, self::AUTO_SYNC_NOTES)) {
            return true;
        }

        return $this->isBackedByCompletedOrders();
    }

    public function isBackedByCompletedOrders(): bool
    {
        $orderTotal = (float) Order::query()
            ->where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.status', 'Completed')
            ->whereDate('order_date', $this->sale_date)
            ->sum('total_amount');

        if ($orderTotal <= 0) {
            return false;
        }

        return abs((float) $this->amount - $orderTotal) < 0.01;
    }

    public function canBeDeleted(): bool
    {
        return ! $this->isAutoSynced();
    }
}
