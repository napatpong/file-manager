import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Users from './pages/Users';
import FileAccess from './pages/FileAccess';
import './App.css';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {user && <Navbar />}
      <main className="bg-gray-50">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute requiredRole={['uploader', 'admin']}>
                <Upload />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute requiredRole={['admin']}>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/file-access"
            element={
              <PrivateRoute requiredRole={['admin']}>
                <FileAccess />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
