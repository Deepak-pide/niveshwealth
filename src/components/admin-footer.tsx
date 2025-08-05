
import { SlidersHorizontal, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminFooter() {
  return (
    <footer className="shrink-0 border-t bg-card">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-around">
          <Link href="/admin/manage" className="flex flex-col items-center gap-1 text-primary">
            <SlidersHorizontal className="h-6 w-6" />
            <span className="text-xs font-medium">Manage</span>
          </Link>
          <Link href="/admin/users" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <Users className="h-6 w-6" />
            <span className="text-xs font-medium">Users</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
}
