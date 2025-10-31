import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Navigation from './components/common/Navigation';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ReportList from './components/reports/ReportList';
import ReportView from './components/reports/ReportView';
import ComplaintList from './components/complaints/ComplaintList';
import MonitoringView from './components/monitoring/MonitoringView';
import CourseList from './components/courses/CourseList';
import './App.css';

// Component to handle authenticated routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Component for public routes that redirect to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If user is already logged in, redirect them away from login/register
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      {/* Show header to everyone */}
      <Header />
      
      <main className="main-content">
        {/* Show navigation only to authenticated users */}
        {user && <Navigation />}
        
        <div className="content-wrapper">
          <Routes>
            {/* Redirect root to dashboard - everyone can see dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Public routes */}
            <Route 
              path="/dashboard" 
              element={<Dashboard />} 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes - only for logged in users */}
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <ReportList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/:id" 
              element={
                <ProtectedRoute>
                  <ReportView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/complaints" 
              element={
                <ProtectedRoute>
                  <ComplaintList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/monitoring" 
              element={
                <ProtectedRoute>
                  <MonitoringView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <CourseList />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - 404 page */}
            <Route 
              path="*" 
              element={
                <div className="not-found">
                  <h2>404 - Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/dashboard">Go to Dashboard</a>
                </div>
              } 
            />
          </Routes>
        </div>
      </main>
      
      {/* Show footer to everyone */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;