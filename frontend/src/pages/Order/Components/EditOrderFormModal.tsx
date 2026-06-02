import { useEffect, useMemo, useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import Modal from "../../../components/Modal";
import OrderService from "../../../Services/OrderService";
import {
    formatOrderDate,
    getOrderItems,
    ORDER_STATUSES,
    type OrderColumns,
} from "../../../interfaces/OrderInterface";

interface EditOrderFormModalProps {
    order: OrderColumns | null;
    onOrderUpdated: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const EditOrderFormModal: FC<EditOrderFormModalProps> = ({
    order,
    onOrderUpdated,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [status, setStatus] = useState("");

    const orderItems = useMemo(() => getOrderItems(order), [order]);

    const handleUpdateOrderStatus = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoadingUpdate(true);

            const formData = new FormData();
            formData.append("status", status);

            const res = await OrderService.updateOrderStatus(order?.order_id!, formData);

            if (res.status === 200) {
                setStatus(res.data.order.status);
                onOrderUpdated(res.data.message);
                refreshKey();
                onClose();
            } else {
                console.error(
                    "Unexpected status error occurred during updating order:",
                    res.status,
                );
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            const message = err.response?.data?.message;
            if (err.response?.status === 400 && message) {
                onOrderUpdated(message);
            } else {
                console.error(
                    "Unexpected server error occurred during updating order:",
                    error,
                );
            }
        } finally {
            setLoadingUpdate(false);
        }
    };

    useEffect(() => {
        if (isOpen && order) {
            setStatus(order.status);
        }
    }, [isOpen, order]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleUpdateOrderStatus}>
                <h1 className="yb-modal-title">Update Order Status</h1>

                <div className="mb-4 grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <label className="text-black font-medium mb-2 block">Order ID</label>
                        <p className="text-gray-500 font-medium">#{order?.order_id}</p>
                    </div>
                    <div>
                        <label className="text-black font-medium mb-2 block">Customer</label>
                        <p className="text-gray-500 font-medium">{order?.customer?.name || "—"}</p>
                    </div>
                    <div>
                        <label className="text-black font-medium mb-2 block">Order Date</label>
                        <p className="text-gray-500 font-medium">
                            {formatOrderDate(order?.order_date)}
                        </p>
                    </div>
                    <div>
                        <label className="text-black font-medium mb-2 block">Total Amount</label>
                        <p className="text-gray-500 font-medium">
                            ₱{parseFloat(String(order?.total_amount ?? 0)).toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="mb-4 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                    {orderItems.length > 0 ? (
                        <div className="border border-gray-200 rounded-md bg-gray-50/50">
                            {orderItems.map((item) => (
                                <div
                                    key={item.order_item_id}
                                    className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium text-[#2d2926]">
                                            {item.flower?.name || `Flower #${item.flower_id}`}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ₱{parseFloat(String(item.price)).toFixed(2)} ×{" "}
                                            {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-[#2d2926]">
                                        ₱
                                        {(
                                            parseFloat(String(item.price)) * Number(item.quantity)
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No items found for this order.</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Status:{" "}
                        <span className="font-semibold">{order?.status}</span>
                    </label>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {ORDER_STATUSES.map((orderStatus) => (
                            <option key={orderStatus} value={orderStatus}>
                                {orderStatus}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
                    <SubmitButton
                        label="Update Status"
                        loading={loadingUpdate}
                        loadingLabel="Updating Status..."
                    />
                </div>
            </form>
        </Modal>
    );
};

export default EditOrderFormModal;
