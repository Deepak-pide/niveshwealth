import { Home, Briefcase, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer className="shrink-0 border-t bg-card shadow-inner">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-primary transition-colors hover:text-primary/80">
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/investments" className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            <Briefcase className="h-6 w-6" />
            <span className="text-xs font-medium">Investments</span>
          </Link>
          <Link href="/my-balance" className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
            <Wallet className="h-6 w-6" />
            <span className="text-xs font-medium">My Balance</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
}
