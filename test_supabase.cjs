require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Using Supabase URL:', SUPABASE_URL ? 'OK' : 'MISSING');
console.log('Using Supabase Key:', SUPABASE_ANON_KEY ? 'OK' : 'MISSING');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    const quiz = {
      id: `test-${Date.now()}`,
      title: 'Connectivity Test Quiz',
      subject: 'Test',
      timeLimit: 5,
      questions: JSON.stringify([{ text: 'Test Q', options: ['A','B','C'], correctAnswer: 0 }]),
      createdBy: 'test-runner',
      createdAt: new Date().toISOString()
    };

    console.log('Attempting insert...');
    const { data, error } = await supabase.from('quizzes').insert([quiz]).select();
    if (error) {
      console.error('Supabase insert error:', error);
      process.exit(1);
    }
    console.log('Insert result:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(2);
  }
})();