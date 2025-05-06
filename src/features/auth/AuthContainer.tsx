import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { useAuthStore } from '../../store/authStore';

/**
 * AuthContainer manages the authentication flow, including login and signup screens
 */
const AuthContainer: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  // Get the intended destination if redirected from a protected route
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect to destination if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

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