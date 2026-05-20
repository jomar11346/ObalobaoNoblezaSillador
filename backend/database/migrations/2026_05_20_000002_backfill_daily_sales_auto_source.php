<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tbl_daily_sales', 'source')) {
            return;
        }

        DB::table('tbl_daily_sales')
            ->where('notes', 'Auto-synced from completed orders')
            ->where('source', '!=', 'auto')
            ->update(['source' => 'auto']);
    }

    public function down(): void
    {
        // Data backfill is not reversed.
    }
};
