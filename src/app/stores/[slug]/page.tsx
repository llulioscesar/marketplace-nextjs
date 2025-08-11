import { StoreProductsClient } from '@/components/customer/stores';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function StoreProductsPage({ params }: Props) {
  const { slug } = await params;
  
  return <StoreProductsClient slug={slug} />;
}