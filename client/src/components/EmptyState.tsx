interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h3 className="text-lg font-semibold text-ink dark:text-slate-100">{title}</h3>
    {description ? <p className="mt-2 text-sm text-muted dark:text-slate-300">{description}</p> : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);

export default EmptyState;

