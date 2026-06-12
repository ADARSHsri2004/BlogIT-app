import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { resetPassword } from '../services/auth';
import { AnimatedButton } from '../components/animate-ui/button';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const token = params.get('token');
    if (!token) {
      setError('Reset token is missing');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const result = await resetPassword(token, password);
      setMessage(result.message);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink dark:text-slate-100">Choose a new password</h1>
          <p className="mt-2 text-sm text-muted dark:text-slate-300">Use at least 8 characters for your new password.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-ink dark:text-slate-100">New password</label>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-slate-100">Confirm password</label>
            <input
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          <AnimatedButton
            type="submit"
            className="w-full"
            size="lg"
          >
            Reset password
          </AnimatedButton>
        </form>
        <Link to="/auth" className="block text-center text-sm font-semibold text-accent">
          Back to sign in
        </Link>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;
