import { cn } from '../../utils/cn';

/**
 * Vertical rhythm wrapper + centered container.
 */
export default function Section({ as = 'section', className, containerClassName, children, id, ...props }) {
  const Tag = as;
  return (
    <Tag id={id} className={cn('relative py-20 sm:py-28 lg:py-32', className)} {...props}>
      <div className={cn('container-x', containerClassName)}>{children}</div>
    </Tag>
  );
}
