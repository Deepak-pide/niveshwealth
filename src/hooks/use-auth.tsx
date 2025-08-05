
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col h-screen">
            <header className="shrink-0 border-b bg-card shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-10 w-20" />
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-8">
                <Skeleton className="w-full h-full" />
            </main>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
