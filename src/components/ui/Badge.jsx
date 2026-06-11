const variantClasses = {
 default:'bg-surface-border text-zinc-300 border border-white/10',
 brand:'bg-brand-500/10 text-brand-400 border border-brand-500/30',
 success:'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
 danger:'bg-rose-500/10 text-rose-400 border border-rose-500/30',
 warning:'bg-amber-500/10 text-amber-400 border border-amber-500/30',
 neon:'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/40',
 ai:'bg-gradient-to-r from-neon-violet/20 to-brand-500/20 text-brand-300 border border-neon-violet/40',
 // Ranks
 bronze:'bg-rank-bronze/10 text-rank-bronze border border-rank-bronze/40',
 silver:'bg-rank-silver/10 text-rank-silver border border-rank-silver/40',
 gold:'bg-rank-gold/10 text-rank-gold border border-rank-gold/40',
 platinum:'bg-rank-platinum/10 text-rank-platinum border border-rank-platinum/40',
 diamond:'bg-rank-diamond/10 text-rank-diamond border border-rank-diamond/40',
 master:'bg-rank-master/10 text-rank-master border border-rank-master/40',
 grandmaster:'bg-gradient-to-r from-rank-grandmaster/20 to-rank-gold/20 text-rank-gold border border-rank-grandmaster/50',
};

const sizeClasses = {
 xs:'px-1.5 py-0.5 text-[10px] rounded-md gap-1.5 uppercase tracking-wider',
 sm:'px-2.5 py-1 text-xs rounded-lg gap-2 font-semibold uppercase tracking-wider',
 md:'px-3 py-1.5 text-sm rounded-xl gap-2 font-bold uppercase tracking-wider',
};

export default function Badge({
 children,
 variant ='default',
 size ='sm',
 dot = false,
 dotColor ='bg-current',
 className ='',
}) {
 return (
 <span
 className={['inline-flex items-center font-heading',
 variantClasses[variant] ?? variantClasses.default,
 sizeClasses[size] ?? sizeClasses.sm,
 className,
 ].filter(Boolean).join(' ')}
 >
 {dot && (
 <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 animate-pulse`} />
 )}
 {children}
 </span>
 );
}
