
import React, { useState } from 'react';
import { FiBook, FiPlay } from 'react-icons/fi';
import { useToast } from './ToastProvider';
import { User, Note, Quiz, QuizResult } from '../types';
import ProgressChart from './ProgressChart';

interface StudentDashboardProps {
  user: User;
  notes: Note[];
  quizzes: Quiz[];
  results: QuizResult[];
  onStartQuiz: (quiz: Quiz) => void;
  onAddNote: (note: Note) => void;
  setActiveTab?: (tab: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, notes, quizzes, results, onStartQuiz, onAddNote, setActiveTab }) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const toast = useToast();
  const handleAddNote = () => {
    if (!noteTitle || !noteContent) return;
    const newNote: Note = {
      id: `n-std-${Date.now()}`,
      title: noteTitle,
      subject: 'Community Study Guide',
      content: noteContent,
      uploadedBy: user.name, // Save the actual user name
      createdAt: new Date().toISOString()
    };
    onAddNote(newNote);
    setNoteTitle('');
    setNoteContent('');
    toast.show('Resource shared with the community!', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3 flex justify-end">
          <button
            onClick={() => setActiveTab && setActiveTab('notes')}
            className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            View Library
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <p className="text-slate-400 dark:text-slate-400 text-sm font-medium">Pending Quizzes</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{quizzes.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <p className="text-slate-400 dark:text-slate-400 text-sm font-medium">Shared Resources</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{notes.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <p className="text-slate-400 dark:text-slate-400 text-sm font-medium">Average Score</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {results.length > 0 
              ? `${Math.round(results.reduce((acc, curr) => acc + (curr.score/curr.totalQuestions)*100, 0) / results.length)}%` 
              : 'N/A'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2">
          <ProgressChart results={results} height={320} />
        </div>

        {/* Share Resource Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <FiBook className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Share Study Guide</h3>
          </div>
          <p className="text-emerald-50 text-sm mb-6 opacity-90">Help your classmates by sharing your notes or helpful resources.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Guide Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <textarea 
              placeholder="Paste summary or findings..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-100 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
            />
            <button 
              onClick={handleAddNote}
              className="w-full py-2.5 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg active:scale-95 text-sm"
            >
              Post to Library
            </button>
          </div>
        </div>
      </div>

      {/* Quizzes to take */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Active Assessments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-400">No active quizzes at the moment.</p>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl group hover:border-indigo-200 dark:hover:border-indigo-500 transition-all">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{quiz.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">{quiz.subject} • {quiz.timeLimit} mins</p>
                </div>
                <button 
                  onClick={() => onStartQuiz(quiz)}
                  className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-700 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <FiPlay size={16} />
                  Start Quiz
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
