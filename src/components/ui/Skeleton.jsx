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
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded-md"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-panel p-6 space-y-5 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md opacity-70" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonMessage({ isAI = false }) {
  return (
    <div className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}>
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className={`space-y-2 max-w-[70%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <Skeleton className="h-4 w-24 rounded-md opacity-80" />
        <Skeleton className="h-24 w-72 rounded-2xl" />
      </div>
    </div>
  );
}

export default Skeleton;
