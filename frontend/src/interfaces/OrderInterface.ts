export type OrderStatus = 'Pending' | 'Confirmed' | 'Ready' | 'Completed' | 'Cancelled';

export const NON_DELETABLE_ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Ready'];

export function canDeleteOrder(status: OrderStatus): boolean {
    return !NON_DELETABLE_ORDER_STATUSES.includes(status);
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
