import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { fetchMyBlogs } from '../services/blogs';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import BlogCard from '../components/BlogCard';

const ProfilePage = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs', 'me'],
    queryFn: fetchMyBlogs
  });

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted dark:text-slate-300">Profile</p>
            <h1 className="font-serif text-3xl font-bold text-ink dark:text-slate-100">{user?.name}</h1>
            <p className="text-sm text-muted dark:text-slate-300">{user?.email}</p>
            <p className="mt-2 text-sm text-muted dark:text-slate-300">
              {user?.role} {user?.emailVerified ? '• verified' : '• email verification pending'}
            </p>
          </div>
          {user?.emailVerified && ['admin', 'author'].includes(user.role) ? (
            <Link
              to="/write"
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent"
            >
              Write a story
            </Link>
          ) : null}
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink dark:text-slate-100">Your drafts & posts</h2>
          {isLoading && <Spinner />}
          {error && <EmptyState title="Could not load your blogs" description={error.message} />}
          {data && data.length === 0 ? (
            <EmptyState
              title="No stories yet"
              description="Start a draft or publish your first post."
              action={
                <Link
                  to="/write"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
                >
                  Start writing
                </Link>
              }
            />
          ) : null}
          <div className="mt-4 grid gap-4">
            {data?.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

