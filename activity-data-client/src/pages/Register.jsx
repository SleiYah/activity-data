import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearMessages } from '../slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Login-SignUp.css"
function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, message, isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(clearMessages());
    
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    if (message) {
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [dispatch, isAuthenticated, message, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    const { confirmPassword, ...registrationData } = formData;
    dispatch(register(registrationData))
      .unwrap()
      .then(() => {
      })
      .catch(error => {
        console.error('Registration failed:', error);
        setIsSubmitting(false);
      });
  };
  
  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <h2>Create an Account</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {message && (
          <div className="success-message">
            {message}
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {passwordError && (
              <div className="password-error">
                {passwordError}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="register-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;