<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_daily_sales', function (Blueprint $table) {
            $table->id('daily_sale_id');
            $table->date('sale_date');
            $table->decimal('amount', 10, 2);
            $table->string('notes')->nullable();
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_daily_sales');
        Schema::enableForeignKeyConstraints();
    }
};
