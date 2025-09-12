
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="border-b p-4">
            <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
        </div>
      </aside>
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Skeleton className="h-8 w-8 sm:hidden" />
            <Skeleton className="h-8 w-48" />
            <div className="relative ml-auto flex-1 md:grow-0">
                <Skeleton className="h-9 w-full md:w-64" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
      </div>
    </div>
  );
}
