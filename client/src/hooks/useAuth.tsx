import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMe,
  login,
  logout,
  register,
  googleLogin,
  resendVerification,
  updateProfile,
  type AuthPayload,
  type AuthResult,
  type ProfileUpdatePayload
} from '../services/auth';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../utils/types';

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  canWrite: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  loginUser: (payload: AuthPayload) => Promise<User>;
  registerUser: (payload: AuthPayload) => Promise<AuthResult>;
  googleLoginUser: (credential: string) => Promise<User>;
  resendVerificationEmail: (email: string) => Promise<string>;
  updateProfileDetails: (payload: ProfileUpdatePayload) => Promise<User>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false
  });

  const loginUser = async (payload: AuthPayload) => {
    const result = await login(payload);
    queryClient.setQueryData(['me'], result.user);
    return result.user;
  };

  const registerUser = async (payload: AuthPayload) => {
    return register(payload);
  };

  const logoutUser = async () => {
    await logout();
    queryClient.removeQueries({ queryKey: ['me'] });
  };

  const updateProfileDetails = async (payload: ProfileUpdatePayload) => {
    const result = await updateProfile(payload);
    queryClient.setQueryData(['me'], result.user);
    return result.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isVerified: Boolean(user?.emailVerified),
        canWrite: Boolean(user && user.emailVerified && ['admin', 'author'].includes(user.role)),
        hasRole: (...roles: UserRole[]) => Boolean(user && roles.includes(user.role)),
        loginUser,
        registerUser,
        googleLoginUser: async (credential: string) => {
          const result = await googleLogin(credential);
          queryClient.setQueryData(['me'], result.user);
          return result.user;
        },
        resendVerificationEmail: async (email: string) => (await resendVerification(email)).message,
        updateProfileDetails,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

