import { motion } from 'framer-motion';

const Spinner = () => (
  <div className="flex items-center justify-center py-10">
    <motion.div
      className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent"
      animate={{ rotate: 360, scale: [1, 1.08, 1] }}
      transition={{ rotate: { duration: 0.8, ease: 'linear', repeat: Infinity }, scale: { duration: 1.2, repeat: Infinity } }}
    />
  </div>
);

export default Spinner;

