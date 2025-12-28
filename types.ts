
export enum QuizMode {
  QUESTION_RESPONSE = 'Question & Response',
  SHORT_CONVERSATION = 'Short Conversation'
}

export interface DialoguePart {
  text: string;
  speaker: number; // 0 for Speaker A, 1 for Speaker B, 2 for Narrator/Question
}

export interface Question {
  id: number;
  audioText: string; // Fallback or single text
  dialogueParts?: DialoguePart[]; // For multi-speaker support
  questionText?: string; 
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizState {
  currentStep: 'MENU' | 'QUIZ' | 'RESULT';
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: { [key: number]: string };
}
