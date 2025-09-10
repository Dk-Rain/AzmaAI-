import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="w-[450px] border-r bg-background p-4 hidden md:flex flex-col gap-4">
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-9 w-1/2" />
            <Skeleton className="h-9 w-1/2" />
        </div>
        <Skeleton className="h-9 w-full" />
        
        <div className="flex-1 space-y-2 overflow-auto py-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
        <div className="mt-auto">
            <Skeleton className="h-24 w-full" />
        </div>

      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-36 ml-auto" />
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
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
        </div>
      </main>
    </div>
  );
}
