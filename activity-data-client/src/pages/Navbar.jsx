import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import "../styles/Navbar.css"

function Navbar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch(error => {
        console.error('Logout failed:', error);
        navigate('/login');
      })
      .finally(() => {
        setIsLoggingOut(false);
      });
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Activity Tracker</Link>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <div className="navbar-user">
              <span>Welcome, {user?.email}</span>
            </div>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/predictions">AI Predictions</Link>
              </li>
              <li className="nav-item">
                <button 
                  className="logout-btn" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </li>
            </ul>
          </>
        ) : (
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/login">Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/register">Sign Up</Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;