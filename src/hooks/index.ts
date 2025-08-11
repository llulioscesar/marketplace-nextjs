// Authentication hooks
export * from './auth';

// Customer hooks (public features)
export * from './customer';

// Business hooks (admin features) - Re-export with prefixed names to avoid conflicts
export {
  useBusinessStoresManagement,
  useBusinessProductsManagement,
  useOrders,
  useBusinessStores,
  useToggleStoreStatus,
  useDeleteStore,
  useToggleProductStatus,
  useDeleteProduct as useBusinessDeleteProduct,
  useUpdateOrderStatus
} from './business';

// Common/utility hooks
export * from './common';