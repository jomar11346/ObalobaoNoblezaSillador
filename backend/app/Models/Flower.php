<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Flower extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'tbl_flowers';
    protected $primaryKey = 'flower_id';
    protected $fillable = [
        'name',
        'price',
        'stock_quantity',
        'image',
        'is_deleted',
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'flower_id', 'flower_id');
    }
}
