import React, { useEffect, useRef, useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizPreviewProps {
  questions: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
  onClose: () => void;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ questions: initialQuestions, onSave, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions.map(q => ({ ...q })));
  const firstInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // focus first input when modal opens
    firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const updateQuestionText = (index: number, text: string) => {
    const copy = [...questions];
    copy[index].text = text;
    setQuestions(copy);
  };

  const addOption = (qIdx: number) => {
    const copy = [...questions];
    copy[qIdx].options.push('');
    setQuestions(copy);
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const copy = [...questions];
    if (copy[qIdx].options.length <= 2) return; // keep at least 2
    copy[qIdx].options.splice(optIdx, 1);
    if (copy[qIdx].correctAnswer >= copy[qIdx].options.length) copy[qIdx].correctAnswer = 0;
    setQuestions(copy);
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const copy = [...questions];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setQuestions(copy);
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const copy = [...questions];
    copy[qIdx].options[optIdx] = value;
    setQuestions(copy);
  };

  const setCorrect = (qIdx: number, optIdx: number) => {
    const copy = [...questions];
    copy[qIdx].correctAnswer = optIdx;
    setQuestions(copy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 dark:bg-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Preview Generated Quiz</h3>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 text-sm">Close</button>
            <button onClick={() => onSave(questions)} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Quiz</button>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {questions.map((q, qi) => (
            <div key={qi} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-700">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-xs font-semibold text-slate-500">Question {qi + 1}</label>
                <div className="flex gap-2">
                  <button aria-label="move up" onClick={() => moveQuestion(qi, qi-1)} className="px-2 py-1 text-sm">↑</button>
                  <button aria-label="move down" onClick={() => moveQuestion(qi, qi+1)} className="px-2 py-1 text-sm">↓</button>
                </div>
              </div>
              <input
                ref={qi === 0 ? firstInput : undefined}
                aria-label={`Question ${qi + 1} text`}
                value={q.text}
                onChange={(e) => updateQuestionText(qi, e.target.value)}
                className="w-full mt-2 p-2 rounded bg-white border"
              />

              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctAnswer === oi}
                      onChange={() => setCorrect(qi, oi)}
                      aria-label={`Mark option ${oi + 1} correct for question ${qi + 1}`}
                    />
                    <input
                      aria-label={`Question ${qi + 1} option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      className="flex-1 p-2 rounded bg-white border"
                    />
                    <button aria-label="remove option" onClick={() => removeOption(qi, oi)} className="px-2 py-1 text-sm">−</button>
                  </div>
                ))}
                <div>
                  <button aria-label="add option" onClick={() => addOption(qi)} className="text-sm text-indigo-600">+ Add option</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
