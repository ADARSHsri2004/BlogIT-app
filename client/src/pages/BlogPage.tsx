import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Share2, Sparkles } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MainLayout from '../layouts/MainLayout';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { commentOnBlog, deleteBlog, fetchBlogBySlug, likeBlog, shareBlog } from '../services/blogs';
import { useAuth } from '../hooks/useAuth';
import { formatDisplayDate, getEditorialImage } from '../utils/editorial';
import { AnimatedButton, AnimatedLinkButton } from '../components/animate-ui/button';
import type { Blog } from '../utils/types';

const BlogPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentName, setCommentName] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [shareStatus, setShareStatus] = useState('');

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

  const syncBlog = (updatedBlog: Blog) => {
    queryClient.setQueryData(['blog', slug], updatedBlog);
    queryClient.invalidateQueries({ queryKey: ['blogs'] });
  };

  const likeMutation = useMutation({
    mutationFn: (id: string) => likeBlog(id),
    onSuccess: (updatedBlog) => {
      localStorage.setItem(`blogit-liked-${updatedBlog._id}`, 'true');
      syncBlog(updatedBlog);
    }
  });

  const shareMutation = useMutation({
    mutationFn: (id: string) => shareBlog(id),
    onSuccess: syncBlog
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, name, message }: { id: string; name?: string; message: string }) =>
      commentOnBlog(id, { name, message }),
    onSuccess: (updatedBlog) => {
      setCommentMessage('');
      syncBlog(updatedBlog);
    }
  });

  if (isLoading) return <Spinner />;
  if (error || !blog) {
    return <EmptyState title="Blog not found" description={error?.message || 'The blog does not exist.'} />;
  }

  const isAuthor = user?.id === blog.author?._id || user?.id === blog.author?.id;
  const comments = blog.comments ?? [];
  const hasLiked = localStorage.getItem(`blogit-liked-${blog._id}`) === 'true';
  const articleUrl = typeof window === 'undefined' ? '' : window.location.href;
  const shareText = blog.summary || `Read "${blog.title}" on BlogIT.`;

  const sortedComments = [...comments].sort((first, second) => {
    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });

  const handleLike = () => {
    if (hasLiked || likeMutation.isPending) return;
    likeMutation.mutate(blog._id);
  };

  const handleShare = async () => {
    setShareStatus('');

    try {
      if (navigator.share) {
        await navigator.share({ title: blog.title, text: shareText, url: articleUrl });
        setShareStatus('Shared');
      } else {
        await navigator.clipboard.writeText(articleUrl);
        setShareStatus('Link copied');
      }
      shareMutation.mutate(blog._id);
    } catch {
      setShareStatus('Share canceled');
    }
  };

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = commentMessage.trim();
    if (!message || commentMutation.isPending) return;

    commentMutation.mutate({
      id: blog._id,
      name: commentName.trim() || user?.name || 'Reader',
      message
    });
  };

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
                <AnimatedLinkButton
                  to={`/write/${blog.slug}`}
                  variant="secondary"
                  size="sm"
                >
                  Edit
                </AnimatedLinkButton>
                <AnimatedButton
                  onClick={() => deleteMutation.mutate(blog._id)}
                  variant="danger"
                  size="sm"
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </AnimatedButton>
              </div>
            ) : null}
          </div>
          <div className="prose prose-lg mt-8 max-w-none prose-headings:text-ink prose-p:text-ink prose-strong:text-ink prose-a:text-accent">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
          </div>
          <motion.section
            className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60 sm:p-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <motion.button
                type="button"
                onClick={handleLike}
                disabled={hasLiked || likeMutation.isPending}
                className="group flex min-h-16 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-default dark:border-slate-700 dark:bg-slate-800 dark:hover:border-rose-400/40 dark:hover:bg-rose-950/30"
                whileHover={{ y: hasLiked ? 0 : -2 }}
                whileTap={{ scale: hasLiked ? 1 : 0.98 }}
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-slate-400">
                    Like
                  </span>
                  <span className="text-lg font-bold text-ink dark:text-slate-100">{blog.likes ?? 0}</span>
                </span>
                <motion.span
                  animate={hasLiked ? { scale: [1, 1.25, 1], rotate: [0, -10, 0] } : { scale: 1 }}
                  className="rounded-full bg-rose-100 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  <Heart className={hasLiked ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
                </motion.span>
              </motion.button>

              <motion.div
                className="flex min-h-16 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                whileHover={{ y: -2 }}
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-slate-400">
                    Comments
                  </span>
                  <span className="text-lg font-bold text-ink dark:text-slate-100">{comments.length}</span>
                </span>
                <span className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <MessageCircle className="h-5 w-5" />
                </span>
              </motion.div>

              <motion.button
                type="button"
                onClick={handleShare}
                disabled={shareMutation.isPending}
                className="flex min-h-16 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-950/30"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-slate-400">
                    Share
                  </span>
                  <span className="text-lg font-bold text-ink dark:text-slate-100">{blog.shares ?? 0}</span>
                </span>
                <span className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Share2 className="h-5 w-5" />
                </span>
              </motion.button>
            </div>

            <AnimatePresence>
              {shareStatus ? (
                <motion.p
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-muted shadow-sm dark:bg-slate-800 dark:text-slate-300"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {shareStatus}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <form onSubmit={handleCommentSubmit} className="mt-6 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto]">
                <label className="sr-only" htmlFor="comment-name">
                  Name
                </label>
                <input
                  id="comment-name"
                  value={commentName}
                  onChange={(event) => setCommentName(event.target.value)}
                  maxLength={80}
                  placeholder={user?.name || 'Your name'}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <label className="sr-only" htmlFor="comment-message">
                  Comment
                </label>
                <input
                  id="comment-message"
                  value={commentMessage}
                  onChange={(event) => setCommentMessage(event.target.value)}
                  maxLength={600}
                  placeholder="Add a thoughtful comment"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <AnimatedButton
                  type="submit"
                  size="md"
                  disabled={!commentMessage.trim() || commentMutation.isPending}
                  className="h-11 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                  Comment
                </AnimatedButton>
              </div>
              {commentMutation.isError ? (
                <p className="text-sm font-medium text-red-600 dark:text-red-300">
                  {commentMutation.error.message}
                </p>
              ) : null}
            </form>

            <div className="mt-5 space-y-3">
              <AnimatePresence initial={false}>
                {sortedComments.map((comment) => (
                  <motion.div
                    key={comment._id || `${comment.name}-${comment.createdAt}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-ink dark:text-slate-100">{comment.name || 'Reader'}</span>
                      <span className="text-xs text-muted dark:text-slate-400">
                        {formatDisplayDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink dark:text-slate-200">{comment.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!comments.length ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-muted dark:border-slate-700 dark:text-slate-300">
                  No comments yet. Be the first to respond.
                </p>
              ) : null}
            </div>
          </motion.section>
        </div>
      </article>
    </MainLayout>
  );
};

export default BlogPage;
