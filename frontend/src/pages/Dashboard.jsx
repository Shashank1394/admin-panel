import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // New state for auto-refresh

  // Fetch files from the backend
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/files');
      setFiles(response.data.files);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Error fetching files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling (poll every 30 seconds if autoRefresh is enabled)
  useEffect(() => {
    fetchFiles();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchFiles, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filter files by date range (using timestamp from filename)
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const parts = file.filename.split('-');
      const timestamp = parseInt(parts[0], 10);
      if (isNaN(timestamp)) return false;
      const fileDate = new Date(timestamp);
      let withinRange = true;
      if (startDate) {
        withinRange = withinRange && fileDate >= new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        withinRange = withinRange && fileDate <= endDateObj;
      }
      return withinRange;
    });
  }, [files, startDate, endDate]);

  // Metrics calculation
  const totalFiles = filteredFiles.length;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

  const images = filteredFiles.filter((file) => {
    const ext = file.filename.split('.').pop().toLowerCase();
    return imageExtensions.includes(ext);
  });
  const videos = filteredFiles.filter((file) => {
    const ext = file.filename.split('.').pop().toLowerCase();
    return videoExtensions.includes(ext);
  });

  // Recent uploads: sort by timestamp descending (from filename) and take top 5
  const recentUploads = useMemo(() => {
    return [...filteredFiles]
      .sort((a, b) => {
        const tsA = parseInt(a.filename.split('-')[0], 10);
        const tsB = parseInt(b.filename.split('-')[0], 10);
        return tsB - tsA;
      })
      .slice(0, 5);
  }, [filteredFiles]);

  // Prepare chart data: group uploads by date
  const uploadCounts = useMemo(() => {
    const counts = {};
    filteredFiles.forEach((file) => {
      const parts = file.filename.split('-');
      const timestamp = parseInt(parts[0], 10);
      if (!isNaN(timestamp)) {
        const dateStr = new Date(timestamp).toLocaleDateString();
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    });
    return counts;
  }, [filteredFiles]);

  const chartLabels = useMemo(() => {
    return Object.keys(uploadCounts).sort((a, b) => new Date(a) - new Date(b));
  }, [uploadCounts]);
  const chartDataValues = chartLabels.map(label => uploadCounts[label]);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Uploads',
        data: chartDataValues,
        backgroundColor: 'rgba(37, 99, 235, 0.5)', // Tailwind blue-600 with transparency
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Chart fills its container
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'File Uploads Over Time' },
    },
  };

  // Doughnut chart for file type distribution
  const pieData = {
    labels: ['Images', 'Videos'],
    datasets: [
      {
        data: [images.length, videos.length],
        backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
        hoverBackgroundColor: ['rgba(16, 185, 129, 0.9)', 'rgba(239, 68, 68, 0.9)'],
      },
    ],
  };

  // Export filtered data as CSV
  const exportToCSV = () => {
    const headers = ['Filename', 'URL'];
    const rows = filteredFiles.map(file => [file.filename, file.url]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "files_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 overflow-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Date Range Filter, Export & Auto-Refresh Toggle */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-gray-800"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-gray-800"
        />
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
        >
          Apply Filter
        </button>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
        >
          Export Data
        </button>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
        >
          Auto Refresh: {autoRefresh ? 'On' : 'Off'}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold text-gray-700">Total Files</h2>
          <p className="text-3xl font-bold text-gray-800">{totalFiles}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold text-gray-700">Images</h2>
          <p className="text-3xl font-bold text-gray-800">{images.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold text-gray-700">Videos</h2>
          <p className="text-3xl font-bold text-gray-800">{videos.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold text-gray-700">Recent Uploads</h2>
          <p className="text-3xl font-bold text-gray-800">{recentUploads.length}</p>
        </div>
      </div>

      {/* Chart Type Toggle */}
      <div className="mb-4 text-center">
        <button
          onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
          className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
        >
          Switch to {chartType === 'bar' ? 'Line' : 'Bar'} Chart
        </button>
      </div>

      {/* Chart Section with Fixed Height */}
      <div className="bg-white p-6 rounded shadow mb-8 h-72">
        {chartType === 'bar' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Doughnut Chart for File Type Distribution */}
      <div className="bg-white p-6 rounded shadow mb-8 h-72">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">File Type Distribution</h2>
        <Doughnut
          data={pieData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
          }}
        />
      </div>

      {/* Recent Uploads List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Uploads</h2>
        {recentUploads.length === 0 ? (
          <p>No recent uploads found.</p>
        ) : (
          <ul>
            {recentUploads.map((file) => {
              const ts = parseInt(file.filename.split('-')[0], 10);
              const dateStr = isNaN(ts) ? '' : new Date(ts).toLocaleString();
              return (
                <li key={file.filename} className="mb-2 border-b pb-2">
                  <p className="text-gray-800 font-medium">{file.filename}</p>
                  <p className="text-gray-600 text-sm">{dateStr}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
