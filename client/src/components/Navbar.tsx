import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { AnimatedButton } from './animate-ui/button';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const canWrite = Boolean(user?.emailVerified && ['admin', 'author'].includes(user.role));

  const handleLogout = async () => {
    await logoutUser();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-950/82">
      <div className="flex w-full items-center justify-between gap-6 px-6 py-3 sm:px-8 xl:px-12">
        <div className="flex min-w-0 items-center">
          <Link to="/" className="shrink-0 font-serif text-[1.8rem] font-semibold leading-none text-ink dark:text-slate-100">
          BlogIT
          </Link>
        </div>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <nav className="flex items-center gap-2">
            <Link
              to="/feed"
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100 hover:text-accent dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Feed
            </Link>
            {canWrite ? (
              <Link
                to="/write"
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100 hover:text-accent dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Write
              </Link>
            ) : null}
          </nav>
          {!user?.emailVerified && user ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
              Verify email
            </span>
          ) : null}
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to="/profile"
                className="max-w-[220px] truncate rounded-full px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100 hover:text-accent dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {user.name}
              </Link>
              <AnimatedButton
                onClick={handleLogout}
                size="md"
              >
                Logout
              </AnimatedButton>
            </>
          ) : (
            <AnimatedButton
              onClick={() => navigate('/auth')}
              size="md"
            >
              Get started
            </AnimatedButton>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <motion.button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition dark:border-slate-700 dark:bg-slate-900"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
          >
            <span className="relative block h-3.5 w-5">
              <motion.span
                className="absolute left-0 top-0 h-0.5 w-5 bg-ink dark:bg-slate-100"
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="absolute left-0 top-[6px] h-0.5 w-5 bg-ink dark:bg-slate-100"
                animate={open ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="absolute left-0 top-3 h-0.5 w-5 bg-ink dark:bg-slate-100"
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              />
            </span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="overflow-hidden md:hidden"
          >
            <div className="space-y-2 border-t border-slate-200 bg-white px-4 py-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <Link
                to="/feed"
                className="block rounded-2xl px-3 py-2 text-sm font-semibold text-ink dark:text-slate-100"
                onClick={() => setOpen(false)}
              >
                Feed
              </Link>
              {canWrite ? (
                <Link
                  to="/write"
                  className="block rounded-2xl px-3 py-2 text-sm font-semibold text-ink dark:text-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Write
                </Link>
              ) : null}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block rounded-2xl px-3 py-2 text-sm font-semibold text-ink dark:text-slate-100"
                    onClick={() => setOpen(false)}
                  >
                    {user.name}
                  </Link>
                  {!user.emailVerified ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
                      Verify your email to publish
                    </div>
                  ) : null}
                  <AnimatedButton
                    onClick={handleLogout}
                    className="mt-2 w-full"
                  >
                    Logout
                  </AnimatedButton>
                </>
              ) : (
                <AnimatedButton
                  onClick={() => {
                    setOpen(false);
                    navigate('/auth');
                  }}
                  className="mt-2 w-full"
                >
                  Get started
                </AnimatedButton>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
