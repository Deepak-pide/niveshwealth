import { Home, TrendingUp, Wallet } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="shrink-0 border-t bg-card">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-around">
          <a href="#" className="flex flex-col items-center gap-1 text-primary">
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <TrendingUp className="h-6 w-6" />
            <span className="text-xs font-medium">FD</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
            <Wallet className="h-6 w-6" />
            <span className="text-xs font-medium">My Balance</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
