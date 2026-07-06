import type { Metadata } from 'next';
import { vazirmatn } from '@/lib/fonts';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeScript } from '@/components/ThemeScript';
import './globals.css';

export const metadata: Metadata = {
  title: 'کستامینوفن — پادکست، کتاب صوتی، ویدیو',
  description: 'Super App رسانه‌ای برای بازار فارسی',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={vazirmatn.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
