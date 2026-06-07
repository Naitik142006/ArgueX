import { forwardRef } from 'react';

const Card = forwardRef(function Card(
  {
    children,
    variant = 'default',
    padding = 'p-6',
    interactive = false,
    className = '',
    ...props
  },
  ref
) {
  const variants = {
    default: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
    elevated: 'surface-elevated',
    glass: 'glass-dark',
    flat: 'bg-zinc-50 dark:bg-zinc-900/50 border-none',
  };

  return (
    <div
      ref={ref}
      className={[
        'rounded-2xl overflow-hidden',
        variants[variant],
        interactive && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
        padding,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
