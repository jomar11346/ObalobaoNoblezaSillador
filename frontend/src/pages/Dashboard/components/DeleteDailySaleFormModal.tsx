import type { FC, FormEvent } from "react";
import Modal from "../../../components/Modal";
import {
    canDeleteDailySale,
    isAutoSyncedDailySale,
    type DailySaleColumns,
} from "../../../interfaces/DailySaleInterface";
import { useEffect, useState } from "react";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import DashboardService from "../../../Services/DashboardService";
import axios from "axios";

interface DeleteDailySaleFormModalProps {
    dailySale: DailySaleColumns | null;
    onDailySaleDeleted: (message: string) => void;
    refreshKey: () => void;
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

const DeleteDailySaleFormModal: FC<DeleteDailySaleFormModalProps> = ({
    dailySale,
    onDailySaleDeleted,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingDestroy, setLoadingDestroy] = useState(false);
    const [saleDate, setSaleDate] = useState("");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [source, setSource] = useState("");

    const dailySaleCanBeDeleted = dailySale ? canDeleteDailySale(dailySale) : false;

    const handleDestroyDailySale = async (e: FormEvent) => {
        e.preventDefault();

        if (!dailySale?.daily_sale_id || !dailySaleCanBeDeleted) {
            return;
        }

        try {
            setLoadingDestroy(true);

            const res = await DashboardService.destroyDailySale(dailySale.daily_sale_id);

            if (res.status === 200) {
                onDailySaleDeleted(res.data.message);
                refreshKey();
                onClose();
            } else {
                console.error(
                    "Unexpected status error occurred during daily sale deletion: ",
                    res.status,
                );
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                onDailySaleDeleted(error.response.data.message);
                if (error.response.status === 403) {
                    onClose();
                }
            } else {
                console.error(
                    "Unexpected server error occurred during deleting daily sale: ",
                    error,
                );
            }
        } finally {
            setLoadingDestroy(false);
        }
    };

    useEffect(() => {
        if (isOpen && dailySale) {
            setSaleDate(dailySale.sale_date);
            setAmount(String(dailySale.amount));
            setNotes(dailySale.notes?.trim() || "—");
            setSource(isAutoSyncedDailySale(dailySale) ? "Auto" : "Manual");
        }
    }, [isOpen, dailySale]);

    if (isOpen && dailySale && !dailySaleCanBeDeleted) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
                <h1 className="yb-modal-title">Delete Daily Sale Form</h1>
                <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    Auto-synced sales from completed orders cannot be deleted. Delete or update
                    the related orders instead.
                </p>
                <div className="flex justify-end gap-2">
                    <CloseButton label="Close" onClose={onClose} />
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDestroyDailySale}>
                <h1 className="yb-modal-title">Delete Daily Sale Form</h1>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Sale Date</label>
                            <p className="text-gray-500 font-medium">{formatSaleDate(saleDate)}</p>
                            <p className="text-xs text-gray-400">{saleDate}</p>
                        </div>
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Source</label>
                            <p className="text-gray-500 font-medium">{source}</p>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Amount</label>
                            <p className="text-gray-500 font-medium">
                                ₱{parseFloat(amount || "0").toFixed(2)}
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">Notes</label>
                            <p className="text-gray-500 font-medium">{notes}</p>
                        </div>
                    </div>
                </div>
                {!dailySaleCanBeDeleted && (
                    <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        Auto-synced sales from completed orders cannot be deleted. Delete or
                        update the related orders instead.
                    </p>
                )}
                <div className="flex justify-end gap-2">
                    {!loadingDestroy && <CloseButton label="Close" onClose={onClose} />}
                    {dailySaleCanBeDeleted && (
                        <SubmitButton
                            className="bg-red-600 hover:bg-red-700"
                            label="Delete Daily Sale"
                            loading={loadingDestroy}
                            loadingLabel="Deleting Daily Sale..."
                        />
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default DeleteDailySaleFormModal;
