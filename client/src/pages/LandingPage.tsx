import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';

const LandingPage = () => (
  <MainLayout>
    <section className="grid items-center gap-10 md:grid-cols-2">
      <div className="space-y-6">
        <motion.h1
          className="font-serif text-4xl font-bold leading-tight text-ink dark:text-slate-100 md:text-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ideas belong here. Write, publish, and share like it&apos;s Medium.
        </motion.h1>
        <p className="text-lg text-muted dark:text-slate-300">
          BlogIT keeps writing distraction-free while readers enjoy a clean, focused experience. Publish drafts,
          return later, and let your words shine.
        </p>
        <div className="flex flex-wrap gap-4">
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
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4">
          <div className="h-3 w-32 rounded-full bg-slate-200" />
          <div className="h-6 w-3/4 rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-11/12 rounded bg-slate-100" />
          <div className="h-64 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200" />
        </div>
      </motion.div>
    </section>
  </MainLayout>
);

export default LandingPage;

