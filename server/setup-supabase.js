import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTables() {
  console.log('📍 Setting up Supabase tables...');

  try {
    // Check if teachers table exists and create if needed
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation')) {
        console.log('⚠️  Teachers table does not exist. You need to create it manually in Supabase.');
        console.log('\n📋 SQL to run in Supabase SQL Editor:\n');
        console.log(`
CREATE TABLE teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teachers_email ON teachers(email);
        `);
      } else {
        console.error('❌ Error checking table:', error);
      }
    } else {
      console.log('✅ Teachers table exists!');
    }
  } catch (err) {
    console.error('❌ Setup error:', err);
  }
}

setupTables();
