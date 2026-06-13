import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = ({ value, onChange }: EditorProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <textarea className="h-64 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" value={value} readOnly />;
  }

  return (
    <div
      data-color-mode={theme}
      className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-slate-700 dark:bg-slate-950"
    >
      <MDEditor value={value} onChange={(val) => onChange(val || '')} height={400} preview="edit" />
    </div>
  );
};

export default MarkdownEditor;

