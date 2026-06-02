import type { FC } from "react";
import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/Button/CloseButton";
import Spinner from "../../../components/Spinner/Spinner";
import DashboardService from "../../../Services/DashboardService";
import type {
    DailySaleColumns,
    DailySaleFlowerLine,
} from "../../../interfaces/DailySaleInterface";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/Table";

interface ViewDailySaleFormModalProps {
    dailySale: DailySaleColumns | null;
    isOpen: boolean;
    onClose: () => void;
}

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

const ViewDailySaleFormModal: FC<ViewDailySaleFormModalProps> = ({
    dailySale,
    isOpen,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const [flowers, setFlowers] = useState<DailySaleFlowerLine[]>([]);
    const [orderCount, setOrderCount] = useState(0);

    useEffect(() => {
        if (!isOpen || !dailySale?.sale_date) {
            return;
        }

        const loadFlowers = async () => {
            try {
                setLoading(true);
                setFlowers([]);
                setOrderCount(0);

                const res = await DashboardService.getDailySaleFlowers(dailySale.sale_date);

                if (res.status === 200) {
                    setFlowers(res.data.flowers ?? []);
                    setOrderCount(res.data.order_count ?? 0);
                }
            } catch (error) {
                console.error("Error loading daily sale flowers:", error);
            } finally {
                setLoading(false);
            }
        };

        loadFlowers();
    }, [isOpen, dailySale?.sale_date]);

    if (!isOpen || !dailySale) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <h1 className="yb-modal-title">Daily sale details</h1>
            <p className="mb-1 text-sm text-[#4a4541]">
                Flowers sold from completed orders on this date.
            </p>
            <div className="mb-4 rounded-md border border-[#2d2926]/10 bg-[#faf8f6] px-3 py-2">
                <p className="font-medium text-[#2d2926]">
                    {formatSaleDate(dailySale.sale_date)}
                </p>
                <p className="text-xs text-[#4a4541]">{dailySale.sale_date}</p>
                <p className="mt-2 text-sm text-[#4a4541]">
                    Total amount: ₱{parseFloat(String(dailySale.amount)).toFixed(2)}
                </p>
                <p className="text-sm text-[#4a4541]">
                    Completed orders: {orderCount}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Spinner size="md" />
                </div>
            ) : flowers.length > 0 ? (
                <div className="yb-table-wrap">
                    <Table>
                        <TableHeader className="yb-table-head">
                            <TableRow>
                                <TableCell isHeader className="px-3 py-2 text-start">
                                    Flower
                                </TableCell>
                                <TableCell isHeader className="px-3 py-2 text-center">
                                    Qty
                                </TableCell>
                                <TableCell isHeader className="px-3 py-2 text-end">
                                    Subtotal
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="yb-table-body divide-y divide-[#2d2926]/10">
                            {flowers.map((flower) => (
                                <TableRow key={flower.flower_id} className="yb-table-row">
                                    <TableCell className="px-3 py-2 text-start">
                                        {flower.flower_name}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-center">
                                        {flower.total_quantity}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-end">
                                        ₱{parseFloat(String(flower.line_total)).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="py-6 text-center text-sm text-[#4a4541]">
                    No flowers from completed orders on this date. If orders were changed
                    away from Completed, this day is removed from daily sales until they
                    are completed again.
                </p>
            )}

            <div className="mt-4 flex justify-end">
                <CloseButton label="Close" onClose={onClose} />
            </div>
        </Modal>
    );
};

export default ViewDailySaleFormModal;
