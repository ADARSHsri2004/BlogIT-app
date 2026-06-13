import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { type MouseEvent, type ReactNode, useState } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconButtonSize = 'sm' | 'md' | 'lg';

const buttonStyles = {
  base: 'relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-soft disabled:pointer-events-none disabled:opacity-60 dark:focus:ring-offset-slate-900',
  variants: {
    primary: 'bg-ink text-white hover:bg-accent dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200',
    secondary:
      'border border-slate-200 bg-white text-ink hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
    ghost: 'text-ink hover:bg-slate-100 hover:text-accent dark:text-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70'
  },
  sizes: {
    sm: 'h-9 px-4 text-sm',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-6 text-sm'
  }
};

const iconButtonStyles = {
  base: 'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-soft hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:text-white dark:focus:ring-offset-slate-900',
  variants: {
    primary: 'bg-ink text-white hover:bg-accent hover:text-white dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200',
    secondary:
      'border border-slate-200 bg-white text-ink hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
    ghost: 'border-transparent bg-transparent text-ink hover:bg-slate-100 hover:text-accent dark:text-slate-100 dark:hover:bg-slate-800',
    danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70'
  },
  sizes: {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-12 w-12'
  }
};

const rippleColor = {
  primary: 'rgba(255,255,255,0.35)',
  secondary: 'rgba(79,70,229,0.18)',
  ghost: 'rgba(79,70,229,0.14)',
  danger: 'rgba(220,38,38,0.18)'
};

const getButtonClassName = (variant: ButtonVariant, size: ButtonSize, className?: string) =>
  clsx(buttonStyles.base, buttonStyles.variants[variant], buttonStyles.sizes[size], className);

const getIconButtonClassName = (variant: ButtonVariant, size: IconButtonSize, className?: string) =>
  clsx(iconButtonStyles.base, iconButtonStyles.variants[variant], iconButtonStyles.sizes[size], className);

const createRipple = (event: MouseEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;

  return {
    id: Date.now(),
    x: event.clientX - rect.left - size / 2,
    y: event.clientY - rect.top - size / 2,
    size
  };
};

type AnimatedButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const AnimatedButton = ({
  children,
  className,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: AnimatedButtonProps) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const nextRipple = createRipple(event);

    setRipples((current) => [...current, nextRipple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== nextRipple.id));
    }, 650);

    onClick?.(event);
  };

  return (
    <motion.button
      type={type}
      className={getButtonClassName(variant, size, className)}
      whileHover={{ scale: props.disabled ? 1 : 1.035 }}
      whileTap={{ scale: props.disabled ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor[variant]
            }}
            initial={{ opacity: 0.55, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};

type AnimatedLinkButtonProps = LinkProps & {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const AnimatedLinkButton = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: AnimatedLinkButtonProps) => (
  <Link className="inline-flex" {...props}>
    <motion.span
      className={getButtonClassName(variant, size, className)}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      {children}
    </motion.span>
  </Link>
);

type AnimatedIconButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: IconButtonSize;
};

export const AnimatedIconButton = ({
  children,
  className,
  onClick,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  ...props
}: AnimatedIconButtonProps) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const nextRipple = createRipple(event);

    setRipples((current) => [...current, nextRipple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== nextRipple.id));
    }, 650);

    onClick?.(event);
  };

  return (
    <motion.button
      type={type}
      className={getIconButtonClassName(variant, size, className)}
      whileHover={{ scale: props.disabled ? 1 : 1.05, y: props.disabled ? 0 : -1 }}
      whileTap={{ scale: props.disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center">{children}</span>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor[variant]
            }}
            initial={{ opacity: 0.55, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};
