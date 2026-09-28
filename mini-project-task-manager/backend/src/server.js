require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve Multer uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

connectDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Skill Nexus Week 3 - Full Stack Task Manager API', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Mini Project Task Manager API running at http://localhost:${PORT}`);
  console.log(`📁 Static upload storage served at http://localhost:${PORT}/uploads`);
});
