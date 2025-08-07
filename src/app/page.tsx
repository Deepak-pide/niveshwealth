
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppHeader from "@/components/app-header";
import InvestmentPage from "@/components/investment-page";
import AppFooter from "@/components/app-footer";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || isAdmin) {
    return (
      <div className="flex flex-col h-screen bg-background p-4 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="flex-1 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <InvestmentPage />
      </main>
      <AppFooter />
    </div>
  );
}
