<?php

namespace App\Console\Commands;

use App\Services\DailySaleSyncService;
use Illuminate\Console\Command;

class SyncDailySalesCommand extends Command
{
    protected $signature = 'daily-sales:sync';

    protected $description = 'Sync daily sales records from completed orders';

    public function handle(DailySaleSyncService $dailySaleSyncService): int
    {
        $dailySaleSyncService->syncAll();
        $this->info('Daily sales synced from completed orders.');

        return self::SUCCESS;
    }
}
