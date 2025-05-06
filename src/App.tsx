import { Routes, Route, Navigate } from 'react-router-dom'
import OnboardingContainer from './features/onboarding/OnboardingContainer'
import DashboardContainer from './features/dashboard/DashboardContainer'
import AuthContainer from './features/auth/AuthContainer'
import AccountSettingsContainer from './features/settings/AccountSettingsContainer'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './store/authStore'
import './App.css'

/**
 * Main App component
 * Provides routing between onboarding, auth, and dashboard screens
 * Temporarily removed ChakraProvider due to compatibility issues with version 3.17.0
 */
function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading state during initial auth check
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
    <div className="lawnsync-app">
      <Routes>
        {/* Redirect root to onboarding or dashboard based on auth state */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/onboarding" replace />
          }
        />
        
        {/* Onboarding flow */}
        <Route path="/onboarding" element={<OnboardingContainer />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<AuthContainer />} />
        <Route path="/signup" element={<AuthContainer />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute redirectPath="/login">
              <DashboardContainer />
            </ProtectedRoute>
          }
        />
        
        {/* Account settings (protected) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute redirectPath="/login">
              <AccountSettingsContainer />
            </ProtectedRoute>
          }
        />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
