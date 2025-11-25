import { Quiz, QuizResult, ApiQuizCreateResponse, ApiQuizUpdateResponse, ApiResultCreateResponse, ApiQuizGetResponse, ApiResultsGetAllResponse, ApiQuizzesGetAllResponse } from '../types';

// All requests go through Next.js API routes (token secured on server)
const API_PREFIX = '/api';

export const createQuiz = async (quiz: Omit<Quiz, '_id'>): Promise<ApiQuizCreateResponse> => {
  const response = await fetch(`${API_PREFIX}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quiz),
  });
  if (!response.ok) throw new Error('Failed to create quiz');
  return response.json();
};

export const updateQuiz = async (quizId: string, quiz: Omit<Quiz, '_id'>): Promise<ApiQuizUpdateResponse> => {
  const response = await fetch(`${API_PREFIX}/quiz/${quizId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quiz),
  });
  if (!response.ok) throw new Error('Failed to update quiz');
  return response.json();
};

export const getQuiz = async (quizId: string): Promise<ApiQuizGetResponse> => {
  const response = await fetch(`${API_PREFIX}/quiz/${quizId}`);
  if (!response.ok) throw new Error('Failed to fetch quiz');
  return response.json();
};

// Public API - Uses same secure backend, no token exposed to client
export const getPublicQuiz = async (quizId: string): Promise<ApiQuizGetResponse> => {
  return getQuiz(quizId);
};

export const getAllQuizzes = async (): Promise<ApiQuizzesGetAllResponse> => {
  const response = await fetch(`${API_PREFIX}/quizzes`);
  if (!response.ok) throw new Error('Failed to fetch quizzes');
  return response.json();
};

export const submitQuizResult = async (result: Omit<QuizResult, '_id'>): Promise<ApiResultCreateResponse> => {
  const response = await fetch(`${API_PREFIX}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!response.ok) throw new Error('Failed to submit quiz result');
  return response.json();
};

export const getAllResults = async (): Promise<ApiResultsGetAllResponse> => {
  const response = await fetch(`${API_PREFIX}/results`);
  if (!response.ok) throw new Error('Failed to fetch results');
  return response.json();
};