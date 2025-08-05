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
              <path d="M7 21h10" />
              <path d="M10 21v-5.14a2 2 0 0 1 .55-1.42L12 13l1.45 1.44A2 2 0 0 1 14 15.86V21" />
              <path d="M12 13a4 4 0 0 1 4-4h2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3h2a4 4 0 0 1 4 4Z" />
              <path d="M12 13h.01" />
              <path d="m14 7 1 1" />
              <path d="m5 13 1 1" />
              <path d="M12 3v2" />
              <path d="M18 10h-1" />
              <path d="M7 10H6" />
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
