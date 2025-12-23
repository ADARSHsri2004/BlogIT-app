import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';

type Mode = 'login' | 'register';

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, registerUser, googleLoginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'register') {
        await registerUser(form);
      } else {
        await loginUser(form);
      }
      const redirectPath = (location.state as any)?.from?.pathname || '/feed';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-ink dark:text-slate-100">
            {mode === 'login' ? 'Welcome back' : 'Join BlogIT'}
          </h1>
          <button
            onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
            className="text-sm font-semibold text-accent"
          >
            {mode === 'login' ? 'Need an account?' : 'Have an account?'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' ? (
            <div>
              <label className="text-sm font-semibold text-ink dark:text-slate-100">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          ) : null}
          <div>
            <label className="text-sm font-semibold text-ink dark:text-slate-100">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-slate-100">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent"
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div className="text-center text-sm text-muted dark:text-slate-300">or continue with</div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (!credentialResponse.credential) return;
              setError(null);
              try {
                await googleLoginUser(credentialResponse.credential);
                const redirectPath = (location.state as any)?.from?.pathname || '/feed';
                navigate(redirectPath, { replace: true });
              } catch (err) {
                setError((err as Error).message);
              }
            }}
            onError={() => setError('Google login failed')}
            shape="pill"
            size="large"
            theme="outline"
            width="260"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthPage;

