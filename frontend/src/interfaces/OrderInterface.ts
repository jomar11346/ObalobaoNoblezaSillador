export type OrderStatus = 'Pending' | 'Confirmed' | 'Ready' | 'Completed' | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Ready',
    'Completed',
    'Cancelled',
];

export const NON_DELETABLE_ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Ready'];

export function getOrderItems(order: Pick<OrderColumns, 'orderItems' | 'order_items'> | null | undefined) {
    return order?.order_items ?? order?.orderItems ?? [];
}

export function canDeleteOrder(status: OrderStatus): boolean {
    return !NON_DELETABLE_ORDER_STATUSES.includes(status);
}

export function getMinOrderDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function isOrderDateInPast(orderDate: string): boolean {
    const value = orderDate.trim().slice(0, 10);
    if (!value) {
        return false;
    }
    return value < getMinOrderDate();
}

export function formatOrderDate(orderDate: string | null | undefined): string {
    if (!orderDate?.trim()) {
        return "—";
    }

    const value = orderDate.trim();

    if (value.includes("T")) {
        return value.split("T")[0];
    }

    return value.slice(0, 10);
}

export interface OrderColumns {
    order_id: number;
    customer_id: number;
    total_amount: number;
    status: OrderStatus;
    order_date: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    customer?: any;
    orderItems?: OrderItem[];
    order_items?: OrderItem[];
}


export interface OrderItem {
    order_item_id: number;
    order_id: number;
    flower_id: number;
    quantity: number;
    price: number;
    flower?: any;
}


export interface OrderFieldErrors {
  customer_id?: string[];
  order_date?: string[];
  items?: string[];
}
