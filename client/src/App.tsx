import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FeedPage from './pages/FeedPage';
import BlogPage from './pages/BlogPage';
import WritePage from './pages/WritePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/blog/:slug" element={<BlogPage />} />
    <Route
      path="/write"
      element={
        <ProtectedRoute>
          <WritePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/write/:slug"
      element={
        <ProtectedRoute>
          <WritePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
