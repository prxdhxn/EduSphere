import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface TeacherRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: () => void;
  onShowError: (message: string) => void;
  onShowSuccess: (message: string) => void;
}

const TeacherRegisterModal: React.FC<TeacherRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onShowError,
  onShowSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      onShowError('Please enter your email');
      return;
    }

    if (!password || password.length < 6) {
      onShowError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      onShowError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `t-${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onShowError(data.error || 'Registration failed');
        return;
      }

      onShowSuccess('Teacher registered successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        onClose();
        onRegisterSuccess();
      }, 1500);
    } catch (err) {
      onShowError('Failed to register. Please try again.');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative max-w-md w-full">
        <div
          className="p-8 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative border border-white/40 backdrop-blur-2xl"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
        >
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent rounded-full"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black bg-gradient-to-r from-violet-200 to-indigo-200 bg-clip-text text-transparent mb-2">
              Register as Teacher
            </h2>
            <p className="text-slate-300 text-sm">Create your account to start teaching</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-indigo-200/60 mb-1.5 ml-1 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. John Smith"
                className="w-full px-4 py-3 bg-white/15 border border-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white/25 transition-all text-white font-medium placeholder-white/50 shadow-lg backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-indigo-200/60 mb-1.5 ml-1 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@institution.edu"
                className="w-full px-4 py-3 bg-white/15 border border-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white/25 transition-all text-white font-medium placeholder-white/50 shadow-lg backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-indigo-200/60 mb-1.5 ml-1 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/15 border border-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white/25 transition-all text-white font-medium placeholder-white/50 shadow-lg backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-indigo-200/60 mb-1.5 ml-1 uppercase tracking-widest">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/15 border border-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white/25 transition-all text-white font-medium placeholder-white/50 shadow-lg backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-black transition-all shadow-lg shadow-violet-500/50 active:scale-[0.98] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-violet-400/50"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-white/10 border border-white/25 text-white rounded-xl font-black transition-all hover:bg-white/20 hover:border-white/40 active:scale-[0.98] disabled:opacity-50 backdrop-blur-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-white/50 mt-6 font-medium">
            Already have an account? Log in using the Teacher button below.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegisterModal;
