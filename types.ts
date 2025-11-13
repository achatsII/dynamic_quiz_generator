
export interface AnswerOption {
  text: string;
  rationale: string;
  isCorrect: boolean;
}

export interface Question {
  question: string;
  answerOptions: AnswerOption[];
  hint: string;
}

export interface Quiz {
  _id?: string;
  title: string;
  questions: Question[];
}

export interface UserAnswer {
  questionIndex: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  _id?: string;
  quizId: string;
  quizTitle: string;
  userName: string;
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  submittedAt: string;
}

// API Response Types
export interface ApiQuizCreateResponse {
  success: boolean;
  results: {
    inserted_id: string;
  }[];
}

export interface ApiResultCreateResponse {
  success: boolean;
  results: {
    inserted_id: string;
  }[];
}

export interface ApiQuizGetResponse {
    success: boolean;
    result: {
        _id: string;
        json_data: Quiz;
    };
}

export interface ApiQuizzesGetAllResponse {
  success: boolean;
  results: {
    _id: string;
    json_data: Quiz;
  }[];
}

export interface ApiResultsGetAllResponse {
  success: boolean;
  results: {
    _id: string;
    json_data: QuizResult;
  }[];
}