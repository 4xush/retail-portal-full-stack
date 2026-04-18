export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  productCount?: number;
}

export interface Product {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  images?: string[];
  cost: number;
  taxPercent: number;
  stock: number;
  isActive?: boolean;
  tags?: string[];
  category?: Category | string;
  addOns?: Product[];
  combos?: Product[];
  score?: number;
}

export interface OrderItem {
  product: string;
  qty: number;
  snapshot: {
    title: string;
    cost: number;
    taxPercent: number;
    image: string;
  };
}

export interface Order {
  id?: string;
  _id?: string;
  user?: string;
  items: OrderItem[];
  discountCode?: string;
  discountAmount: number;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt?: string;
}

export interface CartAddOn {
  productId: string;
  title: string;
  cost: number;
  taxPercent: number;
}

export interface CartItem {
  productId: string;
  title: string;
  image: string;
  cost: number;
  taxPercent: number;
  qty: number;
  addOns: CartAddOn[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number };
}

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; status: number };
}
