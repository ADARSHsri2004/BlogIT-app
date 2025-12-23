import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import MarkdownEditor from '../components/MarkdownEditor';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { createBlog, fetchBlogBySlug, updateBlog } from '../services/blogs';

const WritePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('# Start writing your story...');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const {
    data: existing,
    isLoading: isLoadingExisting,
    error: existingError
  } = useQuery({
    queryKey: ['blog', slug, 'edit'],
    queryFn: () => fetchBlogBySlug(slug || ''),
    enabled: Boolean(slug)
  });

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
      setStatus(existing.status);
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (slug && existing) {
        return updateBlog(existing._id, { title, content, status });
      }
      return createBlog({ title, content, status });
    },
    onSuccess: (blog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      navigate(`/blog/${blog.slug}`);
    }
  });

  if (isLoadingExisting) return <Spinner />;
  if (existingError) {
    return <EmptyState title="Cannot edit this blog" description={existingError.message} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted dark:text-slate-300">{slug ? 'Edit' : 'Write'}</p>
          <h1 className="font-serif text-3xl font-bold text-ink dark:text-slate-100">
            {slug ? 'Update your story' : 'Create a new story'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-ink dark:text-slate-100">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A compelling headline"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-lg font-semibold text-ink focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink dark:text-slate-100">Content</label>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-semibold text-ink dark:text-slate-100">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : slug ? 'Update' : 'Publish'}
            </button>
            {mutation.error ? (
              <span className="text-sm text-red-600">{(mutation.error as Error).message}</span>
            ) : null}
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default WritePage;

