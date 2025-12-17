import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiKey, FiX, FiPlus, FiShield } from 'react-icons/fi';
import API_URL from '../config/api.js';

const FileAccess = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [accessList, setAccessList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filesRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/files`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setFiles(filesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async (file) => {
    setSelectedFile(file);
    setSelectedUserId('');
    try {
      const response = await axios.get(
        `${API_URL}/api/files/${file.id}/access`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAccessList(response.data.accessList);
    } catch (err) {
      setAccessList([]);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedFile || !selectedUserId) {
      alert('Please select a file and user');
      return;
    }

    setGranting(true);
    try {
      await axios.post(
        `${API_URL}/api/files/${selectedFile.id}/access`,
        { userId: parseInt(selectedUserId) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSelectedUserId('');
      handleSelectFile(selectedFile);
      alert('Access granted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grant access');
    } finally {
      setGranting(false);
    }
  };

  const handleRevokeAccess = async (userId) => {
    if (!window.confirm('Revoke access for this user?')) return;

    try {
      await axios.delete(
        `${API_URL}/api/files/${selectedFile.id}/access/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      handleSelectFile(selectedFile);
      alert('Access revoked successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke access');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FiKey className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">File Access Control</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Files List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Files</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {files.length === 0 ? (
                <p className="text-gray-500">No files available</p>
              ) : (
                files.map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedFile?.id === file.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold truncate">{file.originalname}</div>
                    <div className="text-sm opacity-75">Uploaded by: {file.username}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Access Management */}
          <div className="lg:col-span-2">
            {selectedFile ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  {selectedFile.originalname}
                </h2>

                {/* Grant Access Section */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-800 mb-4">Grant Access</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a user...</option>
                      {users.map(user => {
                        const hasAccess = accessList.some(a => a.id === user.id);
                        const isUploader = selectedFile.uploadedBy === user.id;
                        if (hasAccess || isUploader) return null;
                        return (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={handleGrantAccess}
                      disabled={granting || !selectedUserId}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      <FiPlus /> Grant
                    </button>
                  </div>
                </div>

                {/* Access List */}
                <div className="max-h-96 overflow-y-auto">
                  <h3 className="font-bold text-gray-800 mb-4">Users with Access</h3>
                  {(() => {
                    // Get uploader user object
                    const uploader = users.find(u => u.id === selectedFile.uploadedBy);
                    // Get admin users
                    const admins = users.filter(u => u.role === 'admin');
                    
                    // Combine: uploader (always), admins (always), + explicitly granted users
                    const allAccessUsers = [];
                    
                    // Add uploader with badge
                    if (uploader) {
                      allAccessUsers.push({
                        ...uploader,
                        grantedAt: selectedFile.uploadedAt,
                        accessType: 'uploader'
                      });
                    }
                    
                    // Add other admins (if not uploader)
                    admins.forEach(admin => {
                      if (admin.id !== selectedFile.uploadedBy) {
                        allAccessUsers.push({
                          ...admin,
                          grantedAt: new Date().toISOString(),
                          accessType: 'admin'
                        });
                      }
                    });
                    
                    // Add explicitly granted users
                    accessList.forEach(user => {
                      if (user.id !== selectedFile.uploadedBy && !admins.some(a => a.id === user.id)) {
                        allAccessUsers.push({
                          ...user,
                          accessType: 'granted'
                        });
                      }
                    });
                    
                    if (allAccessUsers.length === 0) {
                      return (
                        <p className="text-gray-500 text-center py-8">
                          No users have been granted explicit access.
                        </p>
                      );
                    }
                    
                    return (
                      <div className="space-y-2">
                        {allAccessUsers.map(user => (
                          <div
                            key={`${user.id}-${user.accessType}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-gray-800">{user.username}</div>
                                {user.accessType === 'uploader' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                                    <FiShield size={12} /> Uploader
                                  </span>
                                )}
                                {user.accessType === 'admin' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                    <FiShield size={12} /> Admin
                                  </span>
                                )}
                                {user.accessType === 'granted' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                    Granted
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.grantedAt && (
                                <div className="text-xs text-gray-400">
                                  {user.accessType === 'uploader' ? 'Uploaded: ' : user.accessType === 'admin' ? 'Always: ' : 'Granted: '}
                                  {new Date(user.grantedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            {user.accessType === 'granted' && (
                              <button
                                onClick={() => handleRevokeAccess(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke access"
                              >
                                <FiX size={20} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-500 text-lg">Select a file to manage access</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileAccess;
