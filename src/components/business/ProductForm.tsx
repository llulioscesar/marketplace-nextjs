'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { productSchema, ProductFormData } from '@/lib/validations/product';
import { useBusinessStores } from '@/hooks/business/useBusinessStores';
import { useCreateProduct, useUpdateProduct } from '@/hooks/business/useBusinessProductsManagement';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  slug: string;
}


interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
}

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const { data: stores = [] } = useBusinessStores();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const form = useForm({
    resolver: zodResolver(productSchema),
    mode: 'onSubmit' as const,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      storeId: '',
      isActive: true
    }
  });


  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    try {
      const response = await fetch(`/api/business/products/${productId}`);
      if (response.ok) {
        const product = await response.json();
        form.reset({
          name: product.name,
          description: product.description || '',
          price: Number(product.price),
          stock: product.stock,
          imageUrl: product.imageUrl || '',
          storeId: product.store.id,
          isActive: product.isActive
        });
      }
    } catch {
      toast.error('Error al cargar los datos del producto');
    }
  }, [productId, form]);


  useEffect(() => {
    if (mode === 'edit' && productId) {
      fetchProduct();
    }
  }, [mode, productId, fetchProduct]);

  const onSubmit: SubmitHandler<ProductFormData> = async (validatedData) => {
    try {
      if (mode === 'create') {
        await createProductMutation.mutateAsync(validatedData);
      } else if (productId) {
        await updateProductMutation.mutateAsync({ productId, data: validatedData });
      }
      router.push('/dashboard/products');
    } catch (error) {
      // Error handling is now done in the mutation hooks
      console.error('Error processing form:', error);
    }
  };


  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <Link href="/dashboard/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a productos
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          {mode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
        </h1>
        <p className="text-gray-600">
          {mode === 'create' 
            ? 'Llena los datos para crear tu nuevo producto' 
            : 'Modifica los datos de tu producto'
          }
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Smartphone Samsung Galaxy"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Describe las características y beneficios del producto..."
                          className="mt-1 w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock inicial *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tienda *</FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        >
                          <option value="">Selecciona una tienda</option>
                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Imagen</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://ejemplo.com/imagen-producto.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">
                        Opcional: URL de una imagen para el producto
                      </p>
                    </FormItem>
                  )}
                />

                {mode === 'edit' && (
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Producto activo (visible para clientes)
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="flex-1"
                  >
                    {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                    ) : (
                      mode === 'create' ? 'Crear Producto' : 'Actualizar Producto'
                    )}
                  </Button>
                  <Link href="/dashboard/products" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}