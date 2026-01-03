import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Initialize Supabase client (prefer server-side service role key if present)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseKeyToUse = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKeyToUse) {
  console.warn('Warning: Supabase credentials not found in .env (SUPABASE_URL or key missing)');
}

const supabase = createClient(supabaseUrl, supabaseKeyToUse);

// Log which key type was used (do NOT print the key itself)
if (supabaseUrl && supabaseKeyToUse) {
  console.log(`✅ Supabase client initialized using ${supabaseServiceKey ? 'service_role key' : 'anon key'}`);
}

// Make supabase available to all routes
app.locals.supabase = supabase;

// Connect to MongoDB via Mongoose
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edusphere';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected at', mongoUri))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schemas & models
const teacherSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const noteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  content: String,
  subject: String,
  student_id: String,
  student_name: String,
  fileUrl: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  subject: String,
  timeLimit: Number,
  number_of_questions: Number,
  questions: mongoose.Schema.Types.Mixed,
  created_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const resultSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  quiz_id: String,
  student_id: String,
  student_name: String,
  score: Number,
  total_questions: Number,
  answers: mongoose.Schema.Types.Mixed,
  completed_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);

// Set CSP headers to allow connections from frontend
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:* ws://localhost:*; img-src 'self' data: https:;"
  );
  next();
});

const API_KEY = process.env.GEN_API_KEY || process.env.API_KEY || '';
if (!API_KEY) {
  console.warn('Warning: GEN_API_KEY is not set. Gemini requests will fail without a valid key.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

app.post('/api/generate-quiz', async (req, res) => {
  const { topic, count = 5 } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  try {
    if (!API_KEY) {
      console.warn('GEN_API_KEY missing — returning mock quiz');
      const mock = generateMockQuestions(topic, count);
      return res.json({ questions: mock });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a quiz with ${count} questions about: ${topic}. The output must be a valid JSON array of objects with the following structure: { "text": "The question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0 }`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let parsed = [];
    try {
      // Some Gemini SDKs return text at different fields — try multiple fallbacks
      const raw = response?.text || response?.output || JSON.stringify(response);
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse Gemini response', e);
      console.warn('Falling back to a mock quiz');
      const mock = generateMockQuestions(topic, count);
      return res.json({ questions: mock });
    }

    return res.json({ questions: parsed });
  } catch (err) {
    console.error('Gemini generate error', err);
    const mock = generateMockQuestions(topic, count);
    return res.status(200).json({ questions: mock, warning: 'Gemini request failed, returned mock data' });
  }
});

// Explain concept endpoint
app.post('/api/explain-concept', async (req, res) => {
  const { concept } = req.body || {};
  if (!concept) return res.status(400).json({ error: 'Missing concept' });

  try {
    if (!API_KEY) {
      console.warn('GEN_API_KEY missing — returning mock explanation');
      const mockExplanation = `Here's a simple explanation of the concept:\n\n• This is a fundamental topic in the subject area\n• It involves understanding key principles and applications\n• Students should focus on practical examples and real-world usage\n• Practice and repetition help reinforce the learning\n\nFor more detailed information, consult your textbook or ask your instructor.`;
      return res.json({ explanation: mockExplanation });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the following educational concept in a simple, easy-to-understand way for a student: ${concept}. Use bullet points for key takeaways. Keep it under 200 words.`,
    });

    const explanation = response?.text || response?.output || 'Unable to generate explanation at this time.';
    return res.json({ explanation });
  } catch (err) {
    console.error('Gemini explain error', err);
    const mockExplanation = `Here's a simple explanation of the concept:\n\n• This is a fundamental topic in the subject area\n• It involves understanding key principles and applications\n• Students should focus on practical examples and real-world usage\n• Practice and repetition help reinforce the learning\n\nFor more detailed information, consult your textbook or ask your instructor.`;
    return res.json({ explanation: mockExplanation, warning: 'Gemini request failed, returned mock explanation' });
  }
});

function generateMockQuestions(topic, count) {
  const examples = [
    {
      text: `What is the purpose of the <head> element in ${topic}?`,
      options: ['Holds document metadata', 'Displays page body', 'Links to CSS only', 'Runs JavaScript'],
      correctAnswer: 0
    },
    {
      text: `Which tag is used for the largest heading in ${topic}?`,
      options: ['<h1>', '<h6>', '<title>', '<header>'],
      correctAnswer: 0
    },
    {
      text: `Which attribute specifies an image source in HTML?`,
      options: ['src', 'href', 'alt', 'source'],
      correctAnswer: 0
    }
  ];

  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(examples[i % examples.length]);
  }
  return out;
}

// Get all quizzes endpoint
app.get('/api/get-quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).sort({ created_at: -1 }).lean().exec();
    
    // Transform the data to match frontend expectations
    const transformedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions,
      createdBy: quiz.created_by,
      createdAt: quiz.created_at
    }));
    
    res.json({ success: true, quizzes: transformedQuizzes });
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all results endpoint
app.get('/api/get-results', async (req, res) => {
  try {
    const results = await Result.find({}).sort({ completed_at: -1 }).lean().exec();
    
    const transformedResults = results.map(result => ({
      id: result.id,
      quizId: result.quiz_id,
      studentId: result.student_id,
      studentName: result.student_name,
      score: result.score,
      totalQuestions: result.total_questions,
      answers: result.answers,
      completedAt: result.completed_at,
      date: result.completed_at // For compatibility
    }));
    
    res.json({ success: true, results: transformedResults });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all notes endpoint
app.get('/api/get-notes', async (req, res) => {
  try {
    const notes = await Note.find({}).sort({ created_at: -1 }).lean().exec();
    
    const transformedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      subject: note.subject || 'General',
      content: note.content,
      uploadedBy: note.student_name || note.uploadedBy || 'Unknown',
      createdAt: note.created_at,
      fileUrl: note.fileUrl
    }));
    
    res.json({ success: true, notes: transformedNotes });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save quiz endpoint
app.post('/api/save-quiz', async (req, res) => {
  try {
    const { id, title, subject, timeLimit, questions, createdBy, createdAt } = req.body;

    const doc = new Quiz({
      id,
      title,
      subject,
      timeLimit,
      number_of_questions: questions?.length || 0,
      questions,
      created_by: createdBy,
      created_at: createdAt || new Date()
    });

    const saved = await doc.save();
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Save quiz error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save result endpoint
app.post('/api/save-result', async (req, res) => {
  try {
    const { id, quizId, studentId, studentName, score, totalQuestions, answers, completedAt } = req.body;

    const doc = new Result({
      id,
      quiz_id: quizId,
      student_id: studentId,
      student_name: studentName,
      score,
      total_questions: totalQuestions,
      answers,
      completed_at: completedAt || new Date()
    });

    const saved = await doc.save();
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Save result error:', err);
    res.status(500).json({ error: err.message });
  }
});

// File upload endpoint for notes
app.post('/api/upload-file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      fileUrl: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save note endpoint
app.post('/api/save-note', async (req, res) => {
  try {
    const { id, title, subject, content, uploadedBy, createdAt, fileUrl } = req.body;

    const doc = new Note({
      id,
      title,
      content,
      student_id: uploadedBy, // Use uploadedBy as student_id for compatibility
      student_name: uploadedBy,
      created_at: createdAt || new Date(),
      subject: subject,
      fileUrl: fileUrl
    });

    const saved = await doc.save();
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Save note error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Teacher registration endpoint
app.post('/api/register-teacher', async (req, res) => {
  try {
    const { id, name, email, password } = req.body;

    const existing = await Teacher.findOne({ email }).exec();
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const doc = new Teacher({ id, name, email, password, created_at: new Date() });
    const saved = await doc.save();
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Register teacher error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Teacher login verification endpoint
app.post('/api/verify-teacher', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Teacher.findOne({ email, password }).lean().exec();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Verify teacher error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server proxy listening on port ${PORT}`));
