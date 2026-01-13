const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'secret-token';

const DATA_DIR = path.join(__dirname, 'data');
const UPDATES_DIR = path.join(DATA_DIR, 'updates');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPDATES_DIR)) fs.mkdirSync(UPDATES_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ updates: [] }, null, 2));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPDATES_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${id}__${safe}`);
  }
});
const upload = multer({ storage });

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

app.post('/api/publish', upload.single('file'), (req, res) => {
  const token = req.header('x-admin-token');
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  const { version, type, features } = req.body;
  if (!req.file) return res.status(400).json({ error: 'file required' });

  const id = req.file.filename.split('__')[0];
  const meta = {
    id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    version: version || '0.0.0',
    type: type || 'FOTA',
    features: (features || '').split(',').map(s => s.trim()).filter(Boolean),
    uploadedAt: new Date().toISOString()
  };

  const db = readDB();
  db.updates.push(meta);
  writeDB(db);

  res.json({ ok: true, meta });
});

app.get('/api/updates', (req, res) => {
  const db = readDB();
  res.json(db.updates);
});

app.get('/api/updates/:id/download', (req, res) => {
  const id = req.params.id;
  const db = readDB();
  const meta = db.updates.find(u => u.id === id);
  if (!meta) return res.status(404).json({ error: 'not found' });
  const filePath = path.join(UPDATES_DIR, meta.filename);
  res.download(filePath, meta.originalName);
});

// Feature-on-demand: client submits features array, server returns zip of matching files
app.post('/api/feature-download', (req, res) => {
  const { features } = req.body || {};
  if (!features || !Array.isArray(features) || features.length === 0) {
    return res.status(400).json({ error: 'features array required' });
  }
  const db = readDB();
  const matches = db.updates.filter(u => u.features.some(f => features.includes(f)));

  if (matches.length === 0) return res.status(404).json({ error: 'no matching updates' });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=features_${Date.now()}.zip`);

  const archive = archiver('zip');
  archive.on('error', err => res.status(500).send({ error: err.message }));
  archive.pipe(res);

  matches.forEach(m => {
    const filePath = path.join(UPDATES_DIR, m.filename);
    archive.file(filePath, { name: m.originalName });
  });

  archive.finalize();
});

app.get('/', (req, res) => res.redirect('/customer.html'));

app.listen(PORT, () => console.log(`FOTA POC server running on http://localhost:${PORT}`));
