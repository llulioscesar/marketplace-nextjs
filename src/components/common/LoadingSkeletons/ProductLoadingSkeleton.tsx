interface ProductLoadingSkeletonProps {
  count?: number;
}

export default function ProductLoadingSkeleton({ count = 6 }: ProductLoadingSkeletonProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}