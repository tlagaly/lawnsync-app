import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';

interface LoginScreenProps {
  onToggleMode: () => void;
  error: string | null;
}

/**
 * LoginScreen component for user authentication
 */
const LoginScreen: React.FC<LoginScreenProps> = ({ onToggleMode, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      // Error handling is managed by the auth store
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Log in to LawnSync</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#FED7D7', 
          color: '#9B2C2C', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
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
        
        <div style={{ marginBottom: '20px' }}>
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
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center' }}>
        Don't have an account?{' '}
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
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginScreen;