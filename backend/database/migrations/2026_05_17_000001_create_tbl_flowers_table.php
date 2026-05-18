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
        Schema::create('tbl_flowers', function (Blueprint $table) {
            $table->id('flower_id');
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('category');
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
        Schema::dropIfExists('tbl_flowers');
        Schema::enableForeignKeyConstraints();
    }
};
