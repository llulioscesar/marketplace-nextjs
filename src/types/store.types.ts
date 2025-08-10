import { Store, Product, User } from '@prisma/client';

export type StoreWithBusiness = Store & {
  business: Pick<User, 'name'>;
};

export type StoreWithProducts = Store & {
  business: Pick<User, 'name'>;
  products: Product[];
};

export type StoreWithProductCount = Store & {
  business: Pick<User, 'name'>;
  _count: {
    products: number;
  };
};

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedStoresResponse {
  stores: StoreWithProductCount[];
  pagination: PaginationInfo;
}