import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';
import API_URL from '../config/api.js';

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

  // Test component mount
  useEffect(() => {
  }, []);

  // No SSL certificate check needed anymore - using Worker proxy

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
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
    setError('');
    setSuccess('');

    if (!file) {
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
      await uploadSingle();
    } catch (error) {
      setError(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const uploadSingle = async () => {
    // Single upload method
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    console.log('[UPLOAD] Starting upload:', {
      filename: file.name,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      api: API_URL
    });

    let lastProgressTime = Date.now();
    let lastProgressBytes = 0;

    try {
      console.log('[UPLOAD] Creating axios request...');
      const response = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 1800000, // 30 minutes
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          console.log('[UPLOAD] Progress:', progress + '%', {
            loaded: progressEvent.loaded,
            total: progressEvent.total
          });
          
          const now = Date.now();
          const timeDiff = now - lastProgressTime;
          const bytesDiff = progressEvent.loaded - lastProgressBytes;
          const speedMBps = (bytesDiff / 1024 / 1024) / (timeDiff / 1000);
          
          setUploadProgress(progress);
          setUploadedBytes(progressEvent.loaded);
          setTotalBytes(progressEvent.total);
          
          lastProgressTime = now;
          lastProgressBytes = progressEvent.loaded;
        }
      });

      console.log('[UPLOAD] Success response:', response.status);
      setSuccess('File uploaded successfully!');
      setFile(null);
      setDescription('');
      setUploadProgress(0);
      setUploadedBytes(0);
      setTotalBytes(0);
      document.getElementById('fileInput').value = '';
    } catch (err) {
      console.error('[UPLOAD] Error caught:', {
        code: err.code,
        message: err.message,
        response: err.response?.status,
        responseData: err.response?.data
      });
      
      if (err.code === 'ECONNABORTED') {
        setError('Upload timeout - request took too long');
      } else if (!err.response) {
        setError('Network error - no response from server. Check browser console for details.');
      } else {
        setError(err.response?.data?.message || err.message || 'Upload failed');
      }
      throw err;
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
