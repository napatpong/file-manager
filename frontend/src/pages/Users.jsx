import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiUser, FiPlus } from 'react-icons/fi';
import API_URL from '../config/api.js';

const Users = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'downloader'
  });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      username: user.username,
      email: user.email,
      role: user.role,
      canUpload: user.canUpload,
      canDownload: user.canDownload
    });
  };

  const handleSave = async (userId) => {
    try {
      await axios.put(`${API_URL}/users/${userId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!createData.username || !createData.email || !createData.password) {
      alert('Please fill in all fields');
      return;
    }

    setCreatingUser(true);
    try {
      await axios.post(`${API_URL}/users`, createData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User created successfully!');
      setCreateData({ username: '', email: '', password: '', role: 'downloader' });
      setShowCreateForm(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
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
      <h1 className="text-4xl font-bold text-gray-800 mb-8">User Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center space-x-2 transition"
          >
            <FiPlus />
            <span>Add New User</span>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={createData.username}
                  onChange={(e) => setCreateData({ ...createData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="downloader">Downloader</option>
                  <option value="uploader">Uploader</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateUser}
                  disabled={creatingUser}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition"
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateData({ username: '', email: '', password: '', role: 'downloader' });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Permissions</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingId === user.id ? (
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    <span className="flex items-center space-x-2">
                      <FiUser className="text-blue-500" />
                      <span>{user.username}</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === user.id ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === user.id ? (
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="downloader">Downloader</option>
                      <option value="uploader">Uploader</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${
                      user.role === 'admin' ? 'bg-red-500' :
                      user.role === 'uploader' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {editingId === user.id ? (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editData.canUpload}
                          onChange={(e) => setEditData({ ...editData, canUpload: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Can Upload</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editData.canDownload}
                          onChange={(e) => setEditData({ ...editData, canDownload: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Can Download</span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p>Upload: {user.canUpload ? '✓' : '✗'}</p>
                      <p>Download: {user.canDownload ? '✓' : '✗'}</p>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === user.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(user.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded flex items-center space-x-1 transition"
                      >
                        <FiEdit2 />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded flex items-center space-x-1 transition"
                      >
                        <FiTrash2 />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
