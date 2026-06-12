import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { forgotPassword } from '../services/auth';

type Mode = 'login' | 'register';

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'author' as 'author' | 'reader' });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, registerUser, googleLoginUser, resendVerificationEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const result = await registerUser(form);
        setInfo(result.message || 'Check your email to verify your account.');
      } else {
        await loginUser(form);
        const redirectPath = (location.state as any)?.from?.pathname || '/feed';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError('Enter your email first to reset your password');
      return;
    }

    setError(null);
    setInfo(null);
    try {
      const result = await forgotPassword(form.email);
      setInfo(result.message);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email) {
      setError('Enter your email first to resend verification');
      return;
    }

    setError(null);
    try {
      setInfo(await resendVerificationEmail(form.email));
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
            <>
              <div>
                <label className="text-sm font-semibold text-ink dark:text-slate-100">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink dark:text-slate-100">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as 'author' | 'reader' }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="author">Author</option>
                  <option value="reader">Reader</option>
                </select>
              </div>
            </>
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
              minLength={8}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          {mode === 'login' ? (
            <button type="button" onClick={handleForgotPassword} className="text-sm font-semibold text-accent">
              Forgot password?
            </button>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {info ? <p className="text-sm text-emerald-600">{info}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent"
          >
            {isSubmitting ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        {mode === 'login' ? (
          <button type="button" onClick={handleResendVerification} className="mx-auto block text-sm font-semibold text-accent">
            Resend verification email
          </button>
        ) : null}
        <div className="text-center text-sm text-muted dark:text-slate-300">or continue with</div>
        <div className="flex justify-center">
          {googleClientId ? (
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (!credentialResponse.credential) {
                  setError('Google did not return a sign-in credential');
                  return;
                }
                setError(null);
                setInfo(null);
                try {
                  await googleLoginUser(credentialResponse.credential);
                  const redirectPath = (location.state as any)?.from?.pathname || '/feed';
                  navigate(redirectPath, { replace: true });
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
              onError={() => setError('Google login failed. Check your OAuth client origin and try again.')}
              shape="pill"
              size="large"
              theme="outline"
              width="260"
            />
          ) : (
            <p className="text-center text-sm text-red-600">Google sign-in needs VITE_GOOGLE_CLIENT_ID.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthPage;

