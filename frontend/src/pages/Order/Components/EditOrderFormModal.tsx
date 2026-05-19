import { useEffect, useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import Modal from "../../../components/Modal";
import OrderService from "../../../Services/OrderService";
import type { OrderColumns } from "../../../interfaces/OrderInterface";

interface EditOrderFormModalProps {
    order: OrderColumns | null
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
    const [loadingUpdate, setLoadingUpdate] = useState(false)
    const [status, setStatus] = useState("")

    const handleUpdateOrderStatus = async (e: FormEvent) => {
        e.preventDefault()
        try{
            setLoadingUpdate(true)

            const formData = new FormData()
            formData.append('status', status);

            const res = await OrderService.updateOrderStatus(order?.order_id!, formData);

            if(res.status === 200) {
                setStatus(res.data.order.status)
                onOrderUpdated(res.data.message)
                refreshKey();
            } else {
                console.error(
                    "Unexpected status error occurred during updating order:", 
                    res.status
                );
            }
        } catch(error: any) {
            const message = error.response?.data?.message;
            if (error.response?.status === 400 && message) {
                onOrderUpdated(message);
            } else {
                console.error(
                    "Unexpected server error occurred during updating order:", 
                    error
                );
            }
        } finally {
            setLoadingUpdate(false);
        }
    }

useEffect(() => {
    if (isOpen) {
        if (order) {
            setStatus(order.status);
        }
    }
}, [isOpen, order]);

  return (
    <>
     <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleUpdateOrderStatus}>
                <h1 className="yb-modal-title">
                    Update Order Status
                </h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Status: <span className="font-semibold">{order?.status}</span>
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
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2">
                    {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
                    <SubmitButton 
                    label="Update Status" 
                    loading={loadingUpdate} 
                    loadingLabel="Updating Status..." 
                    />
                </div>
            </form>
        </Modal>
    </>
  )
}

export default EditOrderFormModal
