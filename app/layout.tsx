import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dynamic Quiz Builder',
  description: 'Create and share interactive quizzes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
