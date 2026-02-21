import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
// import Dashboard from './pages/dashboard';
import AuthProvider, { useAuth } from './context/authContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route 
          path="/dashboard" 
          // element={
          //   <ProtectedRoute>
          //     <Dashboard />
          //   </ProtectedRoute>
          // } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;