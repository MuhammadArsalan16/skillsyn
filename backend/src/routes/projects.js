const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await db.query('SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const newProject = await db.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    res.json(newProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
