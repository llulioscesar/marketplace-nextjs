import { z } from 'zod';

export const storeSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la tienda es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/, 'El nombre solo puede contener letras, números, espacios, guiones y guiones bajos'),
    
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
    
  imageUrl: z.string()
    .url('La URL de la imagen debe ser válida')
    .optional()
    .or(z.literal('')),
    
  isActive: z.boolean()
    .optional()
    .default(true)
});

export type StoreFormData = z.infer<typeof storeSchema>;