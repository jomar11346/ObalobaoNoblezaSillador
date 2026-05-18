import { useEffect, useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import SubmitButton from "../../../components/Button/SubmitButton";
import CloseButton from "../../../components/Button/CloseButton";
import OrderService from "../../../Services/OrderService";
import CustomerService from "../../../Services/CustomerService";
import FlowerService from "../../../Services/FlowerService";
import type { OrderFieldErrors } from "../../../interfaces/OrderInterface";
import type { CustomerColumns } from "../../../interfaces/CustomerInterface";
import type { FlowerColumns } from "../../../interfaces/FlowerInterface";

interface AddOrderFormModalProps {
    onOrderAdded: (message: string) => void;
    refreshKey?: () => void;
    isOpen: boolean;
    onClose: () => void;
}

interface OrderItem {
    flower_id: number;
    quantity: number;
    price: number;
    flower_name: string;
}

const AddOrderFormModal: FC<AddOrderFormModalProps> = ({ 
    onOrderAdded, 
    refreshKey,
    isOpen, 
    onClose
}) => {
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingFlowers, setLoadingFlowers] = useState(false);
    const [loadingStore, setLoadingStore] = useState(false);
    const [customers, setCustomers] = useState<CustomerColumns[]>([]);
    const [flowers, setFlowers] = useState<FlowerColumns[]>([]);
    const [customerId, setCustomerId] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedFlowerId, setSelectedFlowerId] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState("");
    const [errors, setErrors] = useState<OrderFieldErrors>({});

    const handleLoadCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const res = await CustomerService.loadCustomers(1);
            if (res.status === 200) {
                setCustomers(res.data.customers.data || res.data.customers || []);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handleLoadFlowers = async () => {
        try {
            setLoadingFlowers(true);
            const res = await FlowerService.loadFlowers();
            if (res.status === 200) {
                setFlowers(res.data.flowers.filter((f: FlowerColumns) => f.stock_quantity > 0));
            }
        } catch (error) {
            console.error('Error loading flowers:', error);
        } finally {
            setLoadingFlowers(false);
        }
    };

    const handleAddOrderItem = () => {
        if (!selectedFlowerId || !selectedQuantity) return;
        
        const flower = flowers.find(f => f.flower_id === Number(selectedFlowerId));
        if (!flower) return;

        const quantity = Number(selectedQuantity);
        if (quantity > flower.stock_quantity) {
            alert(`Insufficient stock. Only ${flower.stock_quantity} available.`);
            return;
        }

        const existingItem = orderItems.find(item => item.flower_id === Number(selectedFlowerId));
        if (existingItem) {
            setOrderItems(orderItems.map(item => 
                item.flower_id === Number(selectedFlowerId)
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setOrderItems([...orderItems, {
                flower_id: Number(selectedFlowerId),
                quantity,
                price: flower.price,
                flower_name: flower.name
            }]);
        }

        setSelectedFlowerId("");
        setSelectedQuantity("");
    };

    const handleRemoveOrderItem = (flowerId: number) => {
        setOrderItems(orderItems.filter(item => item.flower_id !== flowerId));
    };

    const handleStoreOrder = async (e: FormEvent) => {
        try {
            e.preventDefault();
            const validationErrors: OrderFieldErrors = {};

            if (!customerId.trim()) validationErrors.customer_id = ["The customer field is required."];
            if (!orderDate.trim()) validationErrors.order_date = ["The order date field is required."];
            if (orderItems.length === 0) validationErrors.items = ["At least one item is required."];

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            setLoadingStore(true);
            setErrors({});

            const formData = new FormData();
            formData.append('customer_id', customerId);
            formData.append('order_date', orderDate);
            orderItems.forEach((item, index) => {
                formData.append(`items[${index}][flower_id]`, String(item.flower_id));
                formData.append(`items[${index}][quantity]`, String(item.quantity));
            });

            const res = await OrderService.storeOrder(formData);

            if (res.status === 200) {
                onOrderAdded(res.data.message);
                setCustomerId("");
                setOrderDate("");
                setOrderItems([]);
                setErrors({});
                refreshKey?.();
                onClose();
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data?.errors);
            } else {
                console.error('Error storing order:', error);
            }
        } finally {
            setLoadingStore(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            handleLoadCustomers();
            handleLoadFlowers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setCustomerId("");
            setOrderDate("");
            setOrderItems([]);
            setErrors({});
        }
    }, [isOpen]);

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
         <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleStoreOrder} noValidate>
                <h1 className="yb-modal-title">
                    Add Order Form
                </h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer
                    </label>
                    <select
                        name="customer_id"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Customer</option>
                        {loadingCustomers ? (
                            <option value="" disabled>Loading...</option>
                        ) : (
                            customers.map((customer) => (
                                <option value={customer.customer_id} key={customer.customer_id}>
                                    {customer.name}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.customer_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.customer_id[0]}</p>
                    )}
                </div>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Order Date"
                        type="date"
                        name="order_date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        required
                        errors={errors.order_date}
                    />
                </div>
                <div className="mb-4 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold mb-2">Add Items</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Flower
                            </label>
                            <select
                                value={selectedFlowerId}
                                onChange={(e) => setSelectedFlowerId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Flower</option>
                                {loadingFlowers ? (
                                    <option value="" disabled>Loading...</option>
                                ) : (
                                    flowers.map((flower) => (
                                        <option value={flower.flower_id} key={flower.flower_id}>
                                            {flower.name} (Stock: {flower.stock_quantity}) - ₱{parseFloat(String(flower.price)).toFixed(2)}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={selectedQuantity}
                                onChange={(e) => setSelectedQuantity(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleAddOrderItem}
                                className="yb-btn-primary w-full"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
                {orderItems.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                        <div className="border border-gray-200 rounded-md">
                            {orderItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-medium">{item.flower_name}</p>
                                        <p className="text-sm text-gray-500">₱{parseFloat(String(item.price)).toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold">₱{parseFloat(String(item.price * item.quantity)).toFixed(2)}</p>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOrderItem(item.flower_id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center p-3 bg-gray-50 font-semibold">
                                <p>Total Amount:</p>
                                <p>₱{parseFloat(String(totalAmount)).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                )}
                {errors.items && (
                    <p className="text-red-500 text-sm mb-4">{errors.items[0]}</p>
                )}
                <div className="flex justify-end gap-2">
                    {!loadingStore && (
                        <CloseButton label="Close" onClose={onClose} />
                    )}
                    <SubmitButton label="Create Order" loading={loadingStore} loadingLabel="Creating Order..." />
                </div>
            </form>
         </Modal>
        </>
    );
};

export default AddOrderFormModal;
