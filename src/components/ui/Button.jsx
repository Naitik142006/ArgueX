import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] border border-brand-400/50',
  neon:      'bg-transparent border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 hover:shadow-neon-cyan',
  secondary: 'bg-surface hover:bg-surface-hover active:bg-surface-border text-zinc-100 border border-white/10',
  ghost:     'bg-transparent hover:bg-white/5 active:bg-white/10 text-zinc-300 hover:text-white',
  danger:    'bg-rose-600/90 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] border border-rose-400/50',
  outline:   'border border-white/10 bg-transparent hover:bg-white/5 text-zinc-300',
  brand:     'bg-gradient-to-r from-brand-600 to-neon-violet hover:from-brand-500 hover:to-neon-pink text-white shadow-neon-violet border border-white/20',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5 font-semibold',
  sm: 'px-3.5 py-1.5 text-sm rounded-xl gap-2 font-semibold',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2 font-semibold',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5 font-bold tracking-wide',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3 font-bold tracking-wider',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconRight,
    className = '',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-heading transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'active:scale-[0.96] select-none',
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed active:scale-100 shadow-none',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
});

export default Button;
