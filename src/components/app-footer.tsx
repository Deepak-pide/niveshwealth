import { Copyright } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="shrink-0 border-t bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-center">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Copyright className="h-4 w-4" /> {new Date().getFullYear()} Nivesh Insights. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
