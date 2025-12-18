import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiDownload, FiTrash2, FiFile, FiList, FiGrid } from 'react-icons/fi';
import API_URL from '../config/api.js';

// Progress bar implementation for both grid and list views - 2025-12-18
const Dashboard = () => {
  const { token, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalDownloadBytes, setTotalDownloadBytes] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const getGrantedLabel = (file) => {
    // If file has granted users, show them
    if (file.grantedUsernames && file.grantedUsernames.length > 0) {
      return file.grantedUsernames.join(', ');
    }
    // Default to uploader
    return file.username;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (fileId, originalname, filesize) => {
    try {
      setDownloadingId(fileId);
      setDownloadProgress(0);
      setDownloadedBytes(0);
      setTotalDownloadBytes(filesize);

      const response = await axios.get(
        `${API_URL}/api/files/${fileId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            // Use filesize as fallback if progressEvent.total is not available
            const total = progressEvent.total || filesize;
            const progress = total > 0 ? Math.round((progressEvent.loaded / total) * 100) : 0;
            setDownloadProgress(isNaN(progress) ? 0 : progress);
            setDownloadedBytes(progressEvent.loaded);
            setTotalDownloadBytes(total);
          }
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalname || 'download');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadingId(null);
      setDownloadProgress(0);
    } catch (err) {
      console.error('Download error:', err);
      alert(err.response?.data?.message || 'Download failed');
      setDownloadingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`${API_URL}/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the files list after delete
      fetchFiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Files Library</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded flex items-center space-x-2 transition ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiList />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded flex items-center space-x-2 transition ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiGrid />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-12">
          <FiFile className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No files available</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map(file => (
            <div key={file.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6">
              <div className="flex items-start justify-between mb-4">
                <FiFile className="text-4xl text-blue-500" />
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  {(file.filesize / 1024).toFixed(2)} KB
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                {file.originalname}
              </h3>

              {file.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {file.description}
                </p>
              )}

              <p className="text-xs text-gray-500 mb-4">
                Granted: <strong>{getGrantedLabel(file)}</strong>
              </p>

              {downloadingId === file.id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-700">Downloading...</span>
                    <span className="text-xs text-gray-600">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formatFileSize(downloadedBytes)}</span>
                    <span>{formatFileSize(totalDownloadBytes - downloadedBytes)} left</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(file.id, file.originalname, file.filesize)}
                  disabled={downloadingId === file.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  <FiDownload />
                  <span>{downloadingId === file.id ? 'Downloading...' : 'Download'}</span>
                </button>

                {(user.role === 'admin' || user.id === file.uploadedBy) && (
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center transition"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Filename</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Granted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FiFile className="text-blue-500" />
                      <span className="font-medium text-gray-800">{file.originalname}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(file.filesize / 1024).toFixed(2)} KB
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getGrantedLabel(file)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {file.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      {downloadingId === file.id && (
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-gray-700">Downloading...</span>
                            <span className="text-xs text-gray-600">{downloadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-300"
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{formatFileSize(downloadedBytes)}</span>
                            <span>{formatFileSize(totalDownloadBytes - downloadedBytes)} left</span>
                          </div>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(file.id, file.originalname, file.filesize)}
                          disabled={downloadingId === file.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded flex items-center space-x-1 transition disabled:opacity-50"
                        >
                          <FiDownload className="text-sm" />
                          <span>{downloadingId === file.id ? 'Downloading...' : 'Download'}</span>
                        </button>

                        {(user.role === 'admin' || user.id === file.uploadedBy) && (
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded flex items-center justify-center transition"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}    </div>
  );
};

export default Dashboard;
