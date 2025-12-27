import React, { useEffect, useState } from 'react';
import { resultsService, quizService } from '../services/supabaseClient';
import { QuizResult, Quiz } from '../types';

interface ResultsViewProps {
  studentId: string;
  studentName: string;
}

const ResultsView: React.FC<ResultsViewProps> = ({ studentId, studentName }) => {
  const [results, setResults] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [studentResults, allQuizzes] = await Promise.all([
          resultsService.getStudentResults(studentId),
          quizService.getAllQuizzes(),
        ]);
        setResults(studentResults);
        const quizzesMap: Record<string, Quiz> = {};
        allQuizzes.forEach((q) => {
          quizzesMap[q.id] = q;
        });
        setQuizzes(quizzesMap);
      } catch (err) {
        console.error('Error loading results:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading results...</div>;
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <p className="text-slate-500">No quiz attempts yet. Start taking quizzes to see your results here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-3xl font-bold">Your Quiz Results</h2>
        <p className="text-indigo-100 mt-2">Review your performance and learn from your mistakes</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {results.map((result) => {
          const quiz = quizzes[result.quizId];
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
                  <p className="text-sm text-slate-500 mt-1">Completed on {new Date(result.completedAt).toLocaleDateString()}</p>
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
                <p className="text-sm text-slate-500 mt-1">{quizzes[selectedResult.quizId]?.title}</p>
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
                  const question = quizzes[selectedResult.quizId]?.questions?.[idx];
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
