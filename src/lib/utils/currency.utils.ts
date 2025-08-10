/**
 * Formatea un precio a la moneda local
 */
export function formatPrice(price: number | string, locale: string = 'es-CO', currency: string = 'COP'): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(numericPrice);
}

/**
 * Formatea un precio en COP (pesos colombianos)
 */
export function formatPriceCOP(price: number | string): string {
  return formatPrice(price, 'es-CO', 'COP');
}

/**
 * Formatea un precio en USD
 */
export function formatPriceUSD(price: number | string): string {
  return formatPrice(price, 'en-US', 'USD');
}

/**
 * Convierte string a número decimal para cálculos
 */
export function parsePrice(price: string | number): number {
  if (typeof price === 'number') return price;
  return parseFloat(price) || 0;
}

/**
 * Calcula el precio con descuento
 */
export function calculateDiscountPrice(originalPrice: number, discountPercent: number): number {
  return originalPrice * (1 - discountPercent / 100);
}

/**
 * Calcula el precio con impuestos
 */
export function calculatePriceWithTax(price: number, taxPercent: number): number {
  return price * (1 + taxPercent / 100);
}

/**
 * Valida que un precio sea válido (positivo)
 */
export function isValidPrice(price: number | string): boolean {
  const numericPrice = parsePrice(price);
  return numericPrice > 0 && !isNaN(numericPrice);
}