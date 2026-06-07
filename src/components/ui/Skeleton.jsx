export function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  const widths = ['100%', '85%', '70%', '90%', '60%'];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 rounded-md"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`surface-elevated rounded-2xl p-5 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonMessage({ isAI = false }) {
  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className={`space-y-1.5 max-w-[70%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <Skeleton className="h-3.5 w-20 rounded-md" />
        <Skeleton className="h-20 w-64 rounded-2xl" />
      </div>
    </div>
  );
}

export default Skeleton;
