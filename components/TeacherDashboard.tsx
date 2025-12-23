
import React, { useState } from 'react';
import { User, Note, Quiz, QuizResult, UserRole } from '../types';
import { geminiService } from '../services/geminiService';

interface TeacherDashboardProps {
  user: User;
  notes: Note[];
  quizzes: Quiz[];
  results: QuizResult[];
  onAddQuiz: (quiz: Quiz) => void;
  onAddNote: (note: Note) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, notes, quizzes, results, onAddQuiz, onAddNote }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleGenerateAIQuiz = async () => {
    if (!topic) return alert("Please enter a topic");
    setIsGenerating(true);
    try {
      const generatedQuestions = await geminiService.generateQuiz(topic);
      if (generatedQuestions && generatedQuestions.length > 0) {
        const newQuiz: Quiz = {
          id: `q-${Date.now()}`,
          title: `AI Generated Quiz: ${topic}`,
          subject: 'General Science',
          timeLimit: 15,
          questions: generatedQuestions.map((q: any, i: number) => ({
            ...q,
            id: `qu-${i}-${Date.now()}`
          })),
          createdBy: user.name,
          createdAt: new Date().toISOString()
        };
        onAddQuiz(newQuiz);
        setTopic('');
        alert("Quiz generated successfully!");
      }
    } catch (err) {
      alert("Error generating quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNote = () => {
    if (!noteTitle || !noteContent) return;
    const newNote: Note = {
      id: `n-tch-${Date.now()}`,
      title: noteTitle,
      subject: 'Official Course Material',
      content: noteContent,
      uploadedBy: user.name, // Save the actual teacher name
      createdAt: new Date().toISOString()
    };
    onAddNote(newNote);
    setNoteTitle('');
    setNoteContent('');
    alert("Material shared with class!");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Quiz Generator */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">AI Quiz Generator</h3>
          </div>
          <p className="text-indigo-100 mb-6">Enter a topic and let Gemini create a comprehensive assessment for your students automatically.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. Photosynthesis, Machine Learning, World War II"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button 
              onClick={handleGenerateAIQuiz}
              disabled={isGenerating}
              className={`w-full py-3 bg-white text-indigo-600 font-bold rounded-xl transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 shadow-lg active:scale-[0.98]'}`}
            >
              {isGenerating ? 'Generating Quiz...' : 'Generate 5 Question Quiz'}
            </button>
          </div>
        </div>

        {/* Note Uploader */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Share Course Content</h3>
          <p className="text-slate-400 text-sm mb-6">Publish notes, reading materials, or assignment details to the knowledge base.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Title of notes"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            <textarea 
              placeholder="Paste content here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button 
              onClick={handleAddNote}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
            >
              Post to Knowledge Base
            </button>
          </div>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Student Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Student Name</th>
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Assessment</th>
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Score</th>
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">No student attempts recorded yet.</td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold text-slate-700">Alex Johnson</td>
                    <td className="py-4 text-slate-600">{quizzes.find(q => q.id === res.quizId)?.title || 'Deleted Quiz'}</td>
                    <td className="py-4">
                      <span className={`font-black text-lg ${res.score / res.totalQuestions > 0.5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {res.score}/{res.totalQuestions}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tighter">Completed</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
