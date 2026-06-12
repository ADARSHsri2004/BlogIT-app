import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';
import clsx from 'clsx';
import { revealVariants, softTransition, staggerContainer } from './transitions';

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
  once?: boolean;
};

export const Reveal = ({ children, className, delay = 0, once = true, transition, ...props }: RevealProps) => (
  <motion.div
    className={className}
    variants={revealVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount: 0.28, margin: '0px 0px -80px 0px' }}
    transition={{ ...softTransition, delay, ...transition }}
    {...props}
  >
    {children}
  </motion.div>
);

type StaggerProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
};

export const Stagger = ({ children, className, ...props }: StaggerProps) => (
  <motion.div className={clsx(className)} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} {...props}>
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className, ...props }: StaggerProps) => (
  <motion.div className={className} variants={revealVariants} {...props}>
    {children}
  </motion.div>
);
