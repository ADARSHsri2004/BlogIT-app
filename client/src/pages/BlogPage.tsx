import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MainLayout from '../layouts/MainLayout';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { deleteBlog, fetchBlogBySlug } from '../services/blogs';
import { useAuth } from '../hooks/useAuth';
import { formatDisplayDate, getEditorialImage } from '../utils/editorial';

const BlogPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => fetchBlogBySlug(slug || ''),
    enabled: Boolean(slug)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      navigate('/feed');
    }
  });

  if (isLoading) return <Spinner />;
  if (error || !blog) {
    return <EmptyState title="Blog not found" description={error?.message || 'The blog does not exist.'} />;
  }

  const isAuthor = user?.id === blog.author?._id || user?.id === blog.author?.id;

  return (
    <MainLayout>
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="h-80 bg-slate-100 dark:bg-slate-700">
          <img src={getEditorialImage(blog)} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted dark:text-slate-300">{blog.status}</p>
              <h1 className="mt-2 font-serif text-4xl font-bold text-ink dark:text-slate-100">{blog.title}</h1>
              <div className="mt-3 flex items-center gap-3 text-sm text-muted dark:text-slate-300">
                <span className="font-semibold text-ink dark:text-slate-100">{blog.author?.name}</span>
                <span>/</span>
                <span>{formatDisplayDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
            </div>
            {isAuthor ? (
              <div className="flex gap-2">
                <Link
                  to={`/write/${blog.slug}`}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-ink hover:border-accent"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(blog._id)}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
          <div className="prose prose-lg mt-8 max-w-none prose-headings:text-ink prose-p:text-ink prose-strong:text-ink prose-a:text-accent">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </MainLayout>
  );
};

export default BlogPage;
