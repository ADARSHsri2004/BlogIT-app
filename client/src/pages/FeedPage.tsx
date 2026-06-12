import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import EmptyState from '../components/EmptyState';
import BlogCard from '../components/BlogCard';
import { fetchPublishedBlogs } from '../services/blogs';
import { AnimatedLinkButton } from '../components/animate-ui/button';
import { Stagger, StaggerItem } from '../components/animate-ui/motion';
import { softTransition, springTransition } from '../components/animate-ui/transitions';
import { Card, CardBody } from '../components/ui/Card';

const skeletonCards = ['one', 'two', 'three'];

const FeedPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs', 'published'],
    queryFn: fetchPublishedBlogs
  });

  const blogs = data ?? [];
  const query = searchTerm.trim().toLowerCase();
  const displayedBlogs = blogs.filter((blog) => {
    const text = [blog.title, blog.summary, blog.content, blog.author?.name].filter(Boolean).join(' ').toLowerCase();

    return !query || text.includes(query);
  });

  return (
    <MainLayout contentClassName="px-3 py-5 sm:px-4 lg:px-5 xl:px-6">
      <motion.section
        className="mx-auto max-w-[1580px]"
        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={softTransition}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...softTransition, delay: 0.04 }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Discover</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold leading-none text-ink dark:text-slate-100">Latest stories</h1>
            <p className="mt-4 max-w-2xl text-base leading-6 text-slate-600 dark:text-slate-300">
              Explore fresh posts, thoughtful drafts, and community stories from BlogIT writers.
            </p>
          </motion.div>

          <motion.div
            className="flex w-full items-center gap-4 lg:w-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...softTransition, delay: 0.12 }}
          >
            <label className="relative flex min-w-0 flex-1 items-center lg:w-80 lg:flex-none">
              <span className="sr-only">Search posts</span>
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-700 dark:text-slate-300 border-1-black" aria-hidden="true" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-14 w-full border border-transparent bg-transparent pl-12 pr-10 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white/70 dark:text-slate-100 dark:focus:border-slate-700 dark:focus:bg-slate-950/70"
                placeholder="Search"
              />
              {searchTerm ? (
                <button
                  type="button"
                  className="absolute right-2 flex h-7 w-7 items-center justify-center text-slate-500 transition hover:text-accent dark:text-slate-400"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={springTransition}>
              <Link
                to="/write"
                className="inline-flex h-14 shrink-0 items-center justify-center bg-cyan-500 px-7 text-sm font-bold text-white shadow-[0_14px_28px_rgba(6,182,212,0.18)] transition hover:bg-cyan-600 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
              >
                Create a Post
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.section
              key="loading"
              className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={softTransition}
              aria-label="Loading stories"
            >
              {skeletonCards.map((item) => (
                <Card key={item}>
                  <div className="h-56 animate-pulse bg-slate-100 dark:bg-slate-900" />
                  <CardBody className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="min-w-0 flex-1">
                        <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-2 h-2.5 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                    <div className="mt-5 h-7 w-4/5 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                  </CardBody>
                </Card>
              ))}
            </motion.section>
          ) : null}

          {error ? (
            <motion.div key="error" className="mt-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={softTransition}>
              <EmptyState title="Could not load the feed" description={error.message} />
            </motion.div>
          ) : null}

          {data && displayedBlogs.length === 0 ? (
            <motion.div key="empty" className="mt-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={softTransition}>
              <EmptyState
                title={data.length === 0 ? 'Nothing published yet' : 'No posts found'}
                description={data.length === 0 ? 'Be the first to publish a story.' : 'Try another search term.'}
                action={
                  <AnimatedLinkButton to="/write" size="sm">
                    Start writing
                  </AnimatedLinkButton>
                }
              />
            </motion.div>
          ) : null}

          {displayedBlogs.length > 0 ? (
            <motion.section
              key={query || 'all'}
              className="mt-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springTransition}
            >
              <Stagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {displayedBlogs.map((blog) => (
                  <StaggerItem key={blog._id}>
                    <BlogCard blog={blog} />
                  </StaggerItem>
                ))}
              </Stagger>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </motion.section>
    </MainLayout>
  );
};

export default FeedPage;

