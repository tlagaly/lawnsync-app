import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import { useAuthStore } from '../../store/authStore';

/**
 * AuthContainer manages the authentication flow, including login and signup screens
 */
const AuthContainer: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isEmailVerified,
    clearError,
    sendVerificationEmail
  } = useAuthStore();
  
  // Get the intended destination if redirected from a protected route
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect to destination if already authenticated and email verified
  useEffect(() => {
    if (isAuthenticated && isEmailVerified) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isEmailVerified, navigate, from]);

  // Toggle between login and signup views
  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    // Clear any existing errors when switching modes
    clearError();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If authenticated but email not verified, show email verification screen
  if (isAuthenticated && !isEmailVerified) {
    return (
      <div style={{
        maxWidth: '450px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <EmailVerificationScreen
          email={user?.email || ''}
          onResendVerification={sendVerificationEmail}
          error={error}
        />
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '450px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {isSignup ? (
        <SignupScreen onToggleMode={toggleAuthMode} error={error} />
      ) : (
        <LoginScreen onToggleMode={toggleAuthMode} error={error} />
      )}
    </div>
  );
};

export default AuthContainer;