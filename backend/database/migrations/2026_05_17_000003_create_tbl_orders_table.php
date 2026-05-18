<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->foreignId('customer_id')->constrained('tbl_customers', 'customer_id');
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['Pending', 'Confirmed', 'Ready', 'Completed', 'Cancelled'])->default('Pending');
            $table->date('order_date');
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_orders');
        Schema::enableForeignKeyConstraints();
    }
};
