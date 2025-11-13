'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to admin page
    router.push('/admin');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirection vers l'admin...</p>
    </div>
  );
}
