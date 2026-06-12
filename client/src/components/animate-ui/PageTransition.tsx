import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { softTransition } from './transitions';

const PageTransition = ({ children, className = ' pt-6 sm:px-6 lg:px-8' }: { children: ReactNode; className?: string }) => (
  <motion.main
    className={`mx-auto w-full ${className}`}
    initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
    transition={softTransition}
  >
    {children}
  </motion.main>
);

export default PageTransition;
