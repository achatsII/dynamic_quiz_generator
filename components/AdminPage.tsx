import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Quiz, QuizResult, Question } from '../types';
import { createQuiz, getAllResults, getAllQuizzes } from '../services/apiService';

const AdminPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const [quizTitle, setQuizTitle] = useState('');
  const [quizJsonData, setQuizJsonData] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdQuizLink, setCreatedQuizLink] = useState('');
  const [createdShareableLink, setCreatedShareableLink] = useState('');

  const [quizzes, setQuizzes] = useState<(Quiz & { _id: string })[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchResults();
      fetchQuizzes();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Mot de passe incorrect.');
    }
  };
  
  const fetchQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const response = await getAllQuizzes();
      if (response.success) {
        setQuizzes(response.results.map(q => ({ ...q.json_data, _id: q._id! })));
      }
    } catch (err) {
      setError('Impossible de charger la liste des quiz.');
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const fetchResults = async () => {
    setIsLoadingResults(true);
    try {
      const response = await getAllResults();
      if (response.success) {
        setResults(response.results.map(r => ({ ...r.json_data, _id: r._id })).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      }
    } catch (err) {
      setError('Impossible de charger les résultats.');
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || !quizJsonData) {
      setError('Le titre et les données JSON sont requis.');
      return;
    }
    
    setIsCreating(true);
    setError('');
    setCreatedQuizLink('');
    setCreatedShareableLink('');

    try {
      const cleanedJsonString = quizJsonData.replace(/&quot;/g, '"');
      const parsedData = JSON.parse(cleanedJsonString);
      const questions: Question[] = parsedData.quiz;

      if (!Array.isArray(questions)) {
        throw new Error("La structure JSON est invalide. Attendu: { quiz: [...] }");
      }
      
      const response = await createQuiz({ title: quizTitle, questions });
      if (response.success && response.results.length > 0) {
        const quizId = response.results[0].inserted_id;
        const link = `#/quiz/${quizId}`;
        const shareableLink = `${window.location.origin}${window.location.pathname}#/shared/${quizId}`;
        setCreatedQuizLink(link);
        setCreatedShareableLink(shareableLink);
        setQuizTitle('');
        setQuizJsonData('');
        fetchQuizzes();
      } else {
        throw new Error('La création du quiz a échoué.');
      }
    } catch (err: any) {
      setError(`Erreur lors de la création: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Accès Administrateur</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Connexion
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Créer un nouveau Quiz</h2>
        <form onSubmit={handleCreateQuiz}>
          <div className="mb-4">
            <label htmlFor="quizTitle" className="block text-sm font-medium text-slate-700">Titre du Quiz</label>
            <input
              type="text"
              id="quizTitle"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Ex: Quiz sur les Objections Commerciales"
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="quizJsonData" className="block text-sm font-medium text-slate-700">Données du Quiz (JSON)</label>
            <textarea
              id="quizJsonData"
              rows={10}
              value={quizJsonData}
              onChange={(e) => setQuizJsonData(e.target.value)}
              placeholder='Collez ici les données brutes contenant { "quiz": [...] }'
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          </div>
          <button type="submit" disabled={isCreating} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {isCreating ? 'Création...' : 'Créer le Quiz'}
          </button>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {createdQuizLink && (
            <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-md">
              <h3 className="font-semibold text-green-800">Quiz créé avec succès !</h3>
              <p className="text-sm text-green-700 mt-2">Lien relatif (admin) :</p>
              <input type="text" readOnly value={createdQuizLink} className="mt-1 w-full p-2 border border-green-300 bg-white rounded-md text-sm" onClick={(e) => (e.target as HTMLInputElement).select()} />
              
              <p className="text-sm text-green-700 mt-4 font-semibold">Lien partageable (public, sans authentification) :</p>
              <p className="text-xs text-green-600 mb-1">Utilisez ce lien dans un iframe. Les résultats sont envoyés au backend.</p>
              <input type="text" readOnly value={createdShareableLink} className="mt-1 w-full p-2 border border-green-300 bg-white rounded-md text-sm font-mono" onClick={(e) => (e.target as HTMLInputElement).select()} />
            </div>
          )}
        </form>

        <hr className="my-8 border-slate-200" />
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Quiz Créés</h2>
            <button onClick={fetchQuizzes} disabled={isLoadingQuizzes} className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-md disabled:opacity-50">
              Rafraîchir
            </button>
          </div>
          {isLoadingQuizzes ? <p>Chargement des quiz...</p> : (
            <div className="overflow-y-auto max-h-[300px] pr-2">
              {quizzes.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {quizzes.map(quiz => (
                    <li key={quiz._id} className="py-3 flex justify-between items-center">
                      <span className="font-medium text-slate-800">{quiz.title}</span>
                      <Link to={`/quiz/${quiz._id}`} className="text-sm bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded-full hover:bg-indigo-200">
                        Ouvrir
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-500">Aucun quiz créé pour le moment.</p>}
            </div>
          )}
        </div>

      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tableau des Résultats</h2>
            <button onClick={fetchResults} disabled={isLoadingResults} className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-md disabled:opacity-50">
              Rafraîchir
            </button>
        </div>
        {isLoadingResults ? <p>Chargement des résultats...</p> : (
          <div className="overflow-x-auto max-h-[600px]">
            {results.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quiz</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {results.map(result => (
                  <tr key={result._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{result.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{result.quizTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{result.score} / {result.totalQuestions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(result.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : <p className="text-slate-500">Aucun résultat pour le moment.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;