import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz, QuizResult, Question } from '../types';
import { createQuiz, updateQuiz, getAllResults, getAllQuizzes } from '../services/apiService';

const AdminPage: React.FC = () => {
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

  // Édition de quiz
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editQuizTitle, setEditQuizTitle] = useState('');
  const [editQuizQuestions, setEditQuizQuestions] = useState<Question[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchResults();
    fetchQuizzes();
  }, []);
  
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
        const link = `/quiz/${quizId}`;
        const shareableLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${quizId}`;
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

  const handleStartEdit = (quiz: Quiz & { _id: string }) => {
    setEditingQuizId(quiz._id);
    setEditQuizTitle(quiz.title);
    setEditQuizQuestions(JSON.parse(JSON.stringify(quiz.questions))); // Deep copy
    setError('');
    setIsEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingQuizId(null);
    setEditQuizTitle('');
    setEditQuizQuestions([]);
    setError('');
  };

  const handleCopyQuizJson = (quiz: Quiz & { _id: string }) => {
    const quizJson = {
      quiz: quiz.questions
    };
    const jsonString = JSON.stringify(quizJson, null, 2);
    navigator.clipboard.writeText(jsonString);
    // Optionnel: afficher un message de confirmation
    setError('');
    // On pourrait ajouter un toast ici
  };

  const handleUpdateQuestion = (questionIndex: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...editQuizQuestions];
    if (field === 'question' || field === 'hint') {
      updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value };
    }
    setEditQuizQuestions(updatedQuestions);
  };

  const handleUpdateAnswerOption = (questionIndex: number, optionIndex: number, field: keyof Question['answerOptions'][0], value: any) => {
    const updatedQuestions = [...editQuizQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      answerOptions: updatedQuestions[questionIndex].answerOptions.map((opt, idx) =>
        idx === optionIndex ? { ...opt, [field]: value } : opt
      )
    };
    setEditQuizQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    setEditQuizQuestions([
      ...editQuizQuestions,
      {
        question: '',
        answerOptions: [
          { text: '', rationale: '', isCorrect: true },
          { text: '', rationale: '', isCorrect: false }
        ],
        hint: ''
      }
    ]);
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    setEditQuizQuestions(editQuizQuestions.filter((_, idx) => idx !== questionIndex));
  };

  const handleAddAnswerOption = (questionIndex: number) => {
    const updatedQuestions = [...editQuizQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      answerOptions: [
        ...updatedQuestions[questionIndex].answerOptions,
        { text: '', rationale: '', isCorrect: false }
      ]
    };
    setEditQuizQuestions(updatedQuestions);
  };

  const handleRemoveAnswerOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...editQuizQuestions];
    if (updatedQuestions[questionIndex].answerOptions.length > 1) {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answerOptions: updatedQuestions[questionIndex].answerOptions.filter((_, idx) => idx !== optionIndex)
      };
      setEditQuizQuestions(updatedQuestions);
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuizId || !editQuizTitle || editQuizQuestions.length === 0) {
      setError('Le titre et au moins une question sont requis.');
      return;
    }

    // Validation: au moins une réponse correcte par question
    for (const question of editQuizQuestions) {
      const hasCorrectAnswer = question.answerOptions.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        setError('Chaque question doit avoir au moins une réponse correcte.');
        return;
      }
      if (question.answerOptions.length < 2) {
        setError('Chaque question doit avoir au moins 2 options de réponse.');
        return;
      }
    }

    setIsUpdating(true);
    setError('');

    try {
      const response = await updateQuiz(editingQuizId, {
        title: editQuizTitle,
        questions: editQuizQuestions
      });
      
      if (response.success) {
        handleCancelEdit();
        fetchQuizzes();
        setError('');
      } else {
        throw new Error('La mise à jour du quiz a échoué.');
      }
    } catch (err: any) {
      setError(`Erreur lors de la mise à jour: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

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
                  {quizzes.map(quiz => {
                    const shareableLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${quiz._id}`;
                    return (
                      <li key={quiz._id} className="py-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-800">{quiz.title}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopyQuizJson(quiz)}
                              className="text-sm bg-purple-100 text-purple-700 font-semibold py-1 px-3 rounded-full hover:bg-purple-200"
                              title="Copier le JSON du quiz"
                            >
                              📄 Copier JSON
                            </button>
                            <button
                              onClick={() => handleStartEdit(quiz)}
                              className="text-sm bg-yellow-100 text-yellow-700 font-semibold py-1 px-3 rounded-full hover:bg-yellow-200"
                            >
                              ✏️ Modifier
                            </button>
                            <Link href={`/quiz/${quiz._id}`} className="text-sm bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded-full hover:bg-indigo-200">
                              Ouvrir
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-semibold">Lien partageable :</span>
                          <input 
                            type="text" 
                            readOnly 
                            value={shareableLink} 
                            className="flex-1 px-2 py-1 text-xs border border-slate-200 bg-slate-50 rounded text-slate-600 font-mono" 
                            onClick={(e) => (e.target as HTMLInputElement).select()} 
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(shareableLink);
                            }}
                            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1 px-3 rounded"
                            title="Copier le lien"
                          >
                            📋 Copier
                          </button>
                        </div>
                      </li>
                    );
                  })}
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

      {/* Dialog Modal pour l'édition */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCancelEdit}
          ></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-yellow-50">
                <h3 className="text-xl font-bold text-yellow-800">Modification du Quiz</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                  disabled={isUpdating}
                >
                  ×
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form id="edit-quiz-form" onSubmit={handleUpdateQuiz} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Titre du Quiz</label>
                    <input
                      type="text"
                      value={editQuizTitle}
                      onChange={(e) => setEditQuizTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {editQuizQuestions.map((question, qIdx) => (
                      <div key={qIdx} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-slate-700">Question {qIdx + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-xs bg-red-100 text-red-700 font-semibold py-1 px-2 rounded hover:bg-red-200"
                          >
                            Supprimer
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Question</label>
                          <textarea
                            value={question.question}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm bg-white"
                            rows={2}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Indice</label>
                          <input
                            type="text"
                            value={question.hint}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'hint', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm bg-white"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-slate-600">Options de réponse</label>
                            <button
                              type="button"
                              onClick={() => handleAddAnswerOption(qIdx)}
                              className="text-xs bg-green-100 text-green-700 font-semibold py-1 px-2 rounded hover:bg-green-200"
                            >
                              + Ajouter
                            </button>
                          </div>
                          {question.answerOptions.map((option, optIdx) => (
                            <div key={optIdx} className="mb-2 p-2 bg-white rounded border border-slate-200">
                              <div className="flex items-center gap-2 mb-1">
                                <input
                                  type="checkbox"
                                  checked={option.isCorrect}
                                  onChange={(e) => handleUpdateAnswerOption(qIdx, optIdx, 'isCorrect', e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-xs font-medium text-slate-600">Réponse correcte</span>
                                {question.answerOptions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAnswerOption(qIdx, optIdx)}
                                    className="ml-auto text-xs text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleUpdateAnswerOption(qIdx, optIdx, 'text', e.target.value)}
                                placeholder="Texte de la réponse"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm mb-1"
                                required
                              />
                              <textarea
                                value={option.rationale}
                                onChange={(e) => handleUpdateAnswerOption(qIdx, optIdx, 'rationale', e.target.value)}
                                placeholder="Rationalité (explication)"
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-sm bg-green-100 text-green-700 font-semibold py-2 px-4 rounded hover:bg-green-200"
                    >
                      + Ajouter une question
                    </button>
                  </div>
                  
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
              </div>
              
              {/* Footer */}
              <div className="flex gap-2 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  type="submit"
                  form="edit-quiz-form"
                  disabled={isUpdating}
                  className="flex-1 bg-yellow-600 text-white font-semibold py-2 px-4 rounded hover:bg-yellow-700 disabled:bg-yellow-300"
                >
                  {isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded hover:bg-slate-300 disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;