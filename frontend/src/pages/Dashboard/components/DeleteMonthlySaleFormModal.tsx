import type { FC, FormEvent } from "react";
import Modal from "../../../components/Modal";
import type { MonthlySaleColumns } from "../../../interfaces/DailySaleInterface";
import { useEffect, useState } from "react";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import DashboardService from "../../../Services/DashboardService";
import axios from "axios";

interface DeleteMonthlySaleFormModalProps {
    monthlySale: MonthlySaleColumns | null;
    onMonthlySaleDeleted: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteMonthlySaleFormModal: FC<DeleteMonthlySaleFormModalProps> = ({
    monthlySale,
    onMonthlySaleDeleted,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingDestroy, setLoadingDestroy] = useState(false);
    const [label, setLabel] = useState("");
    const [yearMonth, setYearMonth] = useState("");
    const [orderCount, setOrderCount] = useState("");
    const [amount, setAmount] = useState("");

    const handleDestroyMonthlySale = async (e: FormEvent) => {
        e.preventDefault();

        if (!monthlySale?.year_month) {
            return;
        }

        try {
            setLoadingDestroy(true);

            const res = await DashboardService.destroyMonthlySale(monthlySale.year_month);

            if (res.status === 200) {
                onMonthlySaleDeleted(res.data.message);
                refreshKey();
                onClose();
            } else {
                console.error(
                    "Unexpected status error occurred during monthly sale deletion: ",
                    res.status,
                );
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                onMonthlySaleDeleted(error.response.data.message);
                if (error.response.status === 404) {
                    onClose();
                }
            } else {
                console.error(
                    "Unexpected server error occurred during deleting monthly sale: ",
                    error,
                );
            }
        } finally {
            setLoadingDestroy(false);
        }
    };

    useEffect(() => {
        if (isOpen && monthlySale) {
            setLabel(monthlySale.label);
            setYearMonth(monthlySale.year_month);
            setOrderCount(String(monthlySale.order_count));
            setAmount(String(monthlySale.amount));
        }
    }, [isOpen, monthlySale]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDestroyMonthlySale}>
                <h1 className="yb-modal-title">Delete Monthly Sale Form</h1>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Month</label>
                            <p className="text-gray-500 font-medium">{label}</p>
                        </div>
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Period</label>
                            <p className="text-gray-500 font-medium">{yearMonth}</p>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Orders</label>
                            <p className="text-gray-500 font-medium">{orderCount}</p>
                        </div>
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Amount</label>
                            <p className="text-gray-500 font-medium">
                                ₱{parseFloat(amount || "0").toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    {!loadingDestroy && <CloseButton label="Close" onClose={onClose} />}
                    <SubmitButton
                        className="bg-red-600 hover:bg-red-700"
                        label="Delete Monthly Sale"
                        loading={loadingDestroy}
                        loadingLabel="Deleting Monthly Sale..."
                    />
                </div>
            </form>
        </Modal>
    );
};

export default DeleteMonthlySaleFormModal;
