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
import { storeSchema, StoreFormData } from '@/lib/validations/store';
import Link from 'next/link';


interface StoreFormProps {
  mode: 'create' | 'edit';
  storeId?: string;
}

export default function StoreForm({ mode, storeId }: StoreFormProps) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(storeSchema),
    mode: 'onSubmit' as const,
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      isActive: true
    }
  });

  const fetchStore = useCallback(async () => {
    if (!storeId) return;
    
    try {
      const response = await fetch(`/api/business/stores/${storeId}`);
      if (response.ok) {
        const store = await response.json();
        form.reset({
          name: store.name,
          description: store.description || '',
          imageUrl: store.imageUrl || '',
          isActive: store.isActive
        });
      }
    } catch (error) {
      toast.error('Error al cargar los datos de la tienda');
    }
  }, [storeId, form]);

  useEffect(() => {
    if (mode === 'edit' && storeId) {
      fetchStore();
    }
  }, [mode, storeId, fetchStore]);

  const onSubmit: SubmitHandler<StoreFormData> = async (validatedData) => {
    try {
      const url = mode === 'create' 
        ? '/api/business/stores'
        : `/api/business/stores/${storeId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      });

      if (response.ok) {
        toast.success(
          mode === 'create' 
            ? 'Tienda creada exitosamente' 
            : 'Tienda actualizada exitosamente',
          {
            position: 'top-center',
            richColors: true,
          }
        );
        router.push('/dashboard/stores');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al procesar la solicitud', {
          position: 'top-center',
          richColors: true,
        });
      }
    } catch (error) {
      console.error('Error processing form:', error);
      toast.error('Error inesperado. Por favor, intenta nuevamente.', {
        position: 'top-center',
        richColors: true,
      });
    }
  };


  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <Link href="/dashboard/stores" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a tiendas
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          {mode === 'create' ? 'Crear Nueva Tienda' : 'Editar Tienda'}
        </h1>
        <p className="text-gray-600">
          {mode === 'create' 
            ? 'Llena los datos para crear tu nueva tienda' 
            : 'Modifica los datos de tu tienda'
          }
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Tienda</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Tienda *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Mi Tienda Online"
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
                          placeholder="Describe tu tienda y qué productos vendes..."
                          className="mt-1 w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={4}
                          {...field}
                        />
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
                          placeholder="https://ejemplo.com/imagen-tienda.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">
                        Opcional: URL de una imagen para representar tu tienda
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
                            Tienda activa (visible para clientes)
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
                    disabled={form.formState.isSubmitting}
                    className="flex-1"
                  >
                    {form.formState.isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                    ) : (
                      mode === 'create' ? 'Crear Tienda' : 'Actualizar Tienda'
                    )}
                  </Button>
                  <Link href="/dashboard/stores" className="flex-1">
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