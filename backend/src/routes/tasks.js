const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/tasks/project/:project_id
router.get('/project/:project_id', auth, async (req, res) => {
  try {
    // Verify project ownership or access
    const project = await db.query('SELECT * FROM projects WHERE id = $1 AND owner_id = $2', [req.params.project_id, req.user.id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found or unauthorized' });

    const tasks = await db.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC', [req.params.project_id]);
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks
router.post('/', auth, async (req, res) => {
  const { project_id, title, description, priority, due_date } = req.body;
  try {
    // Verify project
    const project = await db.query('SELECT * FROM projects WHERE id = $1 AND owner_id = $2', [project_id, req.user.id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found or unauthorized' });

    const newTask = await db.query(
      'INSERT INTO tasks (project_id, title, description, status, priority, due_date, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [project_id, title, description, 'pending', priority || 'medium', due_date, req.user.id]
    );
    res.json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id/status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const updatedTask = await db.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
