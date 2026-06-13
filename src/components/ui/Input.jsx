import { forwardRef, useState } from'react';
import { Eye, EyeOff, AlertCircle } from'lucide-react';

const Input = forwardRef(function Input(
 {
 label,
 type ='text',
 error,
 hint,
 icon,
 className ='',
 containerClassName ='',
 ...props
 },
 ref
) {
 const [showPass, setShowPass] = useState(false);
 const isPassword = type ==='password';
 const inputType = isPassword ? (showPass ?'text' :'password') : type;

 return (
 <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
 {label && (
 <label className="text-sm font-semibold tracking-wide font-heading text-zinc-300 uppercase">
 {label}
 </label>
 )}

 <div className="relative group">
 {icon && (
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-400 transition-colors pointer-events-none">
 {icon}
 </div>
 )}

 <input
 ref={ref}
 type={inputType}
 className={['w-full rounded-xl border bg-surface/50 backdrop-blur-sm','text-zinc-100 placeholder-zinc-600','transition-all duration-300 outline-none','focus:bg-surface focus:ring-2 focus:ring-brand-500/50 focus:border-brand-400','hover:border-white/20',
 error
 ?'border-rose-500/50 focus:ring-rose-500/40 focus:border-rose-400'
 :'border-white/10',
 icon ?'pl-11 pr-4 py-3.5' :'px-4 py-3.5',
 isPassword &&'pr-12','text-sm font-mono',
 className,
 ].join(' ')}
 {...props}
 />

 {isPassword && (
 <button
 type="button"
 onClick={() => setShowPass(v => !v)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
 tabIndex={-1}
 >
 {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 )}

 {error && !isPassword && (
 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
 <AlertCircle size={18} />
 </div>
 )}
 </div>

 {error && (
 <p className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mt-1">
 <AlertCircle size={14} />
 {error}
 </p>
 )}
 {hint && !error && (
 <p className="text-xs text-zinc-500 mt-1">{hint}</p>
 )}
 </div>
 );
});

export default Input;
