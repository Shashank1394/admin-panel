// frontend/src/pages/ManagePage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function ManagePage() {
  // Upload queue for multi‑file uploads
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  // Files fetched from the backend
  const [files, setFiles] = useState([]);
  const [sortOption, setSortOption] = useState("asc"); // 'asc' or 'desc'
  const [searchTerm, setSearchTerm] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all"); // 'all', 'image', 'video'

  // Multi‑select state for deletion
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);

  // Edit metadata modal state
  const [editFile, setEditFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [fileDescription, setFileDescription] = useState("");

  // Pagination state for "Load More"
  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreStep = 5;

  // Refs for file input and drag/drop area
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Fetch files from the backend
  const fetchFiles = async () => {
    try {
      const response = await axios.get("/api/files");
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // Poll for updates every 10 seconds (real‑time updates simulation)
  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Multi-File Upload Handling ---
  const handleFileChange = (event) => {
    const filesArray = Array.from(event.target.files);
    setUploadQueue(filesArray);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (uploadQueue.length === 0) {
      setUploadStatus("Please select at least one file.");
      return;
    }
    setUploadStatus("Uploading...");
    try {
      await Promise.all(
        uploadQueue.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          return axios.post("/api/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        })
      );
      setUploadStatus("Upload complete!");
      setUploadQueue([]);
      fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  // --- Deletion with Confirmation ---
  const handleDelete = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
    try {
      await axios.delete(`/api/files/${filename}`);
      setSelectedFiles((prev) => prev.filter((f) => f !== filename));
      fetchFiles();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleDeleteSelected = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedFiles.length} selected file(s)?`
      )
    )
      return;
    for (const filename of selectedFiles) {
      try {
        await axios.delete(`/api/files/${filename}`);
      } catch (error) {
        console.error("Delete error for", filename, error);
      }
    }
    setSelectedFiles([]);
    fetchFiles();
  };

  const toggleSelectFile = (filename) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  // --- Preview Modal Controls ---
  const openPreview = (file) => setPreviewFile(file);
  const closePreview = () => setPreviewFile(null);

  // --- Edit Metadata Controls ---
  const openEdit = (file) => {
    setEditFile(file);
    setNewFileName(file.filename);
    setFileDescription(file.description || "");
  };
  const closeEdit = () => {
    setEditFile(null);
    setNewFileName("");
    setFileDescription("");
  };
  const handleEditSave = async () => {
    // Assumes a PUT endpoint exists to update metadata for a file
    try {
      await axios.put(`/api/files/${editFile.filename}`, {
        newFileName,
        description: fileDescription,
      });
      closeEdit();
      fetchFiles();
    } catch (error) {
      console.error("Metadata update error:", error);
    }
  };

  // --- Sorting and Filtering ---
  const sortFiles = (fileList) => {
    return [...fileList].sort((a, b) => {
      return sortOption === "asc"
        ? a.filename.localeCompare(b.filename)
        : b.filename.localeCompare(a.filename);
    });
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const ext = file.filename.split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
    const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(ext);
    let matchesType = true;
    if (fileTypeFilter === "image") matchesType = isImage;
    if (fileTypeFilter === "video") matchesType = isVideo;
    return matchesSearch && matchesType;
  });

  let images = filteredFiles.filter((file) => {
    const ext = file.filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
  });
  let videos = filteredFiles.filter((file) => {
    const ext = file.filename.split(".").pop().toLowerCase();
    return ["mp4", "mov", "avi", "mkv", "webm"].includes(ext);
  });

  images = sortFiles(images);
  videos = sortFiles(videos);

  // --- Pagination ---
  const visibleImages = images.slice(0, visibleCount);
  const visibleVideos = videos.slice(0, visibleCount);

  // --- Drag and Drop Handling ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setUploadQueue((prev) => [...prev, ...droppedFiles]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between bg-white shadow-md px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Media Manager
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-800 placeholder-gray-500"
          />
          {/* File Type Filter */}
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          {/* Sort Options */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none"
          >
            <option value="asc">Sort A-Z</option>
            <option value="desc">Sort Z-A</option>
          </select>
          {/* Upload Controls */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
            >
              Upload File
            </button>
          </div>
        </div>
      </header>

      {/* Drag and Drop Upload Area */}
      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="mx-6 my-4 p-6 border-2 border-dashed border-gray-400 rounded-lg text-center text-gray-600 hover:bg-gray-100 transition"
      >
        {uploadQueue.length > 0 ? (
          <p>
            Selected Files: {uploadQueue.map((f) => f.name).join(", ")} –{" "}
            <button
              onClick={() => setUploadQueue([])}
              className="text-red-600 underline"
            >
              Clear All
            </button>
          </p>
        ) : (
          <p>Drag and drop files here, or click the upload button above.</p>
        )}
      </div>

      {/* Upload Form for Multi‑File Upload */}
      {uploadQueue.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-4 mx-6 my-4 flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-semibold">
              {uploadQueue.length} file(s) ready for upload.
            </p>
            {uploadStatus && (
              <p className="text-gray-600 text-sm">{uploadStatus}</p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
          >
            Confirm Upload
          </button>
        </div>
      )}

      {/* Delete Selected Button */}
      {selectedFiles.length > 0 && (
        <div className="mx-6 my-4">
          <button
            onClick={handleDeleteSelected}
            className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
          >
            Delete Selected ({selectedFiles.length})
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
            <p className="text-center text-gray-500">No images found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {visibleImages.map((file) => (
                  <div
                    key={file.filename}
                    className="border border-gray-200 rounded-md overflow-hidden relative group"
                  >
                    {/* Multi-select checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.filename)}
                      onChange={() => toggleSelectFile(file.filename)}
                      className="absolute top-1 left-1 z-10 w-4 h-4"
                    />
                    {/* Preview Area */}
                    <div
                      onClick={() => openPreview(file)}
                      className="bg-gray-50 flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={file.url}
                        alt={file.filename}
                        loading="lazy"
                        className="block object-cover w-full h-48"
                      />
                    </div>
                    {/* Edit and Delete Buttons */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(file)}
                        className="px-2 py-1 bg-black text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="px-2 py-1 bg-black text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition"
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
              {visibleCount < images.length && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setVisibleCount(visibleCount + loadMoreStep)}
                    className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
                  >
                    Load More Images
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Videos Section */}
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Uploaded Videos
          </h2>
          {videos.length === 0 ? (
            <p className="text-center text-gray-500">No videos found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {visibleVideos.map((file) => (
                  <div
                    key={file.filename}
                    className="border border-gray-200 rounded-md overflow-hidden relative group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.filename)}
                      onChange={() => toggleSelectFile(file.filename)}
                      className="absolute top-1 left-1 z-10 w-4 h-4"
                    />
                    <div
                      onClick={() => openPreview(file)}
                      className="bg-gray-50 flex items-center justify-center cursor-pointer"
                    >
                      <video
                        src={file.url}
                        controls
                        loading="lazy"
                        className="block object-cover w-full h-48"
                      />
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(file)}
                        className="px-2 py-1 bg-black text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="px-2 py-1 bg-black text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition"
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
              {visibleCount < videos.length && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setVisibleCount(visibleCount + loadMoreStep)}
                    className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
                  >
                    Load More Videos
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 bg-black text-white rounded-full p-2 hover:bg-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Preview
            </h2>
            {previewFile.url.endsWith(".mp4") ||
            previewFile.url.endsWith(".mov") ||
            previewFile.url.endsWith(".avi") ? (
              <video
                src={previewFile.url}
                controls
                className="w-full h-auto object-cover mb-4"
              />
            ) : (
              <img
                src={previewFile.url}
                alt={previewFile.filename}
                className="w-full h-auto object-cover mb-4"
              />
            )}
            <p className="text-gray-700">{previewFile.filename}</p>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
            <button
              onClick={closeEdit}
              className="absolute top-2 right-2 bg-black text-white rounded-full p-2 hover:bg-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Metadata
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Filename</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-800"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-gray-800"
              />
            </div>
            <button
              onClick={handleEditSave}
              className="w-full px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePage;
