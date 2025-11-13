
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import AdminPage from './components/AdminPage';
import QuizPage from './components/QuizPage';
import PublicQuiz from './components/PublicQuiz';

const Header = () => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-slate-800 hover:text-slate-600">
        Quiz Builder
      </Link>
      <Link to="/" className="text-slate-600 hover:text-slate-900 font-semibold">
        Admin Panel
      </Link>
    </nav>
  </header>
);


const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public quiz route - no header, embeddable in iframe */}
        <Route path="/shared/:quizId" element={
          <div className="min-h-screen bg-slate-50 text-slate-800">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
              <PublicQuiz />
            </main>
          </div>
        } />
        
        {/* Admin routes with header */}
        <Route path="/*" element={
          <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<AdminPage />} />
                <Route path="/quiz/:quizId" element={<QuizPage />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;