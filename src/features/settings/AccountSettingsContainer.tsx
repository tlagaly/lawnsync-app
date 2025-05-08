import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUserProfileStore } from '../../store/userProfileStore';
import NotificationPreferencesView from './components/NotificationPreferencesView';

/**
 * AccountSettingsContainer provides a simple user account management interface
 */
const AccountSettingsContainer: React.FC = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuthStore();
  const { userProfile, updateUserProfile, isLoading } = useUserProfileStore();
  
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Handle saving profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile({ 
        ...userProfile,
        displayName
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Return loading state if user profile is still loading
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
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ margin: 0 }}>Account Settings</h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #CBD5E0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
      
      {/* Profile information section */}
      <div style={{ 
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ marginTop: 0 }}>Profile Information</h2>
        
        {isSuccess && (
          <div style={{ 
            backgroundColor: '#C6F6D5', 
            color: '#22543D', 
            padding: '12px', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            Profile successfully updated
          </div>
        )}
        
        <form onSubmit={handleSaveProfile}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold'
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              style={{ 
                width: '100%',
                padding: '10px',
                border: '1px solid #CBD5E0',
                borderRadius: '4px',
                backgroundColor: '#EDF2F7'
              }}
            />
            <small style={{ color: '#718096' }}>Email cannot be changed</small>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="displayName" 
              style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold'
              }}
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ 
                width: '100%',
                padding: '10px',
                border: '1px solid #CBD5E0',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSaving}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#48BB78',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              fontWeight: 'bold'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      
      {/* Lawn profiles section - placeholder for future expansion */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ marginTop: 0 }}>Lawn Profiles</h2>
        <p>You have {userProfile?.lawnProfiles?.length || 0} lawn profiles.</p>
        {/* Future implementation: List and manage lawn profiles */}
      </div>
      
      {/* Notification Preferences Section */}
      <NotificationPreferencesView />
      
      {/* Logout button */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#E53E3E',
            border: '1px solid #E53E3E',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default AccountSettingsContainer;