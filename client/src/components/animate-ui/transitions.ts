import type { Transition, Variants } from 'framer-motion';

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 160,
  damping: 24,
  mass: 0.9
};

export const softTransition: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1]
};

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: softTransition
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06
    }
  }
};
