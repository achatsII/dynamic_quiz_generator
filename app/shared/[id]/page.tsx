'use client';

import PublicQuiz from '@/components/PublicQuiz';
import { use } from 'react';

export default function SharedQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PublicQuiz quizId={id} />
    </main>
  );
}
