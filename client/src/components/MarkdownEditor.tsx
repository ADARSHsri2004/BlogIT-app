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
    return <textarea className="h-64 w-full rounded-lg border border-slate-200 p-3" value={value} readOnly />;
  }

  return (
    <div
      data-color-mode={theme}
      className="rounded-xl border border-slate-200 shadow-inner dark:border-slate-700"
    >
      <MDEditor value={value} onChange={(val) => onChange(val || '')} height={400} preview="edit" />
    </div>
  );
};

export default MarkdownEditor;

