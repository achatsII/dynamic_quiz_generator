'use client';

import AdminPage from '@/components/AdminPage';
import Link from 'next/link';

const Header = () => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link href="/admin" className="text-2xl font-bold text-slate-800 hover:text-slate-600">
        Quiz Builder
      </Link>
      <Link href="/admin" className="text-slate-600 hover:text-slate-900 font-semibold">
        Admin Panel
      </Link>
    </nav>
  </header>
);

export default function AdminPageRoute() {
  return (
    <>
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <AdminPage />
      </main>
    </>
  );
}
