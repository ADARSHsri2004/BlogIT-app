import { type ChangeEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpenText, CircleDot, FileText, ImagePlus, Sparkles, Trash2 } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import MarkdownEditor from '../components/MarkdownEditor';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { createBlog, fetchBlogBySlug, updateBlog } from '../services/blogs';
import { AnimatedButton } from '../components/animate-ui/button';
import { softTransition, springTransition } from '../components/animate-ui/transitions';

const WritePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('# Start writing your story...');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageError, setCoverImageError] = useState('');

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
      setCoverImageUrl(existing.coverImageUrl || '');
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (slug && existing) {
        return updateBlog(existing._id, { title, content, status, coverImageUrl });
      }
      return createBlog({ title, content, status, coverImageUrl });
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

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read the selected image'));
      reader.readAsDataURL(file);
    });

  const handleCoverImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      setCoverImageError('Please choose a cover image under 300 KB.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCoverImageUrl(dataUrl);
      setCoverImageError('');
    } catch (error) {
      setCoverImageError(error instanceof Error ? error.message : 'Could not read the selected image.');
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedRead = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <MainLayout contentClassName="px-3 py-5 sm:px-4 lg:px-5 xl:px-6">
      <motion.section
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={softTransition}
      >
        <motion.div
          className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(245,248,255,0.95),rgba(255,255,255,0.98))] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...softTransition, delay: 0.04 }}
        >
          <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {slug ? 'Edit Story' : 'Writing Studio'}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink dark:text-slate-50 sm:text-4xl">
                {slug ? 'Refine your draft' : 'Create a new story'}
              </h1>
             
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                {wordCount} words
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                <BookOpenText className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                {estimatedRead} min read
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <motion.div
              className="rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.08 }}
            >
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A compelling headline"
                className="mt-4 w-full border-0 bg-transparent p-0 font-serif text-3xl font-semibold text-ink outline-none placeholder:text-slate-300 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-600 sm:text-4xl"
                required
              />
            </motion.div>

            <motion.div
              className="rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.12 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Cover Image</label>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300">
                    <ImagePlus className="h-4 w-4" />
                    {coverImageUrl ? 'Replace cover' : 'Upload cover'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleCoverImageChange}
                    />
                  </label>
                  {coverImageUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageUrl('');
                        setCoverImageError('');
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-900 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/70">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt="" className="h-56 w-full object-cover sm:h-72" />
                ) : (
                  <div className="flex h-56 w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-500 dark:text-slate-400 sm:h-72">
                    <ImagePlus className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Add a visual anchor for your story</p>
                    <p className="max-w-md text-sm leading-6">
                      Upload a cover image to replace the default editorial artwork on the blog page and in the feed.
                    </p>
                  </div>
                )}
              </div>
              {coverImageError ? (
                <p className="mt-3 text-sm text-red-600 dark:text-red-300">{coverImageError}</p>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">PNG, JPG, WEBP, or GIF. Keep it under 300 KB for fast loading.</p>
              )}
            </motion.div>

            <motion.div
              className="rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.16 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Content</label>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
                  Markdown editor
                </div>
              </div>
              <div className="mt-4">
                <MarkdownEditor value={content} onChange={setContent} />
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softTransition, delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Status</label>
                <div className="relative">
                  <CircleDot className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm font-medium text-ink outline-none transition focus:border-cyan-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {mutation.error ? (
                  <span className="text-sm text-red-600 dark:text-red-300">{(mutation.error as Error).message}</span>
                ) : null}
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={springTransition}>
                  <AnimatedButton type="submit" disabled={mutation.isPending} size="lg" className="min-w-36 shadow-[0_16px_30px_rgba(15,23,42,0.12)]">
                    {mutation.isPending ? 'Saving...' : slug ? 'Update Story' : 'Publish Story'}
                  </AnimatedButton>
                </motion.div>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </motion.section>
    </MainLayout>
  );
};

export default WritePage;

