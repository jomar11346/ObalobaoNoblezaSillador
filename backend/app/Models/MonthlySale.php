<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlySale extends Model
{
    use HasFactory;

    public const AUTO_SYNC_NOTES = 'Completed orders';

    protected $table = 'tbl_monthly_sales';

    protected $primaryKey = 'monthly_sale_id';

    protected $fillable = [
        'year_month',
        'amount',
        'order_count',
        'notes',
        'source',
        'is_deleted',
    ];

    public function isAutoSynced(): bool
    {
        return $this->source === 'auto';
    }
}
