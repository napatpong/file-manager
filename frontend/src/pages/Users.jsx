import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiUser, FiPlus } from 'react-icons/fi';
import API_URL from '../config/api.js';

const Users = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    username: '',
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
      // Ensure response.data is an array
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    // Edit functionality removed
  };

  const handleSave = async (userId) => {
    // Save functionality removed
  };

  const handleDelete = async (userId, userRole) => {
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
    
    if (!createData.username || !createData.password) {
      alert('Please fill in username and password');
      return;
    }

    setCreatingUser(true);
    try {
      await axios.post(`${API_URL}/users`, createData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User created successfully!');
      setCreateData({ username: '', password: '', role: 'downloader' });
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Permissions</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="flex items-center space-x-2">
                    <FiUser className="text-blue-500" />
                    <span>{user.username}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${
                    user.role === 'admin' ? 'bg-red-500' :
                    user.role === 'uploader' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="space-y-1">
                    <p>Upload: {user.canUpload ? '✓' : '✗'}</p>
                    <p>Download: {user.canDownload ? '✓' : '✗'}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={currentUser?.id === user.id || user.username === 'admin'}
                    className={`${
                      currentUser?.id === user.id || user.username === 'admin'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white font-semibold py-1 px-3 rounded flex items-center space-x-1 transition`}
                    title={
                      currentUser?.id === user.id 
                        ? 'Cannot delete your own account' 
                        : user.username === 'admin'
                        ? 'Cannot delete admin user'
                        : 'Delete user'
                    }
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
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
