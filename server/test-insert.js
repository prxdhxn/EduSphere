import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edusphere';

(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);

    const noteSchema = new mongoose.Schema({
      id: String,
      title: String,
      content: String,
      student_id: String,
      student_name: String,
      created_at: { type: Date, default: Date.now }
    });

    const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

    const note = new Note({
      id: `test-${Date.now()}`,
      title: 'Test insert from server',
      content: 'This is a test note inserted by test-insert.js (MongoDB)',
      student_id: 's-test',
      student_name: 'Test Student'
    });

    const saved = await note.save();
    console.log('Insert success:', saved);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
