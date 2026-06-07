const variantClasses = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
  brand:   'bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 border border-brand-500/20',
  success: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20',
  danger:  'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/20',
  accent:  'bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300 border border-accent-500/20',
  ai:      'bg-gradient-to-r from-brand-500/20 to-accent-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30',
};

const sizeClasses = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded-md gap-1',
  sm: 'px-2 py-0.5 text-xs rounded-lg gap-1',
  md: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  dotColor = 'bg-current',
  className = '',
}) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium',
        variantClasses[variant] ?? variantClasses.default,
        sizeClasses[size] ?? sizeClasses.sm,
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      )}
      {children}
    </span>
  );
}
