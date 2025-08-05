import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="shrink-0 border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <LineChart className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Nivesh
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button>Login</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
