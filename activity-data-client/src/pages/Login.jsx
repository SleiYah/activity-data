import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearMessages } from '../slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Login-SignUp.css"
function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(clearMessages());
    
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [dispatch, isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = 'Logging in...';
    
    dispatch(login(formData))
      .unwrap()
      .then(() => {
        navigate('/dashboard');
      })
      .catch(error => {
        console.error('Login failed:', error);
        submitButton.disabled = false;
        submitButton.innerText = 'Login';
      });
  };
  
  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Login to Your Account</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
          >
            Login
          </button>
        </form>
        
        <div className="register-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;