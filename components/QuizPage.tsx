
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getQuiz, submitQuizResult } from '../services/apiService';
import { Quiz, UserAnswer } from '../types';

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
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
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
        <h1 className="text-3xl font-bold mb-4">Quiz Terminé!</h1>
        <p className="text-slate-700 mb-6 text-lg">Merci, {userName}.</p>
        <div className="bg-indigo-50 p-6 rounded-lg mb-6">
            <p className="text-xl font-medium text-slate-600">Votre score final</p>
            <p className="text-6xl font-bold text-indigo-600 my-2">{score} <span className="text-3xl text-slate-500">/ {quiz.questions.length}</span></p>
        </div>
        <a href="#" onClick={() => window.location.reload()} className="text-indigo-600 hover:underline">
          Recommencer
        </a>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
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
        
        {isAnswered && (
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-fade-in">
            <h3 className="font-bold text-slate-800">Explication :</h3>
            <p className="text-slate-600 mt-2">{currentQuestion.answerOptions.find(o => o.isCorrect)?.rationale}</p>
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

