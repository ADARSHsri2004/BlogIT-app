import { useQuery } from '@tanstack/react-query';
import MainLayout from '../layouts/MainLayout';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import BlogCard from '../components/BlogCard';
import { fetchPublishedBlogs } from '../services/blogs';

const FeedPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs', 'published'],
    queryFn: fetchPublishedBlogs
  });

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted dark:text-slate-300">Discover</p>
          <h2 className="font-serif text-3xl font-semibold text-ink dark:text-slate-100">Latest stories</h2>
        </div>
      </div>
      {isLoading && <Spinner />}
      {error && <EmptyState title="Could not load the feed" description={error.message} />}
      {data && data.length === 0 ? (
        <EmptyState
          title="Nothing published yet"
          description="Be the first to publish a story."
          action={
            <a
              href="/write"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
            >
              Start writing
            </a>
          }
        />
      ) : null}
      <div className="mt-6 grid gap-4">
        {data?.map((blog) => (
          <BlogCard blog={blog} key={blog._id} />
        ))}
      </div>
    </MainLayout>
  );
};

export default FeedPage;

