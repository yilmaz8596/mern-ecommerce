export interface LoginProps {
  email: string;
  password: string;
}

export interface SignupProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Category {
  id?: number;
  href: string;
  name: string;
  imageUrl: string;
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  countInStock?: number;
  isFeatured?: boolean;
}

export interface Cart extends Product {
  _id?: string;
  product: Product;
  quantity: number;
}
