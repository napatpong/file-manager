import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';
import API_URL, { DIRECT_BACKEND_URL } from '../config/api.js';

const Upload = () => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  // No SSL certificate check needed anymore - using Worker proxy

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== UPLOAD STARTED ===');
    setError('');
    setSuccess('');

    if (!file) {
      console.log('No file selected');
      setError('Please select a file');
      return;
    }

    // Check file size limit (2GB maximum)
    const fileSizeMB = file.size / (1024 * 1024);
    const MAX_FILE_SIZE_MB = 2048; // 2GB
    
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setError(`File is too large (${fileSizeMB.toFixed(2)} MB). Maximum file size is ${MAX_FILE_SIZE_MB} MB (2GB).`);
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(file.size);

    try {
      // Upload via direct backend HTTPS URL for large files
      console.log('Starting upload to:', `${DIRECT_BACKEND_URL}/files/upload`);
      console.log('File size:', file.size, 'bytes');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);

      const response = await axios.post(`${DIRECT_BACKEND_URL}/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 600000, // 10 minutes timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          console.log('Upload progress:', progress, '%', progressEvent.loaded, '/', progressEvent.total);
          setUploadProgress(progress);
          setUploadedBytes(progressEvent.loaded);
          setTotalBytes(progressEvent.total);
        }
      });

      console.log('Upload response:', response.data);
      setSuccess('File uploaded successfully!');
      setFile(null);
      setDescription('');
      setUploadProgress(0);
      setUploadedBytes(0);
      setTotalBytes(0);
      document.getElementById('fileInput').value = '';
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error code:', err.code);
      
      if (err.response?.status === 413) {
        setError('File is too large. Maximum file size is 2 GB.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Upload timeout. Please try again or contact administrator.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.response?.data?.message || err.message || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Upload File</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center space-x-2">
          <FiCheck className="text-xl" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Select File
          </label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center hover:bg-blue-50 transition cursor-pointer">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <FiUploadCloud className="mx-auto text-5xl text-blue-500 mb-4" />
              <p className="text-lg text-gray-700 font-semibold">
                {file ? file.name : 'Click to select or drag and drop'}
              </p>
              {file && (
                <p className="text-sm text-gray-500 mt-2">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              )}
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this file..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
        </div>

        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatFileSize(uploadedBytes)} of {formatFileSize(totalBytes)}</span>
              <span>{formatFileSize(totalBytes - uploadedBytes)} remaining</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <FiUploadCloud className="text-xl" />
          <span>{loading ? 'Uploading...' : 'Upload File'}</span>
        </button>
      </form>
    </div>
  );
};

export default Upload;
