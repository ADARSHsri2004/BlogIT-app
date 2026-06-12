import { motion, useReducedMotion } from 'framer-motion';

const GradientBackground = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-soft dark:bg-slate-900">
      <motion.div
        className="absolute inset-[-18%] opacity-80 blur-3xl dark:opacity-55"
        style={{
          background:
            'radial-gradient(circle at 18% 18%, rgba(79,70,229,0.18), transparent 28%), radial-gradient(circle at 82% 8%, rgba(14,165,233,0.16), transparent 25%), radial-gradient(circle at 50% 92%, rgba(16,185,129,0.12), transparent 28%)'
        }}
        animate={
          reduceMotion
            ? undefined
            : {
                x: ['0%', '2.5%', '-1.5%', '0%'],
                y: ['0%', '-2%', '1.5%', '0%'],
                scale: [1, 1.04, 1.02, 1]
              }
        }
        transition={{ duration: 16, ease: 'easeInOut', repeat: Infinity }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.72),rgba(248,250,252,0.94))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(15,23,42,0.96))]" />
    </div>
  );
};

export default GradientBackground;
