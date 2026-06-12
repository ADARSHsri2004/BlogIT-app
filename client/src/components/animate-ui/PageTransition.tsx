import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const PageTransition = ({ children, className = ' pt-6 sm:px-6 lg:px-8' }: { children: ReactNode; className?: string }) => (
  <motion.main
    className={`mx-auto w-full ${className}`}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.42, ease: 'easeOut' }}
  >
    {children}
  </motion.main>
);

export default PageTransition;
