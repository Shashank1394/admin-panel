import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState([]);

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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

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
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus(response.data.message);
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center">
      {/* Header */}
      <header className="py-6 bg-white shadow-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-800">Admin Panel</h1>
      </header>

      {/* Upload Section */}
      <section className="bg-white shadow-lg rounded-lg p-6 mt-6 w-96 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upload New File</h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer w-24 h-24 flex items-center justify-center bg-gray-200 border border-gray-400 rounded-md hover:bg-gray-300 transition">
            {selectedFile ? selectedFile.name : "📂"}
          </label>
          <button type="submit" className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition">
            Upload File
          </button>
          {uploadStatus && <p className="text-gray-600">{uploadStatus}</p>}
        </form>
      </section>

      {/* Uploaded Files Section */}
      <section className="bg-white shadow-lg rounded-lg p-6 mt-6 w-4/5 max-w-screen-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Uploaded Files</h2>
        {files.length === 0 ? (
          <p className="text-center text-gray-500">No files uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.filename} className="border border-gray-200 rounded-md overflow-hidden">
                <img src={file.url} alt={file.filename} className="object-cover w-full h-40" />
                <div className="p-2">
                  <p className="text-xs text-gray-500 break-all">{file.filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
