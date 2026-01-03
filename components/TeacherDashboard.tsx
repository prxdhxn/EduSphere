
import React, { useState } from 'react';
import { FiPlus, FiZap } from 'react-icons/fi';
import { useToast } from './ToastProvider';
import { User, Note, Quiz, QuizResult, UserRole } from '../types';
// Use server proxy for Gemini to avoid exposing API keys

import QuizPreview from './QuizPreview';

interface TeacherDashboardProps {
  user: User;
  notes: Note[];
  quizzes: Quiz[];
  results: QuizResult[];
  onAddQuiz: (quiz: Quiz) => void;
  onAddNote: (note: Note) => void;
  setActiveTab?: (tab: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, notes, quizzes, results, onAddQuiz, onAddNote }) => {
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const handleGenerateAIQuiz = async () => {
    if (!topic) return toast.show('Please enter a topic', 'error');
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count: 5 })
      });
      if (!resp.ok) throw new Error('Server error while generating quiz');
      const body = await resp.json();
      const generatedQuestions = body.questions || [];
      if (generatedQuestions && generatedQuestions.length > 0) {
        // open preview modal so teacher can edit before saving
        setPreviewQuestions(generatedQuestions.map((q: any) => ({
          text: q.text || '',
          options: q.options || [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
        })));
        setPreviewOpen(true);
      } else {
        toast.show('No questions returned from AI', 'error');
      }
    } catch (err) {
      toast.show('Error generating quiz. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFromPreview = (questions: any[]) => {
    const newQuiz: Quiz = {
      id: `q-${Date.now()}`,
      title: `AI Generated Quiz: ${topic}`,
      subject: 'General Science',
      timeLimit: 15,
      questions: questions.map((q, i) => ({
        id: `qu-${i}-${Date.now()}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      })),
      createdBy: user.name,
      createdAt: new Date().toISOString()
    };
    onAddQuiz(newQuiz);
    setPreviewOpen(false);
    setTopic('');
    toast.show('Quiz generated and saved.', 'success');
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setUploadedFileUrl(data.fileUrl);
        const fileInfo = `\n\n[📎 Attached File: ${data.originalName} (${(data.size / 1024 / 1024).toFixed(2)} MB)]`;
        setNoteContent(prev => prev + fileInfo);
        toast.show(`File "${data.originalName}" uploaded successfully`, 'success');
        return data.fileUrl;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
      toast.show('Failed to upload file', 'error');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    // Immediately upload the file
    await handleFileUpload(file);
  };

  const handleAddNote = async () => {
    if (!noteTitle || (!noteContent && !uploadedFileUrl)) {
      toast.show('Please provide a title and either content or upload a file', 'error');
      return;
    }
    
    const newNote: Note = {
      id: `n-tch-${Date.now()}`,
      title: noteTitle,
      subject: 'Official Course Material',
      content: noteContent || 'See attached file for content.',
      uploadedBy: user.name,
      createdAt: new Date().toISOString(),
      fileUrl: uploadedFileUrl || undefined
    };
    onAddNote(newNote);
    setNoteTitle('');
    setNoteContent('');
    setUploadedFile(null);
    setUploadedFileUrl(null);
    toast.show('Material shared with class!', 'success');
  };

  // Computed value for button state
  const canPost = noteTitle && (noteContent.trim() || uploadedFileUrl);

  return (
    <div className="space-y-8">
      {previewOpen && (
        <QuizPreview
          questions={previewQuestions}
          onClose={() => setPreviewOpen(false)}
          onSave={handleSaveFromPreview}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="col-span-full flex justify-end">
          {/** quick link to course content on the left nav */}
          <button
            onClick={() => setActiveTab && setActiveTab('notes')}
            className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            View Course Content
          </button>
        </div>
        {/* AI Quiz Generator */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <FiZap className="w-6 h-6" />
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
              className={`w-full py-3 bg-white text-indigo-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 shadow-lg active:scale-[0.98]'}`}
            >
              {isGenerating ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"></circle><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path></svg> Generating...</>
              ) : (
                <><FiZap size={18} /> Generate 5 Question Quiz</>
              )}
            </button>
          </div>
        </div>

        {/* Note Uploader */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <FiPlus className="text-indigo-600 dark:text-indigo-400" size={24} /> Share Course Content
          </h3>
          <p className="text-slate-400 dark:text-slate-400 text-sm mb-6">Publish notes, reading materials, or assignment details to the knowledge base.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Title of notes"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-colors"
            />
            <textarea 
              placeholder="Paste content here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
            />
            
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                }}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              
              {!uploadedFile && !isUploading && (
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium">Click to upload PDF, DOC, or TXT files</span>
                  <span className="text-xs text-slate-400">Max file size: 10MB</span>
                </label>
              )}
              
              {isUploading && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-indigo-600">Uploading file...</span>
                </div>
              )}
              
              {uploadedFile && !isUploading && uploadedFileUrl && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">File uploaded successfully!</span>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    📎 {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={uploadedFileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Preview File
                    </a>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadedFileUrl(null);
                        // Remove file info from content
                        setNoteContent(prev => prev.replace(/\n\n\[📎 Attached File:.*?\]/g, ''));
                      }}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Remove File
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleAddNote}
              disabled={!canPost}
              className="w-full py-3 bg-indigo-600 dark:bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus size={18} /> Post to Knowledge Base
            </button>
          </div>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Recent Student Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-600 text-slate-400 dark:text-slate-400 text-sm">
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Student Name</th>
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Assessment</th>
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Score</th>
                <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-400 italic">No student attempts recorded yet.</td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="py-4 font-bold text-slate-700 dark:text-slate-200">Alex Johnson</td>
                    <td className="py-4 text-slate-600 dark:text-slate-400">{quizzes.find(q => q.id === res.quizId)?.title || 'Deleted Quiz'}</td>
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
