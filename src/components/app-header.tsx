import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  return (
    <header className="shrink-0 border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Nivesh Insights
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost">Sign In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
