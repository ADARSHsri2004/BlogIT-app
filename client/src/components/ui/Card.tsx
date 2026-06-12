import { motion, type HTMLMotionProps } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

type CardProps = HTMLMotionProps<'article'>;

export const Card = ({ className, children, ...props }: CardProps) => (
  <motion.article
    className={clsx(
      'group overflow-hidden border border-slate-200/90 bg-white shadow-sm transition-[border-color,box-shadow,background-color] duration-300 dark:border-slate-800 dark:bg-slate-950',
      className
    )}
    {...props}
  >
    {children}
  </motion.article>
);

type CardBodyProps = HTMLAttributes<HTMLDivElement>;

export const CardBody = ({ className, children, ...props }: CardBodyProps) => (
  <div className={clsx('p-5', className)} {...props}>
    {children}
  </div>
);
