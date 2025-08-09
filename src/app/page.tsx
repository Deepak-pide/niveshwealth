
"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppHeader from "@/components/app-header";
import InvestmentPage from "@/components/investment-page";
import AppFooter from "@/components/app-footer";
import { Skeleton } from '@/components/ui/skeleton';
import { useData } from '@/hooks/use-data';
import { isSameMonth, isSameYear } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const { interestPayouts } = useData();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showInterestNotification, setShowInterestNotification] = useState(false);

  const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const today = new Date();
  const latestInterestPayout = user 
    ? interestPayouts
        .filter(p => p.userId === user.uid && isSameMonth(p.date.toDate(), today) && isSameYear(p.date.toDate(), today))
        .sort((a, b) => b.date.toMillis() - a.date.toMillis())[0]
    : null;

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin');
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (latestInterestPayout) {
        const notificationKey = `interestNotification_${user?.uid}_${latestInterestPayout.id}`;
        const notificationShown = localStorage.getItem(notificationKey);
        const now = new Date().getTime();

        if (notificationShown) {
            const { timestamp } = JSON.parse(notificationShown);
            const twelveHours = 12 * 60 * 60 * 1000;
            // Show notification if it's been less than 12 hours, but don't play sound
            if (now - timestamp < twelveHours) {
                setShowInterestNotification(true);
            } else {
                setShowInterestNotification(false);
            }
        } else {
            // First time seeing this notification
            setShowInterestNotification(true);
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
            localStorage.setItem(notificationKey, JSON.stringify({ timestamp: now }));
        }
    }
  }, [latestInterestPayout, user?.uid]);


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
      <main className="flex-1 overflow-y-auto p-4">
        {showInterestNotification && latestInterestPayout && (
            <Card className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
                <CardContent className="p-4 flex items-center gap-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">Monthly Interest Credited!</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            An interest of ₹{latestInterestPayout.amount.toLocaleString('en-IN')} has been added to your balance.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )}
        <InvestmentPage />
        <audio ref={audioRef} src="/get_notify.wav" preload="auto" />
      </main>
      <AppFooter />
    </div>
  );
}
