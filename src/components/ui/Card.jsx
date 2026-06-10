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
    default: 'bg-surface border border-surface-border',
    glass: 'glass-panel',
    elevated: 'bg-surface border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]',
    flat: 'bg-white/5 border-none',
  };

  return (
    <div
      ref={ref}
      className={[
        'rounded-2xl overflow-hidden',
        variants[variant],
        interactive && 'transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-glass cursor-pointer cursor-pointer',
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
