require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve uploads folder as static files
const uploadDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Assignment 2 Multer Image Upload API', timestamp: new Date() });
});

// Routes
app.use('/api/upload', uploadRoutes);

// Multer error handling
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large! Maximum allowed size is 5MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'File upload error' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Assignment 2 Multer Image Upload Backend running at http://localhost:${PORT}`);
  console.log(`📁 Uploaded assets served at http://localhost:${PORT}/uploads`);
});
