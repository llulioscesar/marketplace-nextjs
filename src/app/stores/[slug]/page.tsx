import StoreProductsPageClient from './page-client';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function StoreProductsPage({ params }: Props) {
  return <StoreProductsPageClient params={params} />;
}