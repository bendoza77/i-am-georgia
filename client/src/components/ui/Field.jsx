import { useId, useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * Floating-label input / textarea with a focus glow.
 * @param {boolean} [textarea]
 */
export default function Field({
  label,
  type = 'text',
  textarea = false,
  rows = 4,
  className,
  required,
  ...props
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const Tag = textarea ? 'textarea' : 'input';

  return (
    <div className={cn('group relative', className)}>
      <Tag
        id={id}
        type={textarea ? undefined : type}
        rows={textarea ? rows : undefined}
        placeholder=" "
        value={value}
        required={required}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          'peer w-full rounded-[var(--radius-sm)] border border-ink-200 bg-white/60 px-4 pb-2.5 pt-6 text-ink-900 outline-none',
          'transition-[border,box-shadow,background] duration-300 placeholder:text-transparent',
          'focus:border-brand-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(243,106,46,0.12)]',
          textarea && 'resize-none pt-7',
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-4 top-4 origin-left text-ink-400 transition-all duration-200',
          'peer-focus:top-2.5 peer-focus:text-xs peer-focus:font-medium peer-focus:text-brand-600',
          'peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium',
        )}
      >
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </label>
    </div>
  );
}
