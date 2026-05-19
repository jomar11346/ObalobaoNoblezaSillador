export interface FlowerColumns {
    flower_id: number;
    name: string;
    price: number;
    stock_quantity: number;
    image?: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}


export interface FlowerFieldErrors {
  name?: string[];
  price?: string[];
  stock_quantity?: string[];
  image?: string[];
}
