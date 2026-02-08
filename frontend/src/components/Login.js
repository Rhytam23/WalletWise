import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      const data = await login({ email, password });

      if (data?.success) {
        navigate('/dashboard', { replace: true });
        toast.success('Login successful!', {
          autoClose: 1500,
          pauseOnHover: false
        });
      } else if (data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.info('Please verify your email to continue.');
        const targetEmail = data?.email || email;
        navigate(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.msg || 
        'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="auth-card">
        <div className="auth-header">
          <h1>WalletWise</h1>
          <p className="subtitle">Welcome back, student.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaUser className="input-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="demo-btn google-btn"
            onClick={() => {
              const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
              window.location.href = `${apiBase}/auth/google`;
            }}
          >
            Continue with Google
          </button>

        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?
            <Link to="/signup" className="auth-link"> Sign Up</Link>
          </p>
        </div>
      </div>

      <div className="auth-features">
        <h3>Why WalletWise?</h3>
        <ul>
          <li>Track expenses automatically</li>
          <li>Set budgets that fit campus life</li>
          <li>Mobile-friendly from day one</li>
          <li>Private and secure by design</li>
          <li>Student-first insights</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
