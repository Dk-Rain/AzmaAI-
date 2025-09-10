import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="w-[400px] border-r bg-muted/20 p-6 hidden md:flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>

        <div className="mt-auto space-y-2">
            <Skeleton className="h-24 w-full" />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-sm">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/4 mx-auto mt-4" />

            <div className="mt-8 space-y-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />

                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-40 w-full" />

                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
      </main>
    </div>
  );
}
