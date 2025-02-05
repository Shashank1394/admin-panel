// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function ManagePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [sortOption, setSortOption] = useState('asc'); // 'asc' or 'desc'
  
  // Reference to the hidden file input for programmatic click
  const fileInputRef = useRef(null);

  // Fetch the list of uploaded files from the backend
  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files');
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file input change and update selected file
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle file upload submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadStatus('Please select a file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadStatus('Uploading...');
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus(response.data.message);
      setSelectedFile(null);
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  // Handle file deletion
  const handleDelete = async (filename) => {
    try {
      await axios.delete(`/api/files/${filename}`);
      fetchFiles();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Sort files by filename based on selected sort option
  const sortFiles = (fileList) => {
    return [...fileList].sort((a, b) => {
      if (sortOption === 'asc') {
        return a.filename.localeCompare(b.filename);
      } else {
        return b.filename.localeCompare(a.filename);
      }
    });
  };

  // Detect file category from the file MIME type (for preview purposes)
  const detectedCategory = selectedFile
    ? selectedFile.type.startsWith('image')
      ? 'Image'
      : selectedFile.type.startsWith('video')
      ? 'Video'
      : 'Other'
    : '';

  // Helper arrays to categorize files based on extension
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

  let images = files.filter((file) => {
    const ext = file.filename.split('.').pop().toLowerCase();
    return imageExtensions.includes(ext);
  });
  let videos = files.filter((file) => {
    const ext = file.filename.split('.').pop().toLowerCase();
    return videoExtensions.includes(ext);
  });

  // Sort the arrays
  images = sortFiles(images);
  videos = sortFiles(videos);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-md px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-800">Media Manager</h1>
        <div className="flex items-center space-x-4">
          {/* Sorting Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none"
          >
            <option value="asc">Sort A-Z</option>
            <option value="desc">Sort Z-A</option>
          </select>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            id="file-upload"
          />
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
          >
            Upload File
          </button>
        </div>
      </header>

      {/* Upload Form (for submission) */}
      {selectedFile && (
        <div className="bg-white shadow-md rounded-lg p-4 mx-6 my-4 flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-semibold">
              {selectedFile.name} ({detectedCategory})
            </p>
            {uploadStatus && <p className="text-gray-600 text-sm">{uploadStatus}</p>}
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
          >
            Confirm Upload
          </button>
        </div>
      )}

      {/* Files Display */}
      <div className="mx-6 my-4 flex flex-col space-y-10">
        {/* Images Section */}
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Uploaded Images
          </h2>
          {images.length === 0 ? (
            <p className="text-center text-gray-500">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((file) => (
                <div
                  key={file.filename}
                  className="border border-gray-200 rounded-md overflow-hidden relative"
                >
                  <div className="w-full h-40 flex items-center justify-center bg-gray-50">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="absolute top-0 right-0 p-1">
                    <button
                      onClick={() => handleDelete(file.filename)}
                      className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-500 break-all">
                      {file.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Videos Section */}
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Uploaded Videos
          </h2>
          {videos.length === 0 ? (
            <p className="text-center text-gray-500">No videos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((file) => (
                <div
                  key={file.filename}
                  className="border border-gray-200 rounded-md overflow-hidden relative"
                >
                  <div className="w-full h-40 flex items-center justify-center bg-gray-50">
                    <video
                      src={file.url}
                      controls
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="absolute top-0 right-0 p-1">
                    <button
                      onClick={() => handleDelete(file.filename)}
                      className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-500 break-all">
                      {file.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ManagePage;
