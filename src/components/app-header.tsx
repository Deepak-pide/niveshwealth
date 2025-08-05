
"use client";

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LineChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <header className="shrink-0 border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-3 group">
            <LineChart className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Nivesh
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="role-switch">User</Label>
              <Switch
                id="role-switch"
                checked={isAdmin}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="role-switch">Admin</Label>
            </div>
            <Button className="transform transition-transform duration-300 hover:scale-105">Login</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
