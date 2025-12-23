
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  fileUrl?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  timeLimit: number; // in minutes
  questions: Question[];
  createdBy: string;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface DiscussionPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
