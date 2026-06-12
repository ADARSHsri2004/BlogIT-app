import { Link } from 'react-router-dom';
import type { Blog } from '../utils/types';
import { formatDisplayDate, getEditorialImage } from '../utils/editorial';

const BlogCard = ({ blog }: { blog: Blog }) => (
  <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
    <Link to={`/blog/${blog.slug}`} className="block h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
      <img
        src={getEditorialImage(blog)}
        alt=""
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    </Link>
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/blog/${blog.slug}`}
            className="font-serif text-xl font-semibold text-ink group-hover:text-accent dark:text-slate-100"
          >
            {blog.title}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-muted dark:text-slate-300">
            {blog.summary || 'No summary provided.'}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted dark:text-slate-300">
            <span className="font-medium text-ink dark:text-slate-100">{blog.author?.name || 'Unknown'}</span>
            <span>/</span>
            <span>{formatDisplayDate(blog.publishedAt || blog.createdAt)}</span>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-ink dark:bg-slate-700 dark:text-slate-100">
          {blog.status}
        </span>
      </div>
    </div>
  </article>
);

export default BlogCard;
