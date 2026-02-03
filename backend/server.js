/**
 * Q&A Backend Server
 * Simple Express server for UDDoubleDee Q&A system
 * Can be deployed to Vercel, Render, Railway, or any Node.js hosting
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'questions.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '20kb' }));

// Helper functions
function readQuestions() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeQuestions(questions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2));
}

function requireAdminToken(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(500).json({ success: false, error: 'ADMIN_TOKEN is not configured' });
  }
  const token = req.header('X-Admin-Token');
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return next();
}

function isTooLong(value, max) {
  return typeof value === 'string' && value.length > max;
}

// Routes

// GET all questions
app.get('/api/questions', requireAdminToken, (req, res) => {
  try {
    const questions = readQuestions();
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
});

// GET answered questions only (for public display)
app.get('/api/questions/answered', (req, res) => {
  try {
    const questions = readQuestions();
    const answered = questions.filter(q => q.status === 'answered');
    res.json({ success: true, data: answered });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
});

// POST new question
app.post('/api/questions', (req, res) => {
  try {
    const { name, category, question } = req.body;
    
    if (!category || !question) {
      return res.status(400).json({ success: false, error: 'Category and question are required' });
    }
    if (isTooLong(name || '', 80) || isTooLong(category, 80) || isTooLong(question, 1000)) {
      return res.status(400).json({ success: false, error: 'Input is too long' });
    }

    const questions = readQuestions();
    const newQuestion = {
      id: Date.now(),
      name: name || 'Anonymous',
      category,
      question,
      answer: '',
      status: 'pending',
      date: new Date().toISOString()
    };

    questions.unshift(newQuestion);
    writeQuestions(questions);

    res.status(201).json({ success: true, data: newQuestion });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create question' });
  }
});

// PUT update question (answer)
app.put('/api/questions/:id', requireAdminToken, (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ success: false, error: 'Answer is required' });
    }
    if (isTooLong(answer, 2000)) {
      return res.status(400).json({ success: false, error: 'Answer is too long' });
    }

    const questions = readQuestions();
    const index = questions.findIndex(q => q.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    questions[index].answer = answer;
    questions[index].status = 'answered';
    questions[index].answeredDate = new Date().toISOString();

    writeQuestions(questions);

    res.json({ success: true, data: questions[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update question' });
  }
});

// DELETE question
app.delete('/api/questions/:id', requireAdminToken, (req, res) => {
  try {
    const { id } = req.params;
    const questions = readQuestions();
    const index = questions.findIndex(q => q.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const deleted = questions.splice(index, 1)[0];
    writeQuestions(questions);

    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete question' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Q&A Backend running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});
