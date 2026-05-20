export type DailySaleSource = "manual" | "auto";

export const AUTO_SYNC_DAILY_SALE_NOTES = "Auto-synced from completed orders";

export function isAutoSyncedDailySale(
    sale: Pick<DailySaleColumns, "source" | "notes">,
): boolean {
    if ((sale.source ?? "").trim() === "auto") {
        return true;
    }

    const notes = (sale.notes ?? "").trim().toLowerCase();

    return notes.includes(AUTO_SYNC_DAILY_SALE_NOTES.toLowerCase());
}

export function canDeleteDailySale(
    sale: Pick<DailySaleColumns, "source" | "notes" | "can_delete">,
): boolean {
    if (sale.can_delete === false) {
        return false;
    }

    if (sale.can_delete === true) {
        return true;
    }

    return !isAutoSyncedDailySale(sale);
}

export interface DailySaleColumns {
    daily_sale_id: number;
    sale_date: string;
    amount: number;
    notes?: string | null;
    source?: DailySaleSource;
    can_delete?: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface DailySaleFieldErrors {
    sale_date?: string[];
    amount?: string[];
    notes?: string[];
}
