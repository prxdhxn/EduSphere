
import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { Note } from '../types';
import { geminiService } from '../services/geminiService';

interface NotesViewProps {
  notes: Note[];
  onRefresh?: () => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onRefresh }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const toast = useToast();

  // Remove automatic refresh - only manual refresh now

  const handleAskAI = async (concept: string) => {
    setIsLoadingExplanation(true);
    setExplanation(null);
    try {
      const res = await geminiService.explainConcept(concept);
      setExplanation(res);
    } catch (e) {
      toast.show('AI Tutor is currently busy. Please try again later.', 'error');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleDownloadNote = (note: Note) => {
    const text = `${note.title}\n${'='.repeat(note.title.length)}\n\nBy: ${note.uploadedBy}\nDate: ${new Date(note.createdAt).toLocaleDateString()}\nSubject: ${note.subject}\n\n${note.content}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.show('Note downloaded successfully!', 'success');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Knowledge Base</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase">{notes.length} Total</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Refresh notes"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {notes.map(note => (
            <button 
              key={note.id}
              onClick={() => { setSelectedNote(note); setExplanation(null); }}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                selectedNote?.id === note.id 
                  ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                  : 'border-white bg-white hover:border-indigo-100 shadow-sm'
              }`}
            >
              <h4 className="font-bold text-slate-800 leading-tight mb-2 flex items-center gap-2">
                {note.title}
                {note.fileUrl && (
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
              </h4>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${note.id.startsWith('n-std') ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {note.subject}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 space-y-8">
        {selectedNote ? (
          <>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{selectedNote.title}</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedNote.id.startsWith('n-std') ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                    <p className="text-slate-500 text-sm font-semibold">
                      Contributed by <span className="text-slate-800">{selectedNote.uploadedBy}</span> 
                      <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-black uppercase">
                        {selectedNote.id.startsWith('n-std') ? 'Student' : 'Staff'}
                      </span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleAskAI(selectedNote.content)}
                  disabled={isLoadingExplanation}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-100 transition-all disabled:opacity-50 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {isLoadingExplanation ? 'AI IS ANALYZING...' : 'EXPLAIN WITH AI'}
                </button>
                <button 
                  onClick={() => handleDownloadNote(selectedNote)}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Download
                </button>
              </div>
              
              <div className="h-px w-full bg-slate-50 mb-8"></div>

              <div className="prose prose-indigo max-w-none text-slate-600 text-lg leading-relaxed font-medium">
                {selectedNote.content.split('\n').map((para, idx) => (
                  <p key={idx} className="mb-6">{para}</p>
                ))}
                
                {/* Show file attachment if available */}
                {selectedNote.fileUrl && (
                  <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div>
                        <p className="font-bold text-indigo-900 dark:text-indigo-100">File Attachment</p>
                        <a 
                          href={selectedNote.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium underline"
                        >
                          Download File
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {explanation && (
              <div className="bg-indigo-50/50 backdrop-blur-sm p-8 rounded-3xl border-2 border-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-indigo-900 tracking-tight">AI breakdown</h3>
                    <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Powered by Gemini Flash</p>
                  </div>
                </div>
                <div className="text-indigo-950 text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {explanation}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">No Course Content Yet</h4>
            <p className="max-w-xs font-medium text-slate-400 mb-4">Select a course module from the left or check back later for new materials.</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                🔄 Check for Updates
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;
