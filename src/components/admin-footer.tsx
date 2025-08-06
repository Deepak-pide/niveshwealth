
"use client";

import { LayoutDashboard, Users } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/hooks/use-data';

export default function AdminFooter() {
  const { profileCompletionRequests } = useData();
  const hasProfileRequests = profileCompletionRequests.length > 0;

  return (
    <footer className="shrink-0 border-t bg-card shadow-inner">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-around">
          <Link href="/admin/manage" className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs font-medium">Manage</span>
          </Link>
          <Link href="/admin/users" className="relative flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            {hasProfileRequests && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
            )}
            <Users className="h-6 w-6" />
            <span className="text-xs font-medium">Users</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
}
