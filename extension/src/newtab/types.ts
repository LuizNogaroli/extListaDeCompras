export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  productId: string;
  name: string;
  url: string | null;
  price: number | null;
  notes: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  estimatedPrice: number | null;
  purchased: boolean;
  categoryId: string | null;
  category: Category | null;
  suppliers: Supplier[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInput {
  name: string;
  url?: string;
  price?: number;
  notes?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  estimatedPrice?: number;
  categoryId?: string;
  suppliers?: SupplierInput[];
}
