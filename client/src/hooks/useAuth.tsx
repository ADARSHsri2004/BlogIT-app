import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, login, logout, register, googleLogin, type AuthPayload } from '../services/auth';
import type { ReactNode } from 'react';
import type { User } from '../utils/types';

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (payload: AuthPayload) => Promise<User>;
  registerUser: (payload: AuthPayload) => Promise<User>;
  googleLoginUser: (credential: string) => Promise<User>;
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
    const logged = await login(payload);
    queryClient.setQueryData(['me'], logged);
    return logged;
  };

  const registerUser = async (payload: AuthPayload) => {
    const registered = await register(payload);
    queryClient.setQueryData(['me'], registered);
    return registered;
  };

  const logoutUser = async () => {
    await logout();
    queryClient.removeQueries({ queryKey: ['me'] });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        loginUser,
        registerUser,
        googleLoginUser: async (credential: string) => {
          const logged = await googleLogin(credential);
          queryClient.setQueryData(['me'], logged);
          return logged;
        },
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

