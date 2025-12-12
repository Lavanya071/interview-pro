import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// GET all questions
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM questions ORDER BY votes DESC');
  res.json(rows);
});

// POST add question
router.post('/', auth, async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, category, difficulty } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
    return res.status(400).json({ msg: 'Missing fields' });

  const [result] = await pool.query(
    'INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option, category, difficulty, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
    [question_text, option_a, option_b, option_c, option_d, correct_option, category || 'General', difficulty || 'Medium', req.user.id]
  );
  res.json({ msg: 'Question added', id: result.insertId });
});

// POST vote
router.post('/:id/vote', auth, async (req, res) => {
  const questionId = req.params.id;
  const [exists] = await pool.query('SELECT id FROM votes WHERE user_id=? AND question_id=?', [req.user.id, questionId]);
  if (exists.length) return res.status(400).json({ msg: 'Already voted' });

  await pool.query('INSERT INTO votes (user_id, question_id) VALUES (?,?)', [req.user.id, questionId]);
  await pool.query('UPDATE questions SET votes = votes + 1 WHERE id = ?', [questionId]);

  res.json({ msg: 'Voted successfully' });
});

export default router;
