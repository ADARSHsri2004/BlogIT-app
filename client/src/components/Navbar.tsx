import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-ink dark:text-slate-100">
          BlogIT
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/feed" className="text-sm font-medium text-ink hover:text-accent dark:text-slate-100">
            Feed
          </Link>
          {user?.emailVerified && ['admin', 'author'].includes(user.role) ? (
            <Link to="/write" className="text-sm font-medium text-ink hover:text-accent dark:text-slate-100">
              Write
            </Link>
          ) : null}
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-medium text-ink hover:text-accent dark:text-slate-100"
              >
                {user.name}
              </Link>
              {!user.emailVerified ? <span className="text-xs font-semibold text-amber-600">Verify email</span> : null}
              <button
                onClick={handleLogout}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
            >
              Get started
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 transition dark:border-slate-700"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="h-0.5 w-5 bg-ink dark:bg-slate-100" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="md:hidden"
          >
            <div className="space-y-2 border-t border-slate-200 bg-white px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
              <Link to="/feed" className="block text-sm font-medium text-ink dark:text-slate-100" onClick={() => setOpen(false)}>
                Feed
              </Link>
              {user?.emailVerified && ['admin', 'author'].includes(user.role) ? (
                <Link to="/write" className="block text-sm font-medium text-ink dark:text-slate-100" onClick={() => setOpen(false)}>
                  Write
                </Link>
              ) : null}
              {user ? (
                <>
                  <Link to="/profile" className="block text-sm font-medium text-ink dark:text-slate-100" onClick={() => setOpen(false)}>
                    {user.name}
                  </Link>
                  {!user.emailVerified ? <div className="text-xs font-semibold text-amber-600">Verify your email to publish</div> : null}
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="block rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Get started
                </Link>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

