import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <motion.div
    className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800"
    initial={{ opacity: 0, y: 12, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
  >
    <h3 className="text-lg font-semibold text-ink dark:text-slate-100">{title}</h3>
    {description ? <p className="mt-2 text-sm text-muted dark:text-slate-300">{description}</p> : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </motion.div>
);

export default EmptyState;

