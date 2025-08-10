import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del producto es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim(),
    
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
    
  price: z.number()
    .min(0, 'El precio debe ser mayor o igual a 0')
    .max(999999.99, 'El precio no puede exceder $999,999.99'),
    
  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock debe ser mayor o igual a 0')
    .max(999999, 'El stock no puede exceder 999,999 unidades'),
    
  imageUrl: z.string()
    .url('La URL de la imagen debe ser válida')
    .optional()
    .or(z.literal('')),
    
  storeId: z.string()
    .min(1, 'Debes seleccionar una tienda'),
    
  isActive: z.boolean()
    .optional()
    .default(true)
});

export type ProductFormData = z.infer<typeof productSchema>;