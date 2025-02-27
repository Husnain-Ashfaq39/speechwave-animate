import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

export const TextAreaSkeleton = () => (
  <div className="space-y-2">
    <div className="flex items-center gap-1 p-1">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-7 w-7" />
      ))}
    </div>
    <Skeleton className="h-40 w-full" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
)

export const AudioPlayerSkeleton = () => (
  <div className="mt-8 space-y-3">
    <Skeleton className="h-6 w-32" />
    <div className="glass-morphism rounded-xl p-4 space-y-3 border border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <div className="flex items-center justify-center gap-1 h-8 my-2">
        {[...Array(28)].map((_, i) => (
          <Skeleton key={i} className="w-1 h-4" />
        ))}
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  </div>
)

export const SettingsSkeleton = () => (
  <div className="mb-6 glass-morphism rounded-xl border border-primary/10 p-4 space-y-4">
    <Skeleton className="h-6 w-40" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
