import { useEffect, useState, type FC, type FormEvent, type ChangeEvent } from "react";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import CustomerService from "../../../Services/CustomerService";
import type { CustomerColumns, CustomerFieldErrors } from "../../../interfaces/CustomerInterface";

interface EditCustomerFormModalProps {
    customer: CustomerColumns | null
    onCustomerUpdated: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const EditCustomerFormModal: FC<EditCustomerFormModalProps> = ({
    customer,
    onCustomerUpdated,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingUpdate, setLoadingUpdate] = useState(false)
    const [name, setName] = useState("")
    const [contact, setContact] = useState("")
    const [address, setAddress] = useState("")
    const [email, setEmail] = useState("")
    const [errors, setErrors] = useState<CustomerFieldErrors>({})

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

    const handleUpdateCustomer = async (e: FormEvent) => {
        e.preventDefault()
        try{
            if (!customer?.customer_id) {
                console.error("Customer ID is missing.");
                return;
            }

            const validationErrors: CustomerFieldErrors = {};

            if (!name.trim()) validationErrors.name = ["The name field is required."];
            if (!contact.trim()) validationErrors.contact = ["The contact field is required."];
            if (!address.trim()) validationErrors.address = ["The address field is required."];

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            setLoadingUpdate(true)
            setErrors({});

           const formData = new FormData()
            formData.append("_method", "PUT");
            formData.append('name', name.trim());
            formData.append('contact', contact.trim());
            formData.append('address', address.trim());
            if (email.trim()) formData.append('email', email.trim());

            const res = await CustomerService.updateCustomer(customer.customer_id, formData);

            if(res.status === 200) {
                setName(res.data.customer.name);
                setContact(res.data.customer.contact);
                setAddress(res.data.customer.address);
                setEmail(res.data.customer.email ?? "");
                setErrors({});

                onCustomerUpdated(res.data.message)
                refreshKey();
                onClose();
            } else {
                console.error(
                    "Unexpected status error occurred during updating customer:", 
                    res.status
                );
            }
        } catch(error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(
                    "Unexpected server error occurred during updating customer:", 
                    error
                );
            }
        } finally {
            setLoadingUpdate(false);
        }
    }

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
    <>
     <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleUpdateCustomer} noValidate>
                <h1 className="yb-modal-title">
                    Edit Customer Form
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
                     value={address} onChange={handleInputChange} 
                     required 
                     errors={errors.address} 
                    />
                </div>
                <div className="mb-4">
                    <FloatingLabelInput
                     label="Email" 
                     type="text" 
                     name="email" 
                     value={email} onChange={handleInputChange} 
                     errors={errors.email} 
                    />
                </div>
                <div className="flex justify-end gap-2">
                    {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
                    <SubmitButton 
                    label="Update Customer" 
                    loading={loadingUpdate} 
                    loadingLabel="Updating Customer..." 
                    />
                </div>
            </form>
        </Modal>
    </>
  )
}

export default EditCustomerFormModal
