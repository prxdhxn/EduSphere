
import React, { useState } from 'react';
import { User, Note, Quiz, QuizResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDashboardProps {
  user: User;
  notes: Note[];
  quizzes: Quiz[];
  results: QuizResult[];
  onStartQuiz: (quiz: Quiz) => void;
  onAddNote: (note: Note) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, notes, quizzes, results, onStartQuiz, onAddNote }) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

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
    alert("Resource shared with the community!");
  };

  const chartData = results.map(r => ({
    name: new Date(r.date).toLocaleDateString(),
    score: (r.score / r.totalQuestions) * 100
  }));

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-sm font-medium">Pending Quizzes</p>
          <h3 className="text-3xl font-bold text-slate-800">{quizzes.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-sm font-medium">Shared Resources</p>
          <h3 className="text-3xl font-bold text-slate-800">{notes.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-sm font-medium">Average Score</p>
          <h3 className="text-3xl font-bold text-slate-800">
            {results.length > 0 
              ? `${Math.round(results.reduce((acc, curr) => acc + (curr.score/curr.totalQuestions)*100, 0) / results.length)}%` 
              : 'N/A'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis unit="%" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Share Resource Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Active Assessments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.length === 0 ? (
            <p className="text-slate-400">No active quizzes at the moment.</p>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all">
                <div>
                  <h4 className="font-bold text-slate-800">{quiz.title}</h4>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{quiz.subject} • {quiz.timeLimit} mins</p>
                </div>
                <button 
                  onClick={() => onStartQuiz(quiz)}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
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
