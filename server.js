const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const pasteDir = path.join(__dirname, 'pastes');

app.use(cors());
app.use(express.json());


app.use(express.static('fronted'));

 
if (!fs.existsSync(pasteDir)) {
  fs.mkdirSync(pasteDir);
}

function generateId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
app.post('/api/paste', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const id = generateId();
  const filePath = path.join(pasteDir, `${id}.txt`);
  fs.writeFileSync(filePath, code);

  res.json({ id, url: `/view.html?id=${id}` });
});

app.get('/api/paste/:id', (req, res) => {
  const filePath = path.join(pasteDir, `${req.params.id}.txt`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Paste not found' });
  }

  const code = fs.readFileSync(filePath, 'utf8');
  res.json({ id: req.params.id, code });
});

// Віддаємо сирий текст пасти
app.get('/raw/:id', (req, res) => {
  const filePath = path.join(pasteDir, `${req.params.id}.txt`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Not found');
  }

  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
