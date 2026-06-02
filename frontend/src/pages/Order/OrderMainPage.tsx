import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddOrderFormModal from "./Components/AddOrderFormModal";
import DeleteOrderFormModal from "./Components/DeleteOrderFormModal";
import EditOrderFormModal from "./Components/EditOrderFormModal";
import OrderList from "./Components/OrderList";
import type { OrderColumns } from "../../interfaces/OrderInterface";
import PageHeader from "../../components/Brand/PageHeader";

const OrderMainPage = () => {
    const { 
        isOpen: isAddOrderFormModalOpen, 
        openModal: openAddOrderFormModal, 
        closeModal: closeAddOrderFormModal, 
    } = useModal(false);

    const { 
        isOpen: isEditOrderFormModalOpen, 
        selectedItem: selectedOrderForEdit, 
        openModal: openEditOrderFormModal, 
        closeModal: closeEditOrderFormModal,
    } = useModal<OrderColumns>(false);
    const { 
        isOpen: isDeleteOrderFormModalOpen, 
        selectedItem: selectedOrderForDelete, 
        openModal: openDeleteOrderFormModal, 
        closeModal: closeDeleteOrderFormModal,
    } = useModal<OrderColumns>(false);

    const { 
        message: toastMessage, 
        isVisible: toastMessageIsVisible, 
        showToastMessage, 
        closeToastMessage, 
    } = useToastMessage("", false, false);

    const { refresh, handleRefresh } = useRefresh(false);

    return (
        <>
            <ToastMessage
             message={toastMessage}
             isVisible={toastMessageIsVisible}
             onClose={closeToastMessage}
            />
            <PageHeader title="Orders" subtitle="Create bouquets, track status, and manage fulfillment." />
            <AddOrderFormModal
             onOrderAdded={showToastMessage}
             refreshKey={handleRefresh}
             isOpen={isAddOrderFormModalOpen}
             onClose={closeAddOrderFormModal} 
            />
            <EditOrderFormModal
             order={selectedOrderForEdit} 
             onOrderUpdated={showToastMessage} 
             refreshKey={handleRefresh} 
             isOpen={isEditOrderFormModalOpen} 
             onClose={closeEditOrderFormModal}
            />
            <DeleteOrderFormModal 
            order={selectedOrderForDelete} 
            onOrderDeleted={showToastMessage} 
            refreshKey={handleRefresh}
            isOpen={isDeleteOrderFormModalOpen} 
            onClose={closeDeleteOrderFormModal}
            />
            <OrderList
             onAddOrder={openAddOrderFormModal} 
             onEditOrder={(order) => openEditOrderFormModal(order)}
            onDeleteOrder={(order) => openDeleteOrderFormModal(order)}
             onNotify={showToastMessage}
             refreshKey={refresh} 
            />
        </>
    );
};

export default OrderMainPage;
