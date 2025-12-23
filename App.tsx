
import React, { useState, useEffect } from 'react';
import { User, UserRole, Note, Quiz, QuizResult } from './types';
import { MOCK_USERS, INITIAL_NOTES, INITIAL_QUIZZES } from './constants';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import QuizEngine from './components/QuizEngine';
import DiscussionForum from './components/DiscussionForum';
import NotesView from './components/NotesView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Persistence check on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('edustream_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('edustream_user');
    setUser(null);
  };
  
  const handleLogin = (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    
    // Create a user object based on inputs, using mock avatars for visuals
    const loggedUser: User = {
      id: `${role === UserRole.TEACHER ? 't' : 's'}-${Date.now()}`,
      name: name.trim() || (role === UserRole.TEACHER ? 'Professor' : 'Student'),
      email: email || 'user@edusphere.com',
      role: role,
      avatar: role === UserRole.TEACHER ? MOCK_USERS.teacher.avatar : MOCK_USERS.student.avatar
    };
    
    if (rememberMe) {
      localStorage.setItem('edustream_user', JSON.stringify(loggedUser));
    }
    
    setUser(loggedUser);
    setActiveTab('dashboard');
  };

  const addNote = (note: Note) => setNotes(prev => [note, ...prev]);
  const addQuiz = (quiz: Quiz) => setQuizzes(prev => [quiz, ...prev]);
  const addResult = (result: QuizResult) => setResults(prev => [...prev, result]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-indigo-950 px-4">
        {/* Deep Gradient Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-violet-900 to-indigo-950 opacity-100"></div>

        {/* Dynamic Animated Blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-10 right-10 w-48 h-48 bg-sky-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        <div className="glass-card p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-md w-full relative z-10 border border-white/40">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl mb-6 text-white transform hover:rotate-6 transition-transform cursor-default">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">EduSphere</h1>
            <p className="text-slate-500 mt-2 font-semibold text-sm">Your Personal Digital Learning Lab</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[11px] font-bold text-indigo-900/40 mb-1.5 ml-1 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-5 py-3.5 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium placeholder-slate-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-indigo-900/40 mb-1.5 ml-1 uppercase tracking-widest">Institutional Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@edu.com"
                className="w-full px-5 py-3.5 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium placeholder-slate-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-indigo-900/40 mb-1.5 ml-1 uppercase tracking-widest">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium placeholder-slate-300 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded-lg focus:ring-indigo-500" 
                />
                <span className="text-xs text-slate-600 font-bold group-hover:text-indigo-600 transition-colors uppercase tracking-tight">Remember login</span>
              </label>
              <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-indigo-200 underline-offset-4">Reset Access</a>
            </div>

            <div className="pt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-slate-400 font-bold tracking-tighter">Identity Confirmation</span></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="submit"
                  onClick={(e) => handleLogin(e, UserRole.STUDENT)}
                  className="py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.98] transform hover:-translate-y-1"
                >
                  Student
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleLogin(e, UserRole.TEACHER)}
                  className="py-4 px-4 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black transition-all active:scale-[0.98] transform hover:-translate-y-1 shadow-sm"
                >
                  Teacher
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-10 flex items-center justify-center gap-4 opacity-50">
            <div className="h-px w-8 bg-slate-300"></div>
            <p className="text-[9px] text-center text-slate-500 font-black uppercase tracking-[0.2em]">
              Powering Modern Minds
            </p>
            <div className="h-px w-8 bg-slate-300"></div>
          </div>
        </div>
      </div>
    );
  }

  // If in a quiz, hide sidebar and show quiz engine
  if (activeQuiz) {
    return (
      <QuizEngine 
        quiz={activeQuiz} 
        onComplete={(result) => {
          addResult(result);
          setActiveQuiz(null);
        }}
        onCancel={() => setActiveQuiz(null)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-sm font-medium text-indigo-600 uppercase tracking-widest">
              {user.role} Dashboard
            </h2>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <img 
              src={user.avatar} 
              alt="avatar" 
              className="w-12 h-12 rounded-full border-2 border-indigo-100 shadow-sm object-cover bg-slate-200"
            />
          </div>
        </header>

        {activeTab === 'dashboard' && (
          user.role === UserRole.TEACHER ? (
            <TeacherDashboard 
              user={user}
              notes={notes} 
              quizzes={quizzes} 
              onAddQuiz={addQuiz} 
              onAddNote={addNote}
              results={results}
            />
          ) : (
            <StudentDashboard 
              user={user}
              notes={notes} 
              quizzes={quizzes} 
              results={results}
              onStartQuiz={setActiveQuiz}
              onAddNote={addNote}
            />
          )
        )}

        {activeTab === 'notes' && <NotesView notes={notes} />}
        {activeTab === 'forum' && <DiscussionForum user={user} />}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto text-center border border-slate-100">
            <img src={user.avatar} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-indigo-50 object-cover bg-slate-200" />
            <h3 className="text-2xl font-bold text-slate-800">{user.name}</h3>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-6">{user.role}</p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Email Address</p>
                <p className="font-semibold text-slate-700">{user.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                <p className="font-semibold text-green-600">Active Account</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
