import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, RefreshCcw, Send, Share2, Sparkles } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MainLayout from '../layouts/MainLayout';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { commentOnBlog, deleteBlog, fetchBlogBySlug, likeBlog, regenerateBlogMetadata, shareBlog } from '../services/blogs';
import { useAuth } from '../hooks/useAuth';
import { formatDisplayDate, getEditorialImage } from '../utils/editorial';
import { AnimatedButton, AnimatedIconButton, AnimatedLinkButton } from '../components/animate-ui/button';
import type { Blog } from '../utils/types';

const activeProcessingStates = new Set(['queued', 'processing']);

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
    enabled: Boolean(slug),
    refetchInterval: (query) => {
      const metadataStatus = (query.state.data as Blog | undefined)?.generatedMetadata?.processingStatus;
      return metadataStatus && activeProcessingStates.has(metadataStatus) ? 2500 : false;
    }
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

  const regenerateMutation = useMutation({
    mutationFn: (id: string) => regenerateBlogMetadata(id),
    onSuccess: syncBlog
  });

  useEffect(() => {
    if (!blog) return;
    document.title = blog.generatedMetadata?.seoTitle || blog.title;
  }, [blog]);

  if (isLoading) return <Spinner />;
  if (error || !blog) {
    return <EmptyState title="Blog not found" description={error?.message || 'The blog does not exist.'} />;
  }

  const isAuthor = user?.id === blog.author?._id || user?.id === blog.author?.id;
  const metadata = blog.generatedMetadata;
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

  const scrollToComments = () => {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MainLayout contentClassName="px-3 py-5 sm:px-4 lg:px-5 xl:px-6">
      <article className="mx-auto max-w-5xl pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: 'easeOut' }}>
          <AnimatedLinkButton to="/feed" variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </AnimatedLinkButton>
        </motion.div>

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{blog.status}</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-ink dark:text-slate-50 sm:text-5xl">
              {blog.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-ink dark:text-slate-100">{blog.author?.name}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{formatDisplayDate(blog.publishedAt || blog.createdAt)}</span>
            </div>
            {metadata?.categories?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {metadata.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : null}
            {blog.summary ? (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{blog.summary}</p>
            ) : null}
            {metadata?.tldrBullets?.length ? (
              <div className="mt-6 grid gap-3">
                {metadata.tldrBullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="max-w-2xl rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-slate-200/80 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3 rounded-full bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-700">
                <AnimatedIconButton
                  onClick={handleLike}
                  disabled={hasLiked || likeMutation.isPending}
                  variant={hasLiked ? 'primary' : 'secondary'}
                  aria-label="Like post"
                >
                  <Heart className={hasLiked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                </AnimatedIconButton>
                <div className="pr-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Likes</p>
                  <p className="text-sm font-semibold text-ink dark:text-slate-100">{blog.likes ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-full bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-700">
                <AnimatedIconButton onClick={scrollToComments} variant="secondary" aria-label="Jump to comments">
                  <MessageCircle className="h-4 w-4" />
                </AnimatedIconButton>
                <div className="pr-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Comments</p>
                  <p className="text-sm font-semibold text-ink dark:text-slate-100">{comments.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-full bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-700">
                <AnimatedIconButton onClick={handleShare} disabled={shareMutation.isPending} variant="secondary" aria-label="Share post">
                  <Share2 className="h-4 w-4" />
                </AnimatedIconButton>
                <div className="pr-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Shares</p>
                  <p className="text-sm font-semibold text-ink dark:text-slate-100">{blog.shares ?? 0}</p>
                </div>
              </div>

              {isAuthor ? (
                <div className="ml-auto flex flex-wrap gap-2">
                  <AnimatedLinkButton to={`/write/${blog.slug}`} variant="secondary" size="sm">
                    Edit story
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

            <AnimatePresence>
              {shareStatus ? (
                <motion.p
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-700"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {shareStatus}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.div>

          <motion.aside
            className="lg:sticky lg:top-24"
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.16)] dark:bg-slate-900">
              <div className="aspect-[4/5]">
                <img src={getEditorialImage(blog)} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <p className="font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Story Notes</p>
              <p>{metadata?.metaDescription || 'Read, react, and share without the extra chrome. This layout keeps the focus on the writing while the key actions stay close by.'}</p>
              {metadata?.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {isAuthor ? (
                <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Repurposing Engine</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Status: {metadata?.processingStatus || 'idle'}
                        {metadata?.provider ? ` via ${metadata.provider}` : ''}
                      </p>
                    </div>
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      disabled={regenerateMutation.isPending}
                      onClick={() => regenerateMutation.mutate(blog._id)}
                    >
                      <RefreshCcw className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                      Regenerate
                    </AnimatedButton>
                  </div>
                  {metadata?.socialCopy?.twitter ? (
                    <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Twitter Copy</p>
                      <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{metadata.socialCopy.twitter}</p>
                    </div>
                  ) : null}
                  {metadata?.socialCopy?.linkedin ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">LinkedIn Copy</p>
                      <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{metadata.socialCopy.linkedin}</p>
                    </div>
                  ) : null}
                  {metadata?.validationErrors?.length ? (
                    <div className="mt-4 space-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200">
                      {metadata.validationErrors.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.aside>
        </section>

        <motion.div
          className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
        >
          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-ink prose-p:text-ink prose-strong:text-ink prose-a:text-accent dark:prose-headings:text-slate-50 dark:prose-p:text-slate-200 dark:prose-strong:text-slate-50 dark:prose-a:text-cyan-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6 border-l border-slate-200 pl-6 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Readers</p>
                <p className="mt-2 text-2xl font-semibold text-ink dark:text-slate-100">{(blog.likes ?? 0) + comments.length + (blog.shares ?? 0)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">A quick read with visible momentum from the community around it.</p>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>{blog.likes ?? 0} likes</p>
                <p>{comments.length} comments</p>
                <p>{blog.shares ?? 0} shares</p>
              </div>
            </div>
          </aside>
        </motion.div>

        <motion.section
          id="comments"
          className="mt-16 border-t border-slate-200 pt-10 dark:border-slate-800"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.18 }}
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Conversation</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-ink dark:text-slate-50">What readers are saying</h2>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
                Drop a response, add context, or leave a note for the next reader who lands here.
              </p>
            </div>

            <div>
              <form onSubmit={handleCommentSubmit} className="grid gap-3 rounded-[1.75rem] bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-700">
                <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                  <label className="sr-only" htmlFor="comment-name">
                    Name
                  </label>
                  <input
                    id="comment-name"
                    value={commentName}
                    onChange={(event) => setCommentName(event.target.value)}
                    maxLength={80}
                    placeholder={user?.name || 'Your name'}
                    className="h-12 rounded-full border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                    className="h-12 rounded-full border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {commentMutation.isError ? (
                    <p className="text-sm font-medium text-red-600 dark:text-red-300">{commentMutation.error.message}</p>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Keep it kind, clear, and useful.</p>
                  )}
                  <AnimatedButton
                    type="submit"
                    size="md"
                    disabled={!commentMessage.trim() || commentMutation.isPending}
                    className="min-w-36"
                  >
                    <Send className="h-4 w-4" />
                    Comment
                  </AnimatedButton>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            <AnimatePresence initial={false}>
              {sortedComments.map((comment, index) => (
                <motion.article
                  key={comment._id || `${comment.name}-${comment.createdAt}`}
                  className="relative border-l border-slate-200 pl-6 dark:border-slate-800"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.24, ease: 'easeOut', delay: index * 0.03 }}
                >
                  <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-ink dark:text-slate-100">{comment.name || 'Reader'}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatDisplayDate(comment.createdAt)}</span>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-200">{comment.message}</p>
                </motion.article>
              ))}
            </AnimatePresence>

            {!comments.length ? (
              <p className="border-t border-dashed border-slate-300 pt-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                No comments yet. Be the first to respond.
              </p>
            ) : null}
          </div>
        </motion.section>
      </article>
    </MainLayout>
  );
};

export default BlogPage;
