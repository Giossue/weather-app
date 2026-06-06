import { Skeleton } from "../ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="grid min-w-0 gap-4">
      <Skeleton className="h-72 rounded-2xl" />
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-28" />)}
      </div>
      <Skeleton className="h-44 rounded-2xl" />
    </div>
  );
}
