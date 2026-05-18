import { useEffect, useState, type FC, type FormEvent, type ChangeEvent } from "react";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import SubmitButton from "../../../components/Button/SubmitButton";
import CloseButton from "../../../components/Button/CloseButton";
import CustomerService from "../../../Services/CustomerService";
import type { CustomerFieldErrors } from "../../../interfaces/CustomerInterface";

interface AddCustomerFormModalProps {
    onCustomerAdded: (message: string) => void;
    refreshKey?: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const AddCustomerFormModal: FC<AddCustomerFormModalProps> = ({ 
    onCustomerAdded, 
    refreshKey,
    isOpen, 
    onClose
}) => {
    const [loadingStore, setLoadingStore] = useState(false);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<CustomerFieldErrors>({});

    const clearFieldError = (field: keyof CustomerFieldErrors) => {
        if (errors[field]?.length) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: undefined,
            }));
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "name") setName(value);
        if (name === "contact") setContact(value);
        if (name === "address") setAddress(value);
        if (name === "email") setEmail(value);

        clearFieldError(name as keyof CustomerFieldErrors);
    };

    const handleStoreCustomer = async (e: FormEvent) => {
        try {
            e.preventDefault();
            const validationErrors: CustomerFieldErrors = {};

            if (!name.trim()) validationErrors.name = ["The name field is required."];
            if (!contact.trim()) validationErrors.contact = ["The contact field is required."];
            if (!address.trim()) validationErrors.address = ["The address field is required."];

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            setLoadingStore(true);
            setErrors({});

            const formData = new FormData()
            formData.append('name', name);
            formData.append('contact', contact);
            formData.append('address', address);
            if (email) formData.append('email', email);

            const res = await CustomerService.storeCustomer(formData);

            if (res.status === 200) {
             onCustomerAdded(res.data.message);
             setName("");
             setContact("");
             setAddress("");
             setEmail("");
             setErrors({});
             refreshKey?.();
            } else {
                console.error(
                    "Unexpected status error occurred during adding customer:", 
                    res.status
                );
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data?.errors);
            } else {
                console.log(
                    "Unexpected server error occurred during adding customer:", 
                    error
                );
            }
        } finally {
            setLoadingStore(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setContact("");
            setAddress("");
            setEmail("");
            setErrors({});
        }
    }, [isOpen]);

    return (
        <>
         <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleStoreCustomer} noValidate>
                <h1 className="yb-modal-title">
                    Add Customer Form
                </h1>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Name"
                        type="text"
                        name="name"
                        value={name}
                        onChange={handleInputChange}
                        required
                        autoFocus
                        errors={errors.name}
                    />
                </div>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Contact"
                        type="text"
                        name="contact"
                        value={contact}
                        onChange={handleInputChange}
                        required
                        errors={errors.contact}
                    />
                </div>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Address"
                        type="text"
                        name="address"
                        value={address}
                        onChange={handleInputChange}
                        required
                        errors={errors.address}
                    />
                </div>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Email"
                        type="text"
                        name="email"
                        value={email}
                        onChange={handleInputChange}
                        errors={errors.email}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    {!loadingStore && (
                        <CloseButton label="Close" onClose={onClose} />
                    )}
                    <SubmitButton label="Save Customer" loading={loadingStore} loadingLabel="Saving Customer..." />
                </div>
            </form>
         </Modal>
        </>
    );
};

export default AddCustomerFormModal;
