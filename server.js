require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

app.post('/api/history', (req, res) => {
  const { expression, result } = req.body;
  db.query('INSERT INTO history (expression, result) VALUES (?, ?)', [expression, result], err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.get('/api/history', (req, res) => {
  if (req.query.all === '1') {
    db.query('SELECT expression, result FROM history ORDER BY created_at DESC', (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  } else {
    const offset = parseInt(req.query.offset) || 0;
    db.query('SELECT expression, result FROM history ORDER BY created_at DESC LIMIT 5 OFFSET ?', [offset], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  }
});

app.delete('/api/history', (req, res) => {
  db.query('DELETE FROM history', err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
