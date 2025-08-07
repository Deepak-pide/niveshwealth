
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { DataProvider } from '@/hooks/use-data';
import { AuthProvider } from '@/hooks/use-auth';
import { GlobalAlertDialog } from '@/components/global-alert-dialog';

export const metadata: Metadata = {
  title: 'Nivesh',
  description: 'Grow Steady. Earn Smart. Up to 9% Returns with Confidence',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Nivesh',
    description: 'Grow Steady. Earn Smart. Up to 9% Returns with Confidence',
    images: [
      {
        url: '/logo.svg',
        width: 800,
        height: 600,
        alt: 'Nivesh Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nivesh',
    description: 'Grow Steady. Earn Smart. Up to 9% Returns with Confidence',
    images: ['/logo.svg'],
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
              <GlobalAlertDialog />
            </DataProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
