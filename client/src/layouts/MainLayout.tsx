import Navbar from '../components/Navbar';

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-soft text-ink transition-colors duration-200 dark:bg-slate-900 dark:text-slate-100">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">{children}</main>
  </div>
);

export default MainLayout;

