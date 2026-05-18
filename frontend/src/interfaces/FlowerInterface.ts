export interface FlowerColumns {
    flower_id: number;
    name: string;
    price: number;
    stock_quantity: number;
    description?: string;
    image?: string;
    category: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}


export interface FlowerFieldErrors {
  name?: string[];
  price?: string[];
  stock_quantity?: string[];
  description?: string[];
  image?: string[];
  category?: string[];
}
