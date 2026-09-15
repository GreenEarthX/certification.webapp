import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** Brand spinner used inline ("Loading plants…") and in the redirect cards. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700",
        className,
      )}
    />
  );
}

/** Short inline placeholder for a section that is still fetching. */
export function InlineLoading({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 py-4 text-sm text-slate-500", className)}>
      <Spinner className="size-4" />
      <span>{label}</span>
    </div>
  );
}

/** Skeleton rows for a table that is still fetching. */
export function TableSkeleton({ rows = 4, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3 py-2" aria-busy>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn("h-4", c === 0 ? "w-40" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton grid matching the StatCard layout. */
export function StatCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-busy>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-gex-md border border-slate-200 bg-white p-5 shadow-gex-sm">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full-height branded card used by the /loading redirect pages. */
export function LoadingCard({ message }: { message: string }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--navbar-height,72px))] flex-col items-center justify-center bg-surface-tint p-6">
      <div className="flex flex-col items-center rounded-gex-lg border border-slate-200 bg-white px-10 py-8 text-center shadow-gex-md animate-in fade-in-0 zoom-in-95 duration-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logoGEX.png" alt="GreenEarthX" className="mb-4 h-12" />
        <p className="mb-5 text-sm text-slate-600">{message}</p>
        <Spinner className="size-8" />
      </div>
    </div>
  );
}
