
"use client";

import { LayoutDashboard, Users, Send } from 'lucide-react';
import Link from 'next/link';

export default function AdminFooter() {

  return (
    <footer className="shrink-0 border-t bg-card shadow-inner">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-around">
          <Link href="/admin/manage" className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs font-medium">Manage</span>
          </Link>
          <Link href="/admin/users" className="relative flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            <Users className="h-6 w-6" />
            <span className="text-xs font-medium">Users</span>
          </Link>
          <Link href="/admin/manage/send-alert" className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            <Send className="h-6 w-6" />
            <span className="text-xs font-medium">Send Alert</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
}
