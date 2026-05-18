export interface CustomerColumns {
    customer_id: number;
    name: string;
    contact: string;
    address: string;
    email?: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}


export interface CustomerFieldErrors {
  name?: string[];
  contact?: string[];
  address?: string[];
  email?: string[];
}
