/**
 * Avatar component
 * Shows initials with gradient background; supports online indicator and sizes.
 */
const GRADIENT_PAIRS = [
  ['from-brand-500 to-accent-500', 'text-white'],
  ['from-emerald-500 to-teal-500', 'text-white'],
  ['from-rose-500 to-pink-500',    'text-white'],
  ['from-amber-400 to-orange-500', 'text-white'],
  ['from-cyan-500 to-blue-500',    'text-white'],
];

const sizeMap = {
  xs: { outer: 'w-6 h-6',   text: 'text-[9px]',  dot: 'w-1.5 h-1.5 right-0 bottom-0' },
  sm: { outer: 'w-8 h-8',   text: 'text-xs',     dot: 'w-2 h-2 right-0 bottom-0' },
  md: { outer: 'w-10 h-10', text: 'text-sm',     dot: 'w-2.5 h-2.5 right-0 bottom-0' },
  lg: { outer: 'w-12 h-12', text: 'text-base',   dot: 'w-3 h-3 right-0.5 bottom-0.5' },
  xl: { outer: 'w-16 h-16', text: 'text-xl',     dot: 'w-3.5 h-3.5 right-0.5 bottom-0.5' },
  '2xl':{ outer:'w-20 h-20',text: 'text-2xl',    dot: 'w-4 h-4 right-1 bottom-1' },
};

function getGradient(name = '') {
  const code = name.charCodeAt(0) || 0;
  return GRADIENT_PAIRS[code % GRADIENT_PAIRS.length];
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name = 'User',
  src,
  size = 'md',
  online = false,
  className = '',
}) {
  const s = sizeMap[size] || sizeMap.md;
  const [gradient, textColor] = getGradient(name);

  return (
    <div className={`relative shrink-0 ${s.outer} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`w-full h-full rounded-full object-cover`}
        />
      ) : (
        <div
          className={`
            w-full h-full rounded-full flex items-center justify-center
            bg-gradient-to-br ${gradient} ${textColor}
            font-heading font-semibold ${s.text} select-none
          `}
        >
          {getInitials(name)}
        </div>
      )}

      {online && (
        <span
          className={`absolute ${s.dot} rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900`}
          style={{ boxShadow: '0 0 6px 1px rgb(16 185 129 / 0.6)' }}
        />
      )}
    </div>
  );
}
