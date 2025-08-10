import { PaginationInfo, PaginationParams } from '@/types/store.types';

/**
 * Calcula la información de paginación
 */
export function calculatePagination(
  totalItems: number,
  params: PaginationParams
): PaginationInfo {
  const { page, limit } = params;
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Calcula el offset para la query de base de datos
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Valida los parámetros de paginación
 */
export function validatePaginationParams(page?: string | number, limit?: string | number) {
  const validatedPage = Math.max(1, parseInt(String(page || 1)));
  const validatedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 10))));
  
  return {
    page: validatedPage,
    limit: validatedLimit,
  };
}

/**
 * Genera números de página para UI (con elipsis)
 */
export function generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): (number | string)[] {
  const pages: (number | string)[] = [];
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return pages;
}

/**
 * Calcula el rango de elementos mostrados (ej: "1-10 de 50")
 */
export function calculateItemRange(page: number, limit: number, totalItems: number) {
  const start = Math.min(limit * (page - 1) + 1, totalItems);
  const end = Math.min(limit * page, totalItems);
  
  return {
    start,
    end,
    total: totalItems,
  };
}