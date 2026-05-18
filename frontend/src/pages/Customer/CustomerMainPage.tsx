import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import AddCustomerFormModal from "./Components/AddCustomerFormModal";
import DeleteCustomerFormModal from "./Components/DeleteCustomerFormModal";
import EditCustomerFormModal from "./Components/EditCustomerFormModal";
import CustomerList from "./Components/CustomerList";
import type { CustomerColumns } from "../../interfaces/CustomerInterface";
import PageHeader from "../../components/Brand/PageHeader";

const CustomerMainPage = () => {
    const { 
        isOpen: isAddCustomerFormModalOpen, 
        openModal: openAddCustomerFormModal, 
        closeModal: closeAddCustomerFormModal, 
    } = useModal(false);

    const { 
        isOpen: isEditCustomerFormModalOpen, 
        selectedItem: selectedCustomerForEdit, 
        openModal: openEditCustomerFormModal, 
        closeModal: closeEditCustomerFormModal,
    } = useModal<CustomerColumns>(false);
    const { 
        isOpen: isDeleteCustomerFormModalOpen, 
        selectedItem: selectedCustomerForDelete, 
        openModal: openDeleteCustomerFormModal, 
        closeModal: closeDeleteCustomerFormModal,
    } = useModal<CustomerColumns>(false);

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
            <PageHeader title="Customers" subtitle="Keep contact details and delivery addresses on file." />
            <AddCustomerFormModal
             onCustomerAdded={showToastMessage}
             refreshKey={handleRefresh}
             isOpen={isAddCustomerFormModalOpen}
             onClose={closeAddCustomerFormModal} 
            />
            <EditCustomerFormModal
             customer={selectedCustomerForEdit} 
             onCustomerUpdated={showToastMessage} 
             refreshKey={handleRefresh} 
             isOpen={isEditCustomerFormModalOpen} 
             onClose={closeEditCustomerFormModal}
            />
            <DeleteCustomerFormModal 
            customer={selectedCustomerForDelete} 
            onCustomerDeleted={showToastMessage} 
            refreshKey={handleRefresh}
            isOpen={isDeleteCustomerFormModalOpen} 
            onClose={closeDeleteCustomerFormModal}
            />
            <CustomerList
             onAddCustomer={openAddCustomerFormModal} 
             onEditCustomer={(customer) => openEditCustomerFormModal(customer)}
            onDeleteCustomer={(customer) => openDeleteCustomerFormModal(customer)} 
             refreshKey={refresh} 
            />
        </>
    );
};

export default CustomerMainPage;
