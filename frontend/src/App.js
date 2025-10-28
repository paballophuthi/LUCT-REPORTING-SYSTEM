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

// Component to handle authenticated routes - redirect to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Component for public routes that show to everyone
const PublicRoute = ({ children }) => {
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Header />
      
      <main className="container">
        {/* Show navigation to everyone, but it can adapt based on auth status */}
        <Navigation />
        
        <Routes>
          {/* Redirect root to dashboard - everyone can see dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public routes */}
          <Route 
            path="/dashboard" 
            element={
              <PublicRoute>
                <Dashboard />
              </PublicRoute>
            } 
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
        </Routes>
      </main>
      
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