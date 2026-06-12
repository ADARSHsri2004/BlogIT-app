import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { heroEditorialImage } from '../utils/editorial';

const LandingPage = () => (
  <MainLayout>
    <section className="grid overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:grid-cols-[0.95fr_1.05fr]">
      <div className="px-6 py-10 md:px-10 md:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">BlogIT Journal</p>
        <motion.h1
          className="mt-4 font-serif text-4xl font-bold leading-tight text-ink dark:text-slate-100 md:text-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ideas belong here. Write, publish, and share like it&apos;s Medium.
        </motion.h1>
        <p className="mt-6 text-lg text-muted dark:text-slate-300">
          BlogIT keeps writing distraction-free while readers enjoy a clean, focused experience. Publish drafts,
          return later, and let your words shine.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/write"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent"
          >
            Start writing
          </Link>
          <Link to="/feed" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
            Browse the feed
          </Link>
        </div>
      </div>
      <motion.div
        className="relative min-h-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img src={heroEditorialImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-white/50 dark:to-slate-950/50" />
        <div className="absolute bottom-6 left-6 max-w-sm rounded-2xl bg-white/85 p-5 shadow-lg backdrop-blur dark:bg-slate-950/80">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Generated for BlogIT</p>
          <p className="mt-2 text-sm leading-6 text-ink dark:text-slate-100">
            A calm editorial background matched to the app&apos;s writing-first experience.
          </p>
        </div>
      </motion.div>
    </section>
  </MainLayout>
);

export default LandingPage;
