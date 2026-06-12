import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { verifyEmail } from '../services/auth';
import { AnimatedLinkButton } from '../components/animate-ui/button';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('Verification token is missing');
      return;
    }

    verifyEmail(token)
      .then((result) => {
        setMessage(result.message || 'Email verified');
        setTimeout(() => navigate('/feed', { replace: true }), 1200);
      })
      .catch((err: Error) => setError(err.message));
  }, [navigate, params]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-lg">
        {error ? (
          <EmptyState
            title="Verification failed"
            description={error}
            action={
              <AnimatedLinkButton to="/auth" size="sm">
                Back to sign in
              </AnimatedLinkButton>
            }
          />
        ) : (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Spinner />
            <p className="text-sm text-muted dark:text-slate-300">{message}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VerifyEmailPage;
