import { Button } from '@/components/ui/button';

export default function AppHeader() {
  return (
    <header className="shrink-0 border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Nivesh
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button>Login</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
