<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_monthly_sales', function (Blueprint $table) {
            $table->id('monthly_sale_id');
            $table->char('year_month', 7);
            $table->decimal('amount', 12, 2);
            $table->unsignedInteger('order_count')->default(0);
            $table->string('notes')->nullable();
            $table->enum('source', ['manual', 'auto'])->default('auto');
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_monthly_sales');
        Schema::enableForeignKeyConstraints();
    }
};
