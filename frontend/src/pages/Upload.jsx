import React, { useState, useEffect } from 'react';
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

  // Test component mount
  useEffect(() => {
    console.error('🔴 UPLOAD COMPONENT MOUNTED - Testing Large File Upload');
    console.error('Token:', token ? 'EXISTS' : 'MISSING');
  }, []);

  // No SSL certificate check needed anymore - using Worker proxy

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.warn('✅ FILE SELECTED:', selectedFile?.name, 'Size:', selectedFile?.size, 'bytes');
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
    console.error('✅ === UPLOAD FORM SUBMITTED ===');
    setError('');
    setSuccess('');

    if (!file) {
      console.error('❌ No file selected');
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
      // Use chunked upload for files > 100MB
      if (file.size > 100 * 1024 * 1024) {
        console.error('📦 File > 100MB, using chunked upload');
        await uploadChunked();
      } else {
        console.error('📦 File < 100MB, using single upload');
        await uploadSingle();
      }
    } catch (error) {
      console.error('❌ === UPLOAD FAILED ===');
      console.error('Error:', error.message);
      setError(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const uploadSingle = async () => {
    // Original single upload method
    console.error('🚀 Starting single file upload');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    let lastProgressTime = Date.now();
    let lastProgressBytes = 0;

    const response = await axios.post(`${DIRECT_BACKEND_URL}/files/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 600000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        const now = Date.now();
        const timeDiff = now - lastProgressTime;
        const bytesDiff = progressEvent.loaded - lastProgressBytes;
        const speedMBps = (bytesDiff / 1024 / 1024) / (timeDiff / 1000);
        
        console.error(`⬆️ ${progress}% (${(progressEvent.loaded/1024/1024).toFixed(1)}MB / ${(progressEvent.total/1024/1024).toFixed(1)}MB) - Speed: ${speedMBps.toFixed(2)} MB/s`);
        
        setUploadProgress(progress);
        setUploadedBytes(progressEvent.loaded);
        setTotalBytes(progressEvent.total);
        
        lastProgressTime = now;
        lastProgressBytes = progressEvent.loaded;
      }
    });

    console.error('✅ Single upload successful!');
    setSuccess('File uploaded successfully!');
    setFile(null);
    setDescription('');
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    document.getElementById('fileInput').value = '';
  };

  const uploadChunked = async () => {
    // Chunked upload for large files
    console.error('🔄 Starting chunked upload');
    
    const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    console.error(`📦 File will be split into ${totalChunks} chunks of ${CHUNK_SIZE / 1024 / 1024}MB each`);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      console.error(`📤 Uploading chunk ${chunkIndex + 1}/${totalChunks} (${(chunk.size/1024/1024).toFixed(1)}MB)`);

      try {
        const response = await axios.post(
          `${DIRECT_BACKEND_URL}/files/upload-chunk`,
          chunk,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/octet-stream',
              'X-Chunk-Index': chunkIndex,
              'X-Total-Chunks': totalChunks,
              'X-File-Name': file.name,
              'X-File-ID': fileId
            },
            timeout: 300000, // 5 minutes per chunk
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            onUploadProgress: (progressEvent) => {
              const chunkProgress = (progressEvent.loaded / chunk.size) * 100;
              const totalProgress = ((chunkIndex * CHUNK_SIZE + progressEvent.loaded) / file.size) * 100;
              
              console.error(`⬆️ Chunk ${chunkIndex + 1}/${totalChunks}: ${chunkProgress.toFixed(0)}% | Total: ${totalProgress.toFixed(1)}%`);
              
              setUploadProgress(Math.round(totalProgress));
              setUploadedBytes(chunkIndex * CHUNK_SIZE + progressEvent.loaded);
            }
          }
        );

        console.error(`✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`);
      } catch (error) {
        console.error(`❌ Chunk ${chunkIndex + 1} failed:`, error.message);
        throw new Error(`Failed to upload chunk ${chunkIndex + 1}`);
      }
    }

    console.error('✅ All chunks uploaded successfully!');
    setSuccess('File uploaded successfully!');
    setFile(null);
    setDescription('');
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    document.getElementById('fileInput').value = '';
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
