
import React, { useState, useEffect } from 'react';
import { getQuiz, submitQuizResult } from '../services/apiService';
import { Quiz, UserAnswer } from '../types';

interface QuizPageProps {
  quizId?: string;
}

const QuizPage: React.FC<QuizPageProps> = ({ quizId: propQuizId }) => {
  // Support both Next.js prop and React Router param (for backwards compatibility)
  const quizId = propQuizId;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userName, setUserName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) {
        setError("ID de quiz non trouvé.");
        setLoading(false);
        return;
      }
      try {
        const response = await getQuiz(quizId);
        if (response.success) {
          setQuiz({ ...response.result.json_data, _id: response.result._id });
        } else {
          throw new Error("Quiz non trouvé.");
        }
      } catch (err) {
        setError("Erreur lors du chargement du quiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [quizId]);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setHasStarted(true);
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswered || !quiz) return;

    setSelectedAnswerIndex(index);
    setIsAnswered(true);

    const question = quiz.questions[currentQuestionIndex];
    const selectedOption = question.answerOptions[index];
    const correctAnswerOption = question.answerOptions.find(opt => opt.isCorrect);
    
    const isCorrect = selectedOption.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    
    setUserAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      question: question.question,
      selectedAnswer: selectedOption.text,
      correctAnswer: correctAnswerOption ? correctAnswerOption.text : "N/A",
      isCorrect: isCorrect,
    }]);
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;
    setIsAnswered(false);
    setSelectedAnswerIndex(null);
    setAnswerStatus(null);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await submitQuizResult({
          quizId: quiz._id!,
          quizTitle: quiz.title,
          userName: userName,
          score: score,
          totalQuestions: quiz.questions.length,
          answers: userAnswers,
          submittedAt: new Date().toISOString(),
        });
        setQuizCompleted(true);
      } catch(err) {
        setError("Erreur lors de la soumission des résultats.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return 'bg-white hover:bg-slate-100 border-slate-300';
    }
    const option = quiz!.questions[currentQuestionIndex].answerOptions[index];
    if (option.isCorrect) {
      return 'bg-green-100 border-green-500 text-green-800 ring-2 ring-green-500';
    }
    if (index === selectedAnswerIndex) {
      return 'bg-red-100 border-red-500 text-red-800';
    }
    return 'bg-white border-slate-300 opacity-60';
  };

  if (loading) return <div className="text-center p-10">Chargement du quiz...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!quiz) return <div className="text-center p-10">Quiz non disponible.</div>;

  if (!hasStarted) {
    return (
      <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-slate-600 mb-6">Veuillez entrer votre nom pour commencer.</p>
        <form onSubmit={handleStartQuiz}>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Votre nom complet"
            className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Commencer le Quiz
          </button>
        </form>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / quiz.questions.length) * 100;
    const hasPassed = percentage >= 50;
    const incorrectAnswers = userAnswers.filter(answer => !answer.isCorrect);
    
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Quiz Terminé!</h1>
          <p className="text-slate-700 mb-6 text-lg">Merci, {userName}.</p>
          
          <div className={`p-6 rounded-lg mb-6 ${hasPassed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
            <p className="text-xl font-medium text-slate-600 mb-2">Votre score final</p>
            <p className={`text-6xl font-bold my-2 ${hasPassed ? 'text-green-600' : 'text-red-600'}`}>
              {score} <span className="text-3xl text-slate-500">/ {quiz.questions.length}</span>
            </p>
            <p className={`text-2xl font-bold mt-4 ${hasPassed ? 'text-green-700' : 'text-red-700'}`}>
              {hasPassed ? '✅ Réussi' : '❌ Échoué'}
            </p>
            <p className="text-lg text-slate-600 mt-2">{percentage.toFixed(1)}%</p>
          </div>

          {!hasPassed && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">Vous devez obtenir au moins 50% pour réussir. Veuillez recommencer le quiz.</p>
            </div>
          )}
        </div>

        {incorrectAnswers.length > 0 && (
          <div className="mt-8 text-left">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Questions incorrectes</h2>
            <div className="space-y-6">
              {incorrectAnswers.map((answer, idx) => {
                const question = quiz.questions[answer.questionIndex];
                const correctOption = question.answerOptions.find(opt => opt.isCorrect);
                return (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-slate-800 mb-2">
                        Question {answer.questionIndex + 1}
                      </h3>
                      <p className="text-slate-700 font-medium">{answer.question}</p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="bg-red-100 border border-red-300 rounded p-3">
                        <p className="text-xs font-semibold text-red-700 mb-1">Votre réponse (incorrecte) :</p>
                        <p className="text-red-800">{answer.selectedAnswer}</p>
                      </div>
                      
                      <div className="bg-green-100 border border-green-300 rounded p-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">Bonne réponse :</p>
                        <p className="text-green-800 font-semibold">{answer.correctAnswer}</p>
                      </div>
                    </div>

                    {correctOption && correctOption.rationale && (
                      <div className="bg-slate-100 border border-slate-300 rounded p-3">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Explication :</p>
                        <p className="text-slate-800">{correctOption.rationale}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-md font-semibold text-white ${
              hasPassed 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              hasPassed 
                ? 'focus:ring-green-500' 
                : 'focus:ring-red-500'
            }`}
          >
            {hasPassed ? 'Recommencer' : 'Réessayer'}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const correctOption = currentQuestion.answerOptions.find(o => o.isCorrect);
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-indigo-700">Question {currentQuestionIndex + 1} sur {quiz.questions.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
        <div className="space-y-3">
          {currentQuestion.answerOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={isAnswered}
              className={`w-full text-left p-4 border rounded-lg transition-all duration-200 flex items-start ${getButtonClass(index)}`}
            >
              <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
              <span>{option.text}</span>
            </button>
          ))}
        </div>

        {isAnswered && answerStatus && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              answerStatus === 'correct'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            } animate-fade-in`}
          >
            <p className="font-semibold text-lg">
              {answerStatus === 'correct' ? '✅ Bonne réponse !' : '❌ Mauvaise réponse.'}
            </p>
            {answerStatus === 'incorrect' && correctOption && (
              <p className="mt-2 text-sm text-slate-700">
                Bonne réponse attendue : <span className="font-semibold">{correctOption.text}</span>
              </p>
            )}
          </div>
        )}
        
        {isAnswered && (
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-fade-in">
            <h3 className="font-bold text-slate-800">Explication :</h3>
            <p className="text-slate-600 mt-2">{correctOption?.rationale || 'Aucune explication fournie pour cette question.'}</p>
          </div>
        )}

        {isAnswered && (
          <div className="mt-6 text-right">
            <button
              onClick={handleNextQuestion}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isSubmitting ? 'Soumission...' : (currentQuestionIndex < quiz.questions.length - 1 ? 'Suivante' : 'Terminer le Quiz')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;

