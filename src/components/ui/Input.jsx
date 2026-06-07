import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    error,
    hint,
    icon,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          className={[
            'w-full rounded-xl border bg-white dark:bg-zinc-900',
            'text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600',
            'transition-all duration-150 outline-none',
            'focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            'dark:focus:ring-brand-500/40',
            error
              ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/40 focus:border-rose-500'
              : 'border-zinc-200 dark:border-zinc-700',
            icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
            isPassword && 'pr-12',
            'text-sm',
            className,
          ].join(' ')}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {error && !isPassword && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
      )}
    </div>
  );
});

export default Input;
