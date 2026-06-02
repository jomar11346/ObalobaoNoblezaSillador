import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import DashboardService from "../../../Services/DashboardService";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Spinner from "../../../components/Spinner/Spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/Table";
import type { MonthlySaleColumns } from "../../../interfaces/DailySaleInterface";

interface MonthlySalesListProps {
    refreshKey: boolean;
    onDeleteMonthlySale: (monthlySale: MonthlySaleColumns) => void;
}

const MonthlySalesList: FC<MonthlySalesListProps> = ({ refreshKey, onDeleteMonthlySale }) => {
    const [loadingList, setLoadingList] = useState(false);
    const [monthlySales, setMonthlySales] = useState<MonthlySaleColumns[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const handleLoadMonthlySales = useCallback(async () => {
        try {
            setLoadingList(true);
            const res = await DashboardService.loadMonthlySales();
            if (res.status === 200) {
                setMonthlySales(res.data.monthly_sales ?? []);
            }
        } catch (error) {
            console.error("Error loading monthly sales:", error);
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
        handleLoadMonthlySales();
    }, [refreshKey, handleLoadMonthlySales]);

    const filteredMonthlySales = useMemo(() => {
        if (!debouncedSearch) {
            return monthlySales;
        }

        return monthlySales.filter((sale) => {
            const haystack = [
                sale.year_month,
                sale.label,
                String(sale.amount),
                String(sale.order_count),
            ]
                .join(" ")
                .toLowerCase();

            return haystack.includes(debouncedSearch);
        });
    }, [monthlySales, debouncedSearch]);

    return (
        <section className="yb-panel p-5">
            <h2 className="yb-eyebrow mb-4">Monthly sales</h2>

            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#2d2926]/10 pb-6">
                <div className="min-w-[12rem] w-full max-w-sm flex-1">
                    <FloatingLabelInput
                        label="Search"
                        type="text"
                        name="monthly_search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    className="yb-btn-primary shrink-0"
                    onClick={handleLoadMonthlySales}
                    disabled={loadingList}
                >
                    Refresh
                </button>
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
                                    Month
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 text-end">
                                    Orders
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 text-end">
                                    Amount
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 text-center">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="yb-table-body divide-y divide-[#2d2926]/10">
                            {loadingList ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-4 py-6 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredMonthlySales.length > 0 ? (
                                filteredMonthlySales.map((sale, index) => (
                                    <TableRow key={sale.year_month} className="yb-table-row">
                                        <TableCell className="px-4 py-3 text-center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            <span className="font-medium text-[#2d2926]">
                                                {sale.label}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-[#4a4541]">
                                                {sale.year_month}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-end">
                                            {sale.order_count}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-end">
                                            ₱{parseFloat(String(sale.amount)).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                className="text-red-600 hover:underline"
                                                onClick={() => onDeleteMonthlySale(sale)}
                                            >
                                                Delete
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-sm text-[#4a4541]"
                                    >
                                        {debouncedSearch
                                            ? "No monthly sales records match your search."
                                            : "No monthly sales yet. Complete orders to record sales."}
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

export default MonthlySalesList;
