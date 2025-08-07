
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { DataProvider } from '@/hooks/use-data';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Nivesh',
  description: 'Grow Steady. Earn Smart. Up to 9% Returns with Confidence',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%237C3AED%22></rect><path d=%22M25 75l18-18 12 12 19-19%22 stroke=%22white%22 stroke-width=%228%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/><path d=%22M58 50h16v16%22 stroke=%22white%22 stroke-width=%228%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased h-full">
          <AuthProvider>
            <DataProvider>
              {children}
              <Toaster />
            </DataProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
