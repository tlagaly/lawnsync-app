import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';

interface SignupScreenProps {
  onToggleMode: () => void;
  error: string | null;
}

/**
 * SignupScreen component for new user registration
 */
const SignupScreen: React.FC<SignupScreenProps> = ({ onToggleMode, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset form error
    setFormError(null);
    
    // Basic validation
    if (!email || !password || !confirmPassword) {
      setFormError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signUp(email, password);
      // If successful, the AuthContainer will handle redirects
      // to email verification screen
    } catch (error) {
      // Error handling is managed by the auth store
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show either form error or auth store error
  const displayError = formError || error;
  
  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Create your LawnSync account</h2>
      
      <p style={{ textAlign: 'center', marginBottom: '24px', color: '#4A5568' }}>
        Get personalized lawn care recommendations based on your specific needs
      </p>
      
      {displayError && (
        <div style={{ 
          backgroundColor: '#FED7D7', 
          color: '#9B2C2C', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {displayError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: 'block', 
              marginBottom: '6px',
              fontWeight: 'bold'
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%',
              padding: '10px',
              border: '1px solid #CBD5E0',
              borderRadius: '4px'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="password" 
            style={{ 
              display: 'block', 
              marginBottom: '6px',
              fontWeight: 'bold'
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%',
              padding: '10px',
              border: '1px solid #CBD5E0',
              borderRadius: '4px'
            }}
            required
          />
          <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>
            Must be at least 6 characters long
          </small>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="confirmPassword" 
            style={{ 
              display: 'block', 
              marginBottom: '6px',
              fontWeight: 'bold'
            }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ 
              width: '100%',
              padding: '10px',
              border: '1px solid #CBD5E0',
              borderRadius: '4px'
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ 
            width: '100%',
            padding: '12px',
            backgroundColor: '#48BB78',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            fontWeight: 'bold',
            marginBottom: '16px'
          }}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account & Verify Email'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <button
          onClick={onToggleMode}
          style={{ 
            background: 'none',
            border: 'none',
            color: '#4299E1',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Log in
        </button>
      </p>
    </div>
  );
};

export default SignupScreen;