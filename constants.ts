
import { UserRole, Note, Quiz } from './types';

export const MOCK_USERS = {
  teacher: {
    id: 't1',
    name: 'Prof. Sarah Miller',
    email: 'sarah.miller@edu.com',
    role: UserRole.TEACHER,
    avatar: 'https://picsum.photos/seed/sarah/200'
  },
  student: {
    id: 's1',
    name: 'Alex Johnson',
    email: 'alex.j@student.com',
    role: UserRole.STUDENT,
    avatar: 'https://picsum.photos/seed/alex/200'
  }
};

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Introduction to Algorithms',
    subject: 'Computer Science',
    content: 'An algorithm is a finite sequence of rigorous instructions, typically used to solve a class of specific problems or to perform a computation.',
    uploadedBy: 't1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Quantum Physics Basics',
    subject: 'Physics',
    content: 'Quantum physics is the study of matter and energy at the most fundamental level. It aims to uncover the properties and behaviors of the very building blocks of nature.',
    uploadedBy: 't1',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    title: 'Sorting Algorithms Quiz',
    subject: 'Data Structures',
    timeLimit: 10,
    questions: [
      {
        id: 'qu1',
        text: 'Which sorting algorithm has a worst-case time complexity of O(n^2)?',
        options: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Heap Sort'],
        correctAnswer: 2
      },
      {
        id: 'qu2',
        text: 'What is the space complexity of in-place Quick Sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1
      }
    ],
    createdBy: 't1',
    createdAt: new Date().toISOString()
  }
];
