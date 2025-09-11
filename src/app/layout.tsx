import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import GoogleAnalytics from '@/components/analytics/google-analytics';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Script from 'next/script';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: 'FirstLook - Fall in Love with a Story.',
  description:
    'Discover captivating romance stories. Unlock premium content and immerse yourself in a world of passion and adventure.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://accounts.google.com/gsi/client" async strategy="beforeInteractive" />
      </head>
      <body
        className={`${playfairDisplay.variable} font-body`}
      >
        <GoogleAnalytics measurementId="G-TCQE0Z6MKG" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
