const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Use environment variable for JWT secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Enable CORS to allow requests from the frontend
app.use(cors());

// Parse JSON bodies (for login)
app.use(express.json());

// Serve static files from the uploads folder (accessible by clients)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------------
// Authentication Section
// -------------------------

// Dummy admin user – in production, replace with database lookup.
const adminUser = {
  username: 'admin',
  // The password is "admin123" hashed; change as needed.
  passwordHash: bcrypt.hashSync('admin123', 10),
};

// Login endpoint to authenticate user and return a JWT.
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate username
  if (username !== adminUser.username) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT that expires in 1 hour.
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware to verify JWT tokens.
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // The token is expected to be in the format "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// -------------------------
// File Upload and Management
// -------------------------

// Configure multer for file uploads.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // Files are saved in the uploads directory
  },
  filename: function (req, file, cb) {
    // Prepend a timestamp to avoid collisions.
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Protected API endpoint to handle file uploads.
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  // In production, also store file metadata in a database.
  res.status(200).json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    }
  });
});

// Protected API endpoint to list all uploaded files.
app.get('/api/files', authenticateToken, (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan uploads directory' });
    }
    // Return full URLs so clients can fetch the files directly.
    const fileList = files.map(file => ({
      filename: file,
      url: `${req.protocol}://${req.get('host')}/uploads/${file}`
    }));
    res.status(200).json({ files: fileList });
  });
});

// Protected API endpoint to delete a file.
app.delete('/api/files/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('File deletion error:', err);
      return res.status(500).json({ error: 'File deletion failed' });
    }
    res.status(200).json({ message: 'File deleted successfully' });
  });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
