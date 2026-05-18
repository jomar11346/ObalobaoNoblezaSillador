import type { FC, FormEvent } from "react";
import Modal from "../../../components/Modal";
import type { OrderColumns } from "../../../interfaces/OrderInterface";
import { useEffect, useState } from "react";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import OrderService from "../../../Services/OrderService";

interface DeleteOrderFormModalProps {
    order: OrderColumns | null;
    onOrderDeleted: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteOrderFormModal: FC<DeleteOrderFormModalProps> = ({
    order,
    onOrderDeleted,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingDestroy, setLoadingDestroy] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [status, setStatus] = useState("");
    const [orderDate, setOrderDate] = useState("");

    const handleDestroyOrder = async (e: FormEvent) => {
        try {
        e.preventDefault();
        setLoadingDestroy(true);
        
        const res = await OrderService.destroyOrder(order?.order_id!);
        
        if (res.status === 200) {
            onOrderDeleted(res.data.message)
            refreshKey()
            onClose();
        } else {
            console.error("Unexpected status error occurred during order deletion: ",
             res.status);
        }
    } catch (error) {
        console.error("Unexpected server error occurred during deleting order: ", error);
    } finally {
        setLoadingDestroy(false);
    }
};

    useEffect(() => {
    if (isOpen) {
        if (order) {
            setOrderId(String(order.order_id));
            setCustomerName(order.customer?.name || "");
            setTotalAmount(String(order.total_amount));
            setStatus(order.status);
            setOrderDate(order.order_date);
        }
    }                   
}, [isOpen, order]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDestroyOrder}>
                <h1 className="yb-modal-title">
                    Delete Order Form
                </h1>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">
                                Order ID
                            </label>
                            <p className="text-gray-500 font-medium">#{orderId}</p>
                        </div>
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">
                                Customer
                            </label>
                            <p className="text-gray-500 font-medium">{customerName}</p>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">
                                Total Amount
                            </label>
                            <p className="text-gray-500 font-medium">₱{parseFloat(totalAmount).toFixed(2)}</p>
                        </div>
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">
                                Status
                            </label>
                            <p className="text-gray-500 font-medium">{status}</p>
                        </div>
                        <div className="mb-4">
                            <label className="text-black font-medium mb-2">
                                Order Date
                            </label>
                            <p className="text-gray-500 font-medium">{orderDate}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    {!loadingDestroy && <CloseButton label="Close" onClose={onClose} />}
                    <SubmitButton
                        className="bg-red-600 hover:bg-red-700"
                        label="Delete Order"
                        loading={loadingDestroy}
                        loadingLabel="Deleting Order..."
                    />
                </div>
            </form>
        </Modal>
    );
};

export default DeleteOrderFormModal;
