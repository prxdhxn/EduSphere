
import React, { useState, useEffect } from 'react';
import { Quiz, QuizResult } from '../types';

interface QuizEngineProps {
  quiz: Quiz;
  user?: { id: string; name: string };
  onComplete: (result: QuizResult) => void;
  onCancel: () => void;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ quiz, user, onComplete, onCancel }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
  };

  const handleSubmit = () => {
    let score = 0;
    const answerDetails: any[] = [];
    quiz.questions.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.correctAnswer;
      if (isCorrect) {
        score++;
      }
      answerDetails.push({
        questionIndex: idx,
        selectedAnswer: answers[idx] ?? -1,
        correct: isCorrect
      });
    });

    onComplete({
      id: `res-${Date.now()}`,
      quizId: quiz.id,
      studentId: user?.id || 's1',
      studentName: user?.name || 'Anonymous',
      score,
      totalQuestions: quiz.questions.length,
      completedAt: new Date().toISOString(),
      answers: answerDetails,
      date: new Date().toISOString()
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const question = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{quiz.title}</h2>
          <p className="text-sm text-slate-400">{quiz.subject}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-bold">Time Remaining</p>
            <p className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-indigo-600'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-2 bg-slate-100 w-full">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="p-12">
            <p className="text-indigo-600 font-bold mb-4">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
            <h3 className="text-2xl font-bold text-slate-800 mb-8">{question.text}</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    answers[currentQuestionIndex] === idx 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-100 hover:border-indigo-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-lg font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-6 flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold disabled:opacity-30"
            >
              Previous
            </button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEngine;
