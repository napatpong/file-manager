import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiHome, FiUsers, FiUploadCloud, FiKey } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <FiUploadCloud className="text-2xl" />
              <span>File Manager</span>
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded transition"
              >
                <FiHome />
                <span>Dashboard</span>
              </button>
              {(user.role === 'admin' || user.role === 'uploader') && (
                <button
                  onClick={() => navigate('/upload')}
                  className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  <FiUploadCloud />
                  <span>Upload</span>
                </button>
              )}
              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => navigate('/users')}
                    className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded transition"
                  >
                    <FiUsers />
                    <span>Users</span>
                  </button>
                  <button
                    onClick={() => navigate('/file-access')}
                    className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded transition"
                  >
                    <FiKey />
                    <span>File Access</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Hello, <strong>{user.username}</strong> ({user.role})</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
