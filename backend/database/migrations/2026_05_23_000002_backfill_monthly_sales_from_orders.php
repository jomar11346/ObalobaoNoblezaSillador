<?php

use App\Services\MonthlySalesService;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        app(MonthlySalesService::class)->syncAll();
    }

    public function down(): void
    {
        // Data backfill only; table drop is handled by create migration down().
    }
};
