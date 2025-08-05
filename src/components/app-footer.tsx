import { Home, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer className="shrink-0 border-t bg-card">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-primary">
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/fd-investment" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <TrendingUp className="h-6 w-6" />
            <span className="text-xs font-medium">FD</span>
          </Link>
          <a href="#" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <Wallet className="h-6 w-6" />
            <span className="text-xs font-medium">My Balance</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
