import type { FC, FormEvent } from "react";
import Modal from "../../../components/Modal";
import type { CustomerColumns } from "../../../interfaces/CustomerInterface";
import { useEffect, useState } from "react";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import CustomerService from "../../../Services/CustomerService";

interface DeleteCustomerFormModalProps {
    customer: CustomerColumns | null;
    onCustomerDeleted: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteCustomerFormModal: FC<DeleteCustomerFormModalProps> = ({
    customer,
    onCustomerDeleted,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingDestroy, setLoadingDestroy] = useState(false);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");

    const handleDestroyCustomer = async (e: FormEvent) => {
        try {
        e.preventDefault();
        setLoadingDestroy(true);
        
        const res = await CustomerService.destroyCustomer(customer?.customer_id!);
        
        if (res.status === 200) {
            onCustomerDeleted(res.data.message)
            refreshKey()
            onClose();
        } else {
            console.error("Unexpected status error occurred during customer deletion: ",
             res.status);
        }
    } catch (error) {
        console.error("Unexpected server error occurred during deleting customer: ", error);
    } finally {
        setLoadingDestroy(false);
    }
};

    useEffect(() => {
    if (isOpen) {
        if (customer) {
            setName(customer.name);
            setContact(customer.contact);
            setAddress(customer.address);
            setEmail(customer.email ?? "");
        } else {
            console.error(
                "Unexpected customer error occurred during getting customer details: ",
                customer
            );
        }
    }                   
}, [isOpen, customer]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDestroyCustomer}>
                <h1 className="yb-modal-title">
                    Delete Customer Form
                </h1>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                    {/* Left Column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label htmlFor="name" className="text-black font-medium mb-2">
                                Name
                            </label>
                            <p className="text-gray-500 font-medium">{name}</p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="contact" className="text-black font-medium mb-2">
                                Contact
                            </label>
                            <p className="text-gray-500 font-medium">{contact}</p>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <label htmlFor="address" className="text-black font-medium mb-2">
                                Address
                            </label>
                            <p className="text-gray-500 font-medium">{address}</p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="text-black font-medium mb-2">
                                Email
                            </label>
                            <p className="text-gray-500 font-medium">{email || "N/A"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    {!loadingDestroy && <CloseButton label="Close" onClose={onClose} />}
                    <SubmitButton
                        className="bg-red-600 hover:bg-red-700"
                        label="Delete Customer"
                        loading={loadingDestroy}
                        loadingLabel="Deleting Customer..."
                    />
                </div>
            </form>
        </Modal>
    );
};

export default DeleteCustomerFormModal;
