import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import DashboardService from "../../../Services/DashboardService";
import {
    canDeleteDailySale,
    isAutoSyncedDailySale,
} from "../../../interfaces/DailySaleInterface";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Spinner from "../../../components/Spinner/Spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/Table";
import type { DailySaleColumns } from "../../../interfaces/DailySaleInterface";

interface DailySalesListProps {
    refreshKey: boolean;
    onDeleteDailySale: (dailySale: DailySaleColumns) => void;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const formatSaleDate = (saleDate: string) => {
    const parsed = new Date(`${saleDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return saleDate;
    }
    return parsed.toLocaleDateString("en-PH", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const DailySalesList: FC<DailySalesListProps> = ({ refreshKey, onDeleteDailySale }) => {
    const [loadingList, setLoadingList] = useState(false);
    const [dailySales, setDailySales] = useState<DailySaleColumns[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const handleLoadDailySales = useCallback(async () => {
        try {
            setLoadingList(true);
            const res = await DashboardService.loadDailySales();
            if (res.status === 200) {
                setDailySales(res.data.daily_sales ?? []);
            }
        } catch (error) {
            console.error("Error loading daily sales:", error);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim().toLowerCase());
        }, 400);

        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        handleLoadDailySales();

        const intervalId = window.setInterval(() => {
            handleLoadDailySales();
        }, TWENTY_FOUR_HOURS_MS);

        return () => window.clearInterval(intervalId);
    }, [refreshKey, handleLoadDailySales]);

    const filteredDailySales = useMemo(() => {
        if (!debouncedSearch) {
            return dailySales;
        }

        return dailySales.filter((sale) => {
            const formattedDate = formatSaleDate(sale.sale_date).toLowerCase();
            const haystack = [
                sale.sale_date,
                formattedDate,
                String(sale.amount),
                sale.notes ?? "",
                isAutoSyncedDailySale(sale) ? "auto" : "manual",
            ]
                .join(" ")
                .toLowerCase();

            return haystack.includes(debouncedSearch);
        });
    }, [dailySales, debouncedSearch]);

    const totalDailySales = filteredDailySales.reduce(
        (sum, sale) => sum + parseFloat(String(sale.amount)),
        0,
    );

    return (
        <section className="yb-panel mt-8 p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="yb-eyebrow">Daily sales</h2>
                </div>
                <button
                    type="button"
                    className="yb-btn-primary"
                    onClick={handleLoadDailySales}
                    disabled={loadingList}
                >
                    Refresh
                </button>
            </div>

            <div className="mb-6 border-b border-[#2d2926]/10 pb-6">
                <div className="w-full max-w-sm">
                    <FloatingLabelInput
                        label="Search"
                        type="text"
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="yb-table-wrap">
                <div className="max-h-[min(20rem,calc(100vh-22rem))] overflow-y-auto overflow-x-auto">
                <Table>
                    <TableHeader className="yb-table-head sticky top-0 z-10">
                        <TableRow>
                            <TableCell isHeader className="px-4 py-3 text-center">
                                No.
                            </TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start">
                                Date
                            </TableCell>
                            <TableCell isHeader className="px-4 py-3 text-end">
                                Amount
                            </TableCell>
                            <TableCell isHeader className="px-4 py-3 text-start">
                                Notes
                            </TableCell>
                            <TableCell isHeader className="px-4 py-3 text-center">
                                Source
                            </TableCell>
                            <TableCell isHeader className="px-4 py-3 text-center">
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="yb-table-body divide-y divide-[#2d2926]/10">
                        {loadingList ? (
                            <TableRow>
                                <TableCell colSpan={6} className="px-4 py-6 text-center">
                                    <Spinner size="md" />
                                </TableCell>
                            </TableRow>
                        ) : filteredDailySales.length > 0 ? (
                            filteredDailySales.map((sale, index) => (
                                <TableRow key={sale.daily_sale_id} className="yb-table-row">
                                    <TableCell className="px-4 py-3 text-center">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start">
                                        <span className="font-medium text-[#2d2926]">
                                            {formatSaleDate(sale.sale_date)}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-[#4a4541]">
                                            {sale.sale_date}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-end">
                                        ₱{parseFloat(String(sale.amount)).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-start">
                                        {sale.notes?.trim() || "—"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                        <span
                                            className={
                                                isAutoSyncedDailySale(sale)
                                                    ? "yb-badge yb-badge-confirmed"
                                                    : "yb-badge"
                                            }
                                        >
                                            {isAutoSyncedDailySale(sale) ? "Auto" : "Manual"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                        {canDeleteDailySale(sale) ? (
                                            <button
                                                type="button"
                                                className="text-red-600 hover:underline"
                                                onClick={() => onDeleteDailySale(sale)}
                                            >
                                                Delete
                                            </button>
                                        ) : (
                                            <span
                                                className="text-gray-400"
                                                title="Auto-synced sales cannot be deleted. Update or delete the related completed orders instead."
                                            >
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-sm text-[#4a4541]"
                                >
                                    {debouncedSearch
                                        ? "No daily sales records match your search."
                                        : "No daily sales records yet. Complete an order to record sales."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </div>
        </section>
    );
};

export default DailySalesList;
