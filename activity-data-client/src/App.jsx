import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './pages/Navbar';
import Dashboard from './pages/Dashboard';
import AiPredictions from './pages/AiPredictions';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/predictions" 
              element={
                <ProtectedRoute>
                  <AiPredictions />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;