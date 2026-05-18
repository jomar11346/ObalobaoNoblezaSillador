<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Flower;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
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
}
