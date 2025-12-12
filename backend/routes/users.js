import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST bookmark question
router.post('/bookmark', auth, async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ msg: 'Missing questionId' });

    const [exists] = await pool.query('SELECT id FROM bookmarks WHERE user_id = ? AND question_id = ?', [req.user.id, questionId]);
    if (exists.length) return res.status(400).json({ msg: 'Already bookmarked' });

    await pool.query('INSERT INTO bookmarks (user_id, question_id) VALUES (?,?)', [req.user.id, questionId]);
    res.json({ msg: 'Bookmarked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.* FROM questions q
       JOIN bookmarks b ON b.question_id = q.id
       WHERE b.user_id = ? ORDER BY q.id DESC`, [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
