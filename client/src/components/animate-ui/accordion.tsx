import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { springTransition } from './transitions';

type AnimatedAccordionItem = {
  title: string;
  copy: string;
};

type AnimatedAccordionProps = {
  items: AnimatedAccordionItem[];
  openIndex: number;
  onOpenChange: (index: number) => void;
  className?: string;
};

const AnimatedAccordion = ({ items, openIndex, onOpenChange, className }: AnimatedAccordionProps) => (
  <div className={clsx('space-y-3', className)}>
    {items.map((item, index) => {
      const isOpen = openIndex === index;

      return (
        <motion.div
          key={item.title}
          layout
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/70"
          transition={springTransition}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            onClick={() => onOpenChange(isOpen ? -1 : index)}
            aria-expanded={isOpen}
          >
            <span className="text-base font-semibold text-ink dark:text-slate-100">{item.title}</span>
            <motion.span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-sm dark:bg-slate-950"
              animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.04 : 1 }}
              transition={springTransition}
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {isOpen ? (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ ...springTransition, opacity: { duration: 0.2 } }}
              >
                <p className="px-5 pb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.copy}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      );
    })}
  </div>
);

export default AnimatedAccordion;
