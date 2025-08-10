import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, User } from '@prisma/client';

type StoreWithRelations = Store & {
  business: Pick<User, 'name'>;
  _count: {
    products: number;
  };
};

interface StoreCardProps {
  store: StoreWithRelations;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/stores/${store.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        {store.imageUrl && (
          <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            <img
              src={store.imageUrl}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{store.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {store.description || 'Sin descripción'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Por: {store.business.name}
          </p>
        </CardContent>
        <CardFooter>
          <Badge variant="secondary">
            {store._count.products} productos
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}