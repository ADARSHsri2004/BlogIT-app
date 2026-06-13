import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, MoreVertical } from 'lucide-react';
import type { Blog } from '../utils/types';
import { formatDisplayDate, getEditorialImage } from '../utils/editorial';
import { Card, CardBody } from './ui/Card';
import { springTransition } from './animate-ui/transitions';

type BlogCardProps = {
  blog: Blog;
};

const getReadTime = (content: string) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min`;
};

const BlogCard = ({ blog }: BlogCardProps) => (
  <Card
    className="min-h-full"
    whileHover={{ y: -6, boxShadow: '0 22px 54px rgba(15, 23, 42, 0.11)' }}
    transition={springTransition}
  >
    <Link
      to={`/blog/${blog.slug}`}
      className="block h-60 overflow-hidden bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 dark:bg-slate-800"
      aria-label={`Read ${blog.title}`}
    >
      <img
        src={getEditorialImage(blog)}
        alt=""
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
    </Link>
    <CardBody className="flex min-h-[270px] flex-col justify-between px-5 py-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={getEditorialImage(blog)}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-950"
            />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-ink dark:text-slate-100">
                {blog.author?.name || 'Unknown writer'}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] text-slate-500 dark:text-slate-400">
                <time dateTime={blog.publishedAt || blog.createdAt}>{formatDisplayDate(blog.publishedAt || blog.createdAt)}</time>
                <span>-</span>
                <span>{getReadTime(blog.content)}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-700 transition hover:bg-slate-50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-slate-300 dark:hover:bg-slate-900"
            aria-label={`More options for ${blog.title}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <Link
          to={`/blog/${blog.slug}`}
          className="mt-5 block font-serif text-[1.6rem] font-semibold italic leading-[1.08] text-slate-700 outline-none transition group-hover:text-accent focus-visible:text-accent dark:text-slate-100"
        >
          {blog.title}
        </Link>
        {blog.generatedMetadata?.categories?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {blog.generatedMetadata.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                {category}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {blog.summary || 'No summary provided.'}
        </p>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-3 transition-colors group-hover:border-slate-300 dark:border-slate-800 dark:group-hover:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5" aria-label={`${blog.shares ?? 0} views`}>
              <Eye className="h-4 w-4" />
              {blog.shares ?? 0}
            </span>
            <span className="inline-flex items-center gap-1.5" aria-label={`${blog.comments?.length ?? 0} comments`}>
              <MessageCircle className="h-4 w-4" />
              {blog.comments?.length ?? 0}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-rose-500" aria-label={`${blog.likes ?? 0} likes`}>
            <Heart className="h-4 w-4" />
            <span className="sr-only">{blog.likes ?? 0}</span>
          </span>
        </div>
      </div>
    </CardBody>
  </Card>
);

export default BlogCard;
