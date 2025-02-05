// backend/server.js

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS to allow requests from the frontend
app.use(cors());

// Serve static files from the uploads folder (to be accessed by the Android app or web clients)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // Files will be saved in the uploads directory
  },
  filename: function (req, file, cb) {
    // Prepend a timestamp to avoid collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// API endpoint to handle file uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  // In a production app, you would also store file metadata in a database
  res.status(200).json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    }
  });
});

// API endpoint to list all uploaded files
app.get('/api/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan uploads directory' });
    }
    // Return full URLs so clients can fetch the images directly
    const fileList = files.map(file => ({
      filename: file,
      url: `${req.protocol}://${req.get('host')}/uploads/${file}`
    }));
    res.status(200).json({ files: fileList });
  });
});

// API endpoint to delete a file
app.delete('/api/files/:filename', (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
