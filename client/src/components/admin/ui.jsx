import { forwardRef } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

/* ---------------- Status badge ---------------- */
const STATUS_TONES = {
  published: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20',
  draft: 'bg-amber-500/12 text-amber-700 ring-amber-500/20',
  archived: 'bg-ink-500/12 text-ink-500 ring-ink-500/20',
};

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset',
        STATUS_TONES[status] ?? STATUS_TONES.draft,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* ---------------- Toggle switch ---------------- */
export function Toggle({ checked, onChange, label, id }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-2',
        checked ? 'bg-brand-500' : 'bg-ink-200',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

/* ---------------- Form primitives ---------------- */
export function FieldLabel({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink-700">
      <span>{children}</span>
      {hint && <span className="text-xs font-normal text-ink-400">{hint}</span>}
    </label>
  );
}

const controlBase =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-ink-900 outline-none transition-[border,box-shadow] duration-200 ' +
  'placeholder:text-ink-300 focus:border-brand-400 focus:shadow-[0_0_0_4px_rgba(243,106,46,0.12)]';

export const TextInput = forwardRef(function TextInput({ className, ...props }, ref) {
  return <input ref={ref} className={cn(controlBase, className)} {...props} />;
});

export const TextArea = forwardRef(function TextArea({ className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(controlBase, 'resize-none', className)} {...props} />;
});

export const SelectInput = forwardRef(function SelectInput({ className, options = [], ...props }, ref) {
  return (
    <select ref={ref} className={cn(controlBase, 'cursor-pointer appearance-none bg-[length:0]', className)} {...props}>
      {options.map((o) => (
        <option key={o} value={o}>
          {typeof o === 'string' ? o[0].toUpperCase() + o.slice(1) : o}
        </option>
      ))}
    </select>
  );
});

/* ---------------- Star rating input ---------------- */
export function StarRating({ value, onChange, size = 22, readOnly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={cn('transition-transform', !readOnly && 'hover:scale-110')}
        >
          <Star
            size={size}
            className={cn(n <= value ? 'fill-gold-500 text-gold-500' : 'fill-transparent text-ink-200')}
          />
        </button>
      ))}
    </div>
  );
}
