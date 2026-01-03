
import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { User, UserRole, Note, Quiz, QuizResult } from './types';
import { MOCK_USERS, INITIAL_NOTES, INITIAL_QUIZZES, PREDEFINED_TEACHERS } from './constants';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import QuizEngine from './components/QuizEngine';
import DiscussionForum from './components/DiscussionForum';
import NotesView from './components/NotesView';
import ResultsView from './components/ResultsView';
import { useToast } from './components/ToastProvider';
import TeacherRegisterModal from './components/TeacherRegisterModal';
import { quizService, resultsService, notesService } from './services/supabaseClient';

const App: React.FC = () => {
  React.useEffect(() => {
    console.log('App: mounted');
  }, []);

  console.log('App: render start');
  const toast = useToast();
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
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Persistence check on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('edustream_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // restore login draft (name/email/password/rememberMe)
    const draft = localStorage.getItem('edusphere_login');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setName(d.name || '');
        setEmail(d.email || '');
        setPassword(d.password || '');
        setRememberMe(!!d.rememberMe);
      } catch (e) {
        // ignore parse errors
      }
    }

    // Load data from backend API
    const loadBackendData = async () => {
      try {
        const [quizzesRes, resultsRes, notesRes] = await Promise.all([
          fetch('/api/get-quizzes'),
          fetch('/api/get-results'),
          fetch('/api/get-notes')
        ]);
        
        const [quizzesData, resultsData, notesData] = await Promise.all([
          quizzesRes.json(),
          resultsRes.json(),
          notesRes.json()
        ]);
        
        if (quizzesData.success && quizzesData.quizzes.length > 0) {
          setQuizzes(quizzesData.quizzes);
        }
        if (resultsData.success && resultsData.results.length > 0) {
          setResults(resultsData.results);
        }
        if (notesData.success && notesData.notes.length > 0) {
          setNotes(notesData.notes);
        }
      } catch (err) {
        console.error('Failed to load backend data:', err);
        // Fallback to initial data if backend fails
      }
    };
    loadBackendData();
  }, []);

  // persist login draft whenever form fields change
  useEffect(() => {
    const draft = { name, email, password, rememberMe };
    try {
      localStorage.setItem('edusphere_login', JSON.stringify(draft));
    } catch (e) {
      // ignore storage errors
    }
  }, [name, email, password, rememberMe]);

  // theme
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    const t = localStorage.getItem('edusphere_theme');
    return (t === 'dark' ? 'dark' : 'light');
  });
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('edustream_user');
    setUser(null);
  };
  
  const handleLogin = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    
    // Validate teacher credentials
    if (role === UserRole.TEACHER) {
      try {
        // First check predefined teachers
        const predefinedTeacher = PREDEFINED_TEACHERS.find(
          t => t.email === email && t.password === password
        );
        
        if (predefinedTeacher) {
          const loggedUser: User = {
            id: predefinedTeacher.id,
            name: predefinedTeacher.name,
            email: predefinedTeacher.email,
            role: role,
            avatar: predefinedTeacher.avatar
          };
          if (rememberMe) {
            localStorage.setItem('edustream_user', JSON.stringify(loggedUser));
          }
          setUser(loggedUser);
          setActiveTab('dashboard');
          return;
        }

        // Then check registered teachers in backend
        const response = await fetch('/api/verify-teacher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.show('Invalid teacher credentials.', 'error');
          return;
        }

        const loggedUser: User = {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          role: role,
          avatar: `https://picsum.photos/seed/${data.data.email}/200`
        };
        
        if (rememberMe) {
          localStorage.setItem('edustream_user', JSON.stringify(loggedUser));
        }
        setUser(loggedUser);
        setActiveTab('dashboard');
      } catch (err) {
        console.error('Login error:', err);
        toast.show('Login failed. Please try again.', 'error');
      }
      return;
    }
    
    // Student login (allow any credentials)
    const studentId = email ? `s-${btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}` : `s-${Date.now()}`;
    const loggedUser: User = {
      id: studentId,
      name: name.trim() || 'Student',
      email: email || 'student@edusphere.com',
      role: role,
      avatar: MOCK_USERS.student.avatar
    };
    
    if (rememberMe) {
      localStorage.setItem('edustream_user', JSON.stringify(loggedUser));
    }
    
    setUser(loggedUser);
    setActiveTab('dashboard');
  };

  // Function to refresh data from backend (silent)
  const refreshData = async () => {
    try {
      const [quizzesRes, resultsRes, notesRes] = await Promise.all([
        fetch('/api/get-quizzes'),
        fetch('/api/get-results'),
        fetch('/api/get-notes')
      ]);
      
      const [quizzesData, resultsData, notesData] = await Promise.all([
        quizzesRes.json(),
        resultsRes.json(),
        notesRes.json()
      ]);
      
      if (quizzesData.success) setQuizzes(quizzesData.quizzes);
      if (resultsData.success) setResults(resultsData.results);
      if (notesData.success) setNotes(notesData.notes);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // Function to manually refresh data with toast feedback
  const manualRefreshData = async () => {
    try {
      await refreshData();
      toast.show('Data refreshed successfully', 'success');
    } catch (err) {
      toast.show('Failed to refresh data', 'error');
    }
  };

  const addNote = (note: Note) => {
    setNotes(prev => [note, ...prev]);
    // Save through backend endpoint
    fetch('/api/save-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Backend save error:', data.error);
          toast.show('Note saved locally but failed to sync to server', 'warning');
        } else {
          console.log('Note saved to database via backend');
          refreshData();
        }
      })
      .catch(err => {
        console.error('Failed to save note:', err);
        toast.show('Note saved locally but failed to sync to server', 'warning');
      });
  };

  const addQuiz = (quiz: Quiz) => {
    setQuizzes(prev => [quiz, ...prev]);
    // Save through backend endpoint
    fetch('/api/save-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Backend save error:', data.error);
          toast.show('Quiz saved locally but failed to sync to server', 'warning');
        } else {
          console.log('Quiz saved to database via backend');
          // Refresh data to ensure all users see the new quiz
          refreshData();
        }
      })
      .catch(err => {
        console.error('Failed to save quiz:', err);
        toast.show('Quiz saved locally but failed to sync to server', 'warning');
      });
  };

  const addResult = (result: QuizResult) => {
    setResults(prev => [...prev, result]);
    // Save through backend endpoint
    fetch('/api/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Backend save error:', data.error);
          toast.show('Result saved locally but failed to sync to server', 'warning');
        } else {
          console.log('Result saved to database via backend');
          refreshData();
        }
      })
      .catch(err => {
        console.error('Failed to save result:', err);
        toast.show('Result saved locally but failed to sync to server', 'warning');
      });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-indigo-950 px-4">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.55) contrast(1.0)', opacity: 0.75 }}
        >
          <source src="/login-bg.mp4" type="video/mp4" />
        </video>

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-violet-900/50 to-indigo-950/65"></div>

        {/* Dynamic Animated Blobs (refined) */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-10 right-10 w-48 h-48 bg-sky-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

        {/* Animated Light Rays Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-1 h-96 bg-gradient-to-b from-white via-transparent to-transparent blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-1 h-96 bg-gradient-to-b from-violet-400 via-transparent to-transparent blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Premium Glass Card */}
        <div className="p-10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] max-w-md w-full relative z-10 border border-white/40 backdrop-blur-2xl" style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}>
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full"></div>

          <div className="text-center mb-8">
            {/* Logo */}
            <img src="/logo.svg" alt="EduSphere" className="w-20 h-20 mx-auto mb-6 drop-shadow-lg" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent tracking-tight drop-shadow-lg">EduSphere</h1>
            <p className="text-slate-300 mt-2 font-semibold text-sm">Your Personal Digital Learning Lab</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[11px] font-bold text-indigo-900/40 mb-1.5 ml-1 uppercase tracking-widest">Full Name</label>
                <label className="block text-[11px] font-bold text-indigo-200/60 mb-1.5 ml-1 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                  className="w-full px-5 py-3.5 bg-white/15 border border-white/25 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/25 transition-all text-white font-medium placeholder-white/50 shadow-lg backdrop-blur-sm"
              />
            </div>
            <div>
                <label className="block text-[11px] font-bold text-indigo-200/60 mb-1.5 ml-1 uppercase tracking-widest">Institutional Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@edu.com"
                  className="w-full px-5 py-3.5 bg-white/15 border border-white/25 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/25 transition-all text-white font-medium placeholder-white/50 shadow-lg backdrop-blur-sm"
              />
            </div>
            <div>
                <label className="block text-[11px] font-bold text-indigo-200/60 mb-1.5 ml-1 uppercase tracking-widest">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-white/15 border border-white/25 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/25 transition-all text-white font-medium placeholder-white/50 shadow-lg backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-400 border-white/30 rounded-lg focus:ring-indigo-400 bg-white/20" 
                />
                  <span className="text-xs text-white/80 font-bold group-hover:text-indigo-200 transition-colors uppercase tracking-tight">Remember login</span>
              </label>
              <div className="flex gap-2">
                <a href="#" className="text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors underline decoration-indigo-400 underline-offset-4">Reset Access</a>
                <span className="text-xs text-white/40">•</span>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="text-xs font-bold text-violet-300 hover:text-violet-200 transition-colors underline decoration-violet-400 underline-offset-4"
                >
                  Register
                </button>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-white/60 font-bold tracking-tighter">Identity Confirmation</span></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="submit"
                  onClick={(e) => handleLogin(e, UserRole.STUDENT)}
                  className="py-4 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black transition-all shadow-2xl shadow-indigo-500/50 flex items-center justify-center gap-2 active:scale-[0.98] transform hover:-translate-y-1 backdrop-blur-sm border border-indigo-400/50"
                >
                  Student
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleLogin(e, UserRole.TEACHER)}
                  className="py-4 px-4 bg-white/15 border-2 border-white/40 text-white hover:bg-white/25 hover:border-white/60 rounded-2xl font-black transition-all active:scale-[0.98] transform hover:-translate-y-1 shadow-lg backdrop-blur-sm"
                >
                  Teacher
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-10 flex items-center justify-center gap-4 opacity-60">
            <div className="h-px w-8 bg-white/30"></div>
            <p className="text-[9px] text-center text-white/50 font-black uppercase tracking-[0.2em]">
              Powering Modern Minds
            </p>
            <div className="h-px w-8 bg-slate-300"></div>
          </div>
        </div>

        {/* Registration Modal */}
        <TeacherRegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegisterSuccess={() => {
            // After successful registration, show a message and allow login
            // User can now login with their registered credentials
          }}
          onShowError={(message) => toast.show(message, 'error')}
          onShowSuccess={(message) => toast.show(message, 'success')}
        />
      </div>
    );
  }

  // If in a quiz, hide sidebar and show quiz engine
  if (activeQuiz) {
    return (
      <QuizEngine 
        quiz={activeQuiz}
        user={user}
        onComplete={(result) => {
          addResult(result);
          setActiveQuiz(null);
        }}
        onCancel={() => setActiveQuiz(null)}
      />
    );
  }

  return (
    <>
      <div className="bg-slate-900 text-white py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          <div className="font-semibold">EduSphere Digital Classroom</div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle theme"
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                setTheme(next);
                if (next === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
                localStorage.setItem('edusphere_theme', next);
              }}
              className="p-2 bg-slate-800/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 dark:bg-slate-900">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {user.role} Dashboard
            </h2>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={manualRefreshData}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Refresh data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
            </div>
            <img 
              src={user.avatar} 
              alt="avatar" 
              className="w-12 h-12 rounded-full border-2 border-indigo-100 shadow-sm object-cover bg-slate-200"
            />
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-sm font-medium"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
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
              setActiveTab={setActiveTab}
            />
          ) : (
            <StudentDashboard 
              user={user}
              notes={notes} 
              quizzes={quizzes} 
              results={results}
              onStartQuiz={setActiveQuiz}
              onAddNote={addNote}
              setActiveTab={setActiveTab}
            />
          )
        )}

        {activeTab === 'notes' && (
          <NotesView 
            notes={notes} 
            onRefresh={manualRefreshData}
          />
        )}
        {activeTab === 'results' && user.role === UserRole.STUDENT && (
          <ResultsView 
            studentId={user.id} 
            studentName={user.name} 
            results={results} 
            quizzes={quizzes}
            onRefresh={manualRefreshData}
          />
        )}
        {activeTab === 'forum' && <DiscussionForum user={user} />}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto text-center border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="mb-4">
              <img src={user.avatar} className="w-32 h-32 rounded-full mx-auto mb-2 border-4 border-indigo-50 object-cover bg-slate-200" />
              <label className="block text-sm text-slate-500 dark:text-slate-400">Change avatar</label>
              <input
                aria-label="Upload avatar"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const data = reader.result as string;
                    const updated = { ...user, avatar: data };
                    setUser(updated);
                    localStorage.setItem('edustream_user', JSON.stringify(updated));
                  };
                  reader.readAsDataURL(file);
                }}
                className="mt-2"
              />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h3>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-6">{user.role}</p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 transition-colors">
                <p className="text-xs text-slate-400 dark:text-slate-300 uppercase font-bold mb-1">Email Address</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 transition-colors">
                <p className="text-xs text-slate-400 dark:text-slate-300 uppercase font-bold mb-1">Status</p>
                <p className="font-semibold text-green-600 dark:text-green-400">Active Account</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </>
  );
};

export default App;
