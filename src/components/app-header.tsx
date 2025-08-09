
"use client";

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LineChart, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UserNav from './user-nav';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useRef, useState } from 'react';

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { investmentRequests, fdWithdrawalRequests, topupRequests, balanceWithdrawalRequests } = useData();
  const isMobile = useIsMobile();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [prevTotalRequests, setPrevTotalRequests] = useState(0);

  const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const totalPendingRequests = investmentRequests.length + fdWithdrawalRequests.length + topupRequests.length + balanceWithdrawalRequests.length;

  useEffect(() => {
    if (isAdmin) {
      if (totalPendingRequests > prevTotalRequests) {
        audioRef.current?.play().catch(e => console.error("Audio play failed", e));
      }
      setPrevTotalRequests(totalPendingRequests);
    }
  }, [totalPendingRequests, prevTotalRequests, isAdmin]);

  return (
    <header className="shrink-0 border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            
            <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-3 group">
              <LineChart className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Nivesh
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
             {isAdmin && (
               <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                          <Bell className="h-5 w-5" />
                          {totalPendingRequests > 0 && (
                              <span className="absolute top-1 right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                          )}
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Pending Requests</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {totalPendingRequests > 0 ? (
                          <>
                              {investmentRequests.length > 0 && (
                                  <Link href="/admin/manage/fd">
                                      <DropdownMenuItem>
                                          <div className="flex justify-between w-full">
                                              <span>FD Investments</span>
                                              <span className="font-bold">{investmentRequests.length}</span>
                                          </div>
                                      </DropdownMenuItem>
                                  </Link>
                              )}
                              {fdWithdrawalRequests.length > 0 && (
                                  <Link href="/admin/manage/fd">
                                      <DropdownMenuItem>
                                          <div className="flex justify-between w-full">
                                              <span>FD Withdrawals</span>
                                              <span className="font-bold">{fdWithdrawalRequests.length}</span>
                                          </div>
                                      </DropdownMenuItem>
                                  </Link>
                              )}
                              {topupRequests.length > 0 && (
                                  <Link href="/admin/manage/balance">
                                      <DropdownMenuItem>
                                          <div className="flex justify-between w-full">
                                              <span>Balance Top-ups</span>
                                              <span className="font-bold">{topupRequests.length}</span>
                                          </div>
                                      </DropdownMenuItem>
                                  </Link>
                              )}
                              {balanceWithdrawalRequests.length > 0 && (
                                  <Link href="/admin/manage/balance">
                                      <DropdownMenuItem>
                                          <div className="flex justify-between w-full">
                                              <span>Balance Withdrawals</span>
                                              <span className="font-bold">{balanceWithdrawalRequests.length}</span>
                                          </div>
                                      </DropdownMenuItem>
                                  </Link>
                              )}
                          </>
                      ) : (
                          <DropdownMenuItem disabled>No pending requests</DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <audio ref={audioRef} src="/admin_notify.wav" preload="auto" />
               </>
            )}
             <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
