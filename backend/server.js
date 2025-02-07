const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS to allow requests from the frontend
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the uploads folder
app.use('/uploads', express.static(uploadsDir));

// -------------------------
// File Upload and Management (No Authentication)
// -------------------------

// Configure multer for file uploads.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Prepend a timestamp to avoid collisions.
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Endpoint to handle file uploads.
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  res.status(200).json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    }
  });
});

// Endpoint to list all uploaded files.
app.get('/api/files', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
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

// Endpoint to delete a file.
app.delete('/api/files/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
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
