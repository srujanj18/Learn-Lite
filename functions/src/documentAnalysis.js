import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { analyzeWithFlanT5 } from '../src/lib/huggingface.js';
import { auth, db } from '../src/lib/firebase.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    await auth.verifyIdToken(token);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Document analysis endpoint
app.post('/api/analyze', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = req.file.buffer.toString('utf-8');
    const result = await analyzeWithFlanT5(text);
    
    // Save analysis to Firestore
    const userId = req.headers['x-user-id'];
    await db.collection('documentAnalysis').add({
      userId,
      text: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''),
      analysis: result,
      timestamp: new Date()
    });
    
    res.json({ analysis: result });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default app;