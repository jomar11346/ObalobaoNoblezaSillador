export interface OrderColumns {
    order_id: number;
    customer_id: number;
    total_amount: number;
    status: 'Pending' | 'Confirmed' | 'Ready' | 'Completed' | 'Cancelled';
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
