import React, { useState } from 'react';
import { QuizResult, Quiz } from '../types';

interface ResultsViewProps {
  studentId: string;
  studentName: string;
  results: QuizResult[];
  quizzes: Quiz[];
  onRefresh?: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ studentId, studentName, results, quizzes, onRefresh }) => {
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);

  // Filter results for this student and create quizzes map
  const studentResults = results
    .filter(r => showAllResults || r.studentId === studentId)
    .sort((a, b) => new Date(b.completedAt || b.date).getTime() - new Date(a.completedAt || a.date).getTime());
  
  const quizzesMap: Record<string, Quiz> = {};
  quizzes.forEach((q) => {
    quizzesMap[q.id] = q;
  });

  // Debug info
  console.log('ResultsView Debug:', {
    currentStudentId: studentId,
    totalResults: results.length,
    studentResults: studentResults.length,
    allResultsStudentIds: results.map(r => r.studentId),
    showAllResults
  });

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  if (studentResults.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Quiz Results Yet</h3>
        <p className="text-slate-500 mb-4">Start taking quizzes to see your results here!</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
          >
            🔄 Check for New Results
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl shadow-xl text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Your Quiz Results</h2>
            <p className="text-indigo-100 mt-2">
              Review your performance and learn from your mistakes
              {studentResults.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                  {studentResults.length} Result{studentResults.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllResults(!showAllResults)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                showAllResults 
                  ? 'bg-white/30 text-white' 
                  : 'bg-white/10 text-indigo-100 hover:bg-white/20'
              }`}
              title={showAllResults ? 'Show only your results' : 'Show all results'}
            >
              {showAllResults ? 'Your Results' : 'All Results'}
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                title="Refresh results"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {studentResults.map((result) => {
          const quiz = quizzesMap[result.quizId];
          const percentage = Math.round((result.score / result.totalQuestions) * 100);
          return (
            <div
              key={result.id}
              onClick={() => setSelectedResult(result)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800">{quiz?.title || 'Unknown Quiz'}</h3>
                  <div className="text-sm text-slate-500 mt-1">
                    <span>Completed on {new Date(result.completedAt).toLocaleDateString()}</span>
                    {showAllResults && result.studentName && (
                      <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                        by {result.studentName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${getScoreColor(result.score, result.totalQuestions)}`}>
                    {result.score}/{result.totalQuestions}
                  </div>
                  <div className="text-xs text-slate-500 font-bold">{percentage}%</div>
                </div>
              </div>

              {percentage >= 80 && (
                <div className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-tight inline-block">
                  ✓ Excellent
                </div>
              )}
              {percentage >= 60 && percentage < 80 && (
                <div className="mt-3 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-tight inline-block">
                  ◐ Good
                </div>
              )}
              {percentage < 60 && (
                <div className="mt-3 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-tight inline-block">
                  ✗ Review
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 dark:bg-slate-800 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Result Details</h3>
                <p className="text-sm text-slate-500 mt-1">{quizzesMap[selectedResult.quizId]?.title}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {selectedResult.answers && selectedResult.answers.length > 0 ? (
                selectedResult.answers.map((answer: any, idx: number) => {
                  const question = quizzesMap[selectedResult.quizId]?.questions?.[idx];
                  const isCorrect = answer.selectedAnswer === question?.correctAnswer;
                  return (
                    <div key={idx} className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                      <p className="font-bold text-slate-800 mb-2">{question?.text}</p>
                      <div className="space-y-2">
                        {question?.options?.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded text-sm ${
                              optIdx === question.correctAnswer
                                ? 'bg-emerald-200 text-emerald-900 font-bold'
                                : optIdx === answer.selectedAnswer && !isCorrect
                                ? 'bg-rose-200 text-rose-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {optIdx === question.correctAnswer && <span className="mr-2">✓</span>}
                            {optIdx === answer.selectedAnswer && !isCorrect && <span className="mr-2">✗</span>}
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500">No answer details available.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedResult(null)}
              className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
