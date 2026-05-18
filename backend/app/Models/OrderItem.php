<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;

class OrderItem extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'tbl_order_items';
    protected $primaryKey = 'order_item_id';
    protected $fillable = [
        'order_id',
        'flower_id',
        'quantity',
        'price',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function flower(): BelongsTo
    {
        return $this->belongsTo(Flower::class, 'flower_id', 'flower_id');
    }
}
