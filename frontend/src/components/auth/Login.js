import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, forgotPassword, verifyResetCode, resetPassword } from '../../services/authService';
import './Login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('login');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const loginLeftPanelContentRef = useRef(null);
  const loginRightPanelContentRef = useRef(null);

  // Form data state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchPage = (page) => {
    if (page === currentPage || isAnimating) return;

    setIsAnimating(true);
    setCurrentPage(page);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  const meltElement = (element, delay = 0) => {
    if (!element || element.classList.contains('login-melting')) return;

    const container = element.closest('.login-melt-container') || element.parentElement;
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setTimeout(() => {
      element.classList.add('login-melting');

      const dropCount = Math.floor(element.offsetWidth / 10);
      for (let i = 0; i < dropCount; i++) {
        setTimeout(() => {
          const drop = document.createElement('div');
          drop.classList.add('login-melt-drop');
          const xPos = rect.left - containerRect.left + (i * (rect.width / dropCount));
          drop.style.left = `${xPos}px`;
          drop.style.top = `${rect.top - containerRect.top}px`;

          const size = Math.random() * 6 + 4;
          drop.style.width = `${size}px`;
          drop.style.height = `${size}px`;
          drop.style.animationDuration = `${Math.random() * 0.5 + 1}s`;
          drop.style.transform = `translateX(${Math.random() * 20 - 10}px)`;

          container.appendChild(drop);

          const ripple = document.createElement('div');
          ripple.classList.add('login-melt-particle');
          ripple.style.left = `${xPos}px`;
          ripple.style.top = `${rect.top - containerRect.top + rect.height / 2}px`;
          ripple.style.width = `${size * 2}px`;
          ripple.style.height = `${size * 2}px`;

          container.appendChild(ripple);

          setTimeout(() => {
            drop.remove();
            ripple.remove();
          }, 1500);
        }, i * 50);
      }

      setTimeout(() => {
        element.style.visibility = 'hidden';
      }, 500);
    }, delay);
  };

  const handleForgotPassword = () => {
    const leftPanelElements = loginLeftPanelContentRef.current?.querySelectorAll('h1, p, button');
    const rightPanelElements = loginRightPanelContentRef.current?.querySelectorAll('h2, input, a, button, p, .login-social-icons a');

    leftPanelElements?.forEach((element, index) => {
      meltElement(element, index * 100);
    });

    rightPanelElements?.forEach((element, index) => {
      meltElement(element, index * 100 + 300);
    });

    setTimeout(() => {
      setShowForgotPassword(true);
      setShowVerification(false);
      setShowResetForm(false);
      setIsVerified(false);
      setVerificationCode(['', '', '', '']);
      setForgotEmail('');
    }, 1500);
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(forgotEmail);
      setShowForgotPassword(false);
      setShowVerification(true);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    const enteredCode = verificationCode.join('');
    setError('');
    setLoading(true);

    try {
      await verifyResetCode(forgotEmail, enteredCode);
      setIsVerified(true);
      setTimeout(() => {
        setShowResetForm(true);
        setShowVerification(false);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 3) {
      document.getElementById(`login-code-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`login-code-input-${index - 1}`).focus();
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(forgotEmail, newPassword);
      alert('Password successfully reset!');
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(loginData.email, loginData.password);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (registerData.username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const data = await register(registerData.username, registerData.email, registerData.password);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-logo-container">
        <img src="/images/ff.png" alt="Logo" />
      </div>
      <div className="login-container">
        <div
          className={`login-blue-panel ${currentPage === 'register' ? 'login-flow-to-right' : 'login-flow-to-left'}`}
          id="loginBluePanel"
        ></div>

        <div className={`login-page ${currentPage === 'login' ? 'login-active' : ''}`}>
          <div className="login-left-panel">
            <div className="login-melt-container" ref={loginLeftPanelContentRef}>
              {isVerified ? (
                showResetForm ? null : (
                  <h2>Success!</h2>
                )
              ) : showForgotPassword ? (
                <div className="login-forgot-password-container">
                  <h2>Reset Password</h2>
                  <form onSubmit={handleForgotEmailSubmit}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                  </form>
                </div>
              ) : showVerification ? (
                <div className="login-verification-container">
                  <h2>Enter Verification Code</h2>
                  {error && <div className="login-error-message">{error}</div>}
                  <div className="login-verification-inputs">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`login-code-input-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                      />
                    ))}
                  </div>
                  <button className="login-confirm-btn" onClick={handleVerificationSubmit} disabled={loading}>
                    {loading ? 'Verifying...' : 'Confirm'}
                  </button>
                </div>
              ) : (
                <>
                  <h1>Hello, Welcome!</h1>
                  <p>Don't have an account?</p>
                  <button className="login-switch-btn" onClick={() => switchPage('register')}>
                    Register <i className="fas fa-arrow-right"></i>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="login-right-panel">
            <div className="login-melt-container" ref={loginRightPanelContentRef}>
              {isVerified ? (
                showResetForm ? (
                  <form className="login-password-reset-form" onSubmit={handleResetSubmit}>
                    <h2>Reset Password</h2>
                    {error && <div className="login-error-message">{error}</div>}
                    <input type="password" name="newPassword" placeholder="New Password" required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
                    <button type="submit" disabled={loading}>
                      {loading ? 'Resetting...' : 'Submit'}
                    </button>
                  </form>
                ) : (
                  <div className="login-verified-message">Verified</div>
                )
              ) : (
                <>
                  <h2>Login</h2>
                  {error && <div className="login-error-message">{error}</div>}
                  <form onSubmit={handleLoginSubmit}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <a href="#forgot" className="login-forgot-password" onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>
                      Forgot Password?
                    </a>
                    <button
                      type="submit"
                      className="login-action-btn"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>
                  <p className="login-social-text">or login with social</p>
                  <div className="login-social-icons">
                    <a href="#social"><i className="fab fa-google"></i></a>
                    <a href="#social"><i className="fab fa-linkedin-in"></i></a>
                    <a href="#social"><i className="fab fa-microsoft"></i></a>
                    <a href="#social"><i className="fab fa-twitter"></i></a>
                    <a href="#social"><i className="fab fa-apple"></i></a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`login-page login-register-page ${currentPage === 'register' ? 'login-active' : ''}`}>
          <div className="login-left-panel">
            <h2>Registration</h2>
            {error && <div className="login-error-message">{error}</div>}
            <form onSubmit={handleRegisterSubmit}>
              <div className="login-input-with-icon">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  required
                />
                <i className="fas fa-user"></i>
              </div>
              <div className="login-input-with-icon">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
                <i className="fas fa-envelope"></i>
              </div>
              <div className="login-input-with-icon">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
                <i className="fas fa-lock"></i>
              </div>
              <button
                type="submit"
                className="login-action-btn"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <p className="login-social-text">or register with social platforms</p>
            <div className="login-social-icons">
              <a href="#social"><i className="fab fa-google"></i></a>
              <a href="#social"><i className="fab fa-linkedin-in"></i></a>
              <a href="#social"><i className="fab fa-microsoft"></i></a>
              <a href="#social"><i className="fab fa-twitter"></i></a>
              <a href="#social"><i className="fab fa-apple"></i></a>
            </div>
          </div>
          <div className="login-right-panel">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button className="login-switch-btn" onClick={() => switchPage('login')}>
              Login <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
