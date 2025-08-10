import { Product, Store, User } from '@prisma/client';

export type ProductWithStore = Product & {
  store: Store & {
    business: Pick<User, 'name'>;
  };
};

export interface ProductFilters {
  storeId?: string;
  isActive?: boolean;
  hasStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ProductCreateData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  storeId: string;
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
}