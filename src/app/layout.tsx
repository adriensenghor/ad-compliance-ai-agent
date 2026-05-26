import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Cross-State Ad Compliance Agent',
  description:
    'Interactive alcohol advertising compliance assistant for Utah and Nevada rules.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}

