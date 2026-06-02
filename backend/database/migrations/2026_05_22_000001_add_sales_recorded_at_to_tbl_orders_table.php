<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->timestamp('sales_recorded_at')->nullable()->after('order_date');
        });

        DB::table('tbl_orders')
            ->where('status', 'Completed')
            ->whereNull('sales_recorded_at')
            ->update(['sales_recorded_at' => DB::raw('COALESCE(updated_at, created_at, NOW())')]);
    }

    public function down(): void
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropColumn('sales_recorded_at');
        });
    }
};
