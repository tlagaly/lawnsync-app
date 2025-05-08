import React, { useState } from 'react';

interface EmailVerificationScreenProps {
  email: string;
  onResendVerification: () => Promise<void>;
  error: string | null;
}

/**
 * EmailVerificationScreen component for handling email verification
 * Displays after signup or login when email is not verified
 */
const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ 
  email, 
  onResendVerification,
  error
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    
    try {
      await onResendVerification();
      setResendSuccess(true);
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Verify Your Email</h2>
      
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
      
      {resendSuccess && (
        <div style={{ 
          backgroundColor: '#C6F6D5', 
          color: '#22543D', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          Verification email sent successfully!
        </div>
      )}
      
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#EBF8FF', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ marginBottom: '16px' }}>
          <strong>A verification email has been sent to:</strong>
        </p>
        <p style={{ 
          fontWeight: 'bold', 
          marginBottom: '16px',
          wordBreak: 'break-all' 
        }}>
          {email}
        </p>
        <p style={{ marginBottom: '16px' }}>
          Please check your inbox and click on the verification link to proceed.
        </p>
        <p style={{ fontSize: '14px', color: '#4A5568' }}>
          If you don't see it, please check your spam or junk folder.
        </p>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '12px' }}>Didn't receive the email?</p>
        <button
          onClick={handleResendVerification}
          disabled={isResending}
          style={{ 
            padding: '10px 16px',
            backgroundColor: '#4299E1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isResending ? 'not-allowed' : 'pointer',
            opacity: isResending ? 0.7 : 1,
            fontWeight: 'bold'
          }}
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>
      
      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        backgroundColor: '#F7FAFC',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <p>
          <strong>Why verify your email?</strong>
        </p>
        <ul style={{ 
          paddingLeft: '20px', 
          marginTop: '8px' 
        }}>
          <li>Ensure the security of your account</li>
          <li>Receive important notifications about your lawn</li>
          <li>Get personalized recommendations</li>
          <li>Recover your account if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailVerificationScreen;