import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Database features will be unavailable.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Quiz operations
export const quizService = {
  async saveQuiz(quiz: any) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([{
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subject,
          timeLimit: quiz.timeLimit,
          questions: JSON.stringify(quiz.questions),
          createdBy: quiz.createdBy,
          createdAt: quiz.createdAt,
        }])
        .select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving quiz:', err);
      throw err;
    }
  },

  async getAllQuizzes() {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return (data || []).map((q: any) => ({
        ...q,
        questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions,
      }));
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      return [];
    }
  },
};

// Results operations
export const resultsService = {
  async saveResult(result: any) {
    try {
      const { data, error } = await supabase
        .from('results')
        .insert([{
          id: result.id,
          studentId: result.studentId,
          studentName: result.studentName,
          quizId: result.quizId,
          score: result.score,
          totalQuestions: result.totalQuestions,
          completedAt: result.completedAt,
          answers: JSON.stringify(result.answers || []),
        }])
        .select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving result:', err);
      throw err;
    }
  },

  async getStudentResults(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('studentId', studentId)
        .order('completedAt', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
      }));
    } catch (err) {
      console.error('Error fetching student results:', err);
      return [];
    }
  },

  async getAllResults() {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('completedAt', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
      }));
    } catch (err) {
      console.error('Error fetching all results:', err);
      return [];
    }
  },
};

// Notes operations
export const notesService = {
  async saveNote(note: any) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          id: note.id,
          title: note.title,
          subject: note.subject,
          content: note.content,
          uploadedBy: note.uploadedBy,
          createdAt: note.createdAt,
          fileUrl: note.fileUrl || null,
        }])
        .select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving note:', err);
      throw err;
    }
  },

  async getAllNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching notes:', err);
      return [];
    }
  },

  async uploadNoteFile(noteId: string, file: File) {
    try {
      const fileName = `${noteId}-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('notes')
        .upload(fileName, file);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error uploading note file:', err);
      throw err;
    }
  },

  async getNoteDownloadUrl(filePath: string) {
    try {
      const { data } = supabase.storage.from('notes').getPublicUrl(filePath);
      return data?.publicUrl || '';
    } catch (err) {
      console.error('Error getting note download URL:', err);
      return '';
    }
  },
};
