import Navbar from '../components/Navbar';
import GradientBackground from '../components/animate-ui/GradientBackground';
import PageTransition from '../components/animate-ui/PageTransition';

const MainLayout = ({ children, contentClassName }: { children: React.ReactNode; contentClassName?: string }) => (
  <div className="relative min-h-screen text-ink transition-colors duration-200 dark:text-slate-100">
    <GradientBackground />
    <Navbar />
    <PageTransition className={contentClassName}>{children}</PageTransition>
  </div>
);

export default MainLayout;
