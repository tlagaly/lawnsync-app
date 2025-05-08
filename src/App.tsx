import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import OnboardingContainer from './features/onboarding/OnboardingContainer'
import DashboardContainer from './features/dashboard/DashboardContainer'
import FixIssuesContainer from './features/fix-issues/FixIssuesContainer'
import MaintainContainer from './features/maintain/MaintainContainer'
import ImproveContainer from './features/improve/ImproveContainer'
import TrackContainer from './features/track/TrackContainer'
import ResourcesContainer from './features/resources/ResourcesContainer'
import AuthContainer from './features/auth/AuthContainer'
import AccountSettingsContainer from './features/settings/AccountSettingsContainer'
import AnalyticsFeedbackDemo from './features/demo/AnalyticsFeedbackDemo'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import ChakraProviderWrapper from './ChakraProviderWrapper'
import { useAuthStore } from './store/authStore'
import './App.css'

/**
 * Main App component
 * Provides routing between app sections using the jobs-to-be-done approach
 * Each section focuses on specific user goals rather than features
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
        
        {/* Protected routes with AppLayout */}
        <Route
          element={
            <ProtectedRoute redirectPath="/login">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardContainer />} />
          
          {/* Fix Issues */}
          <Route path="/fix-issues" element={<FixIssuesContainer />} />
          
          {/* Maintain */}
          <Route path="/maintain" element={<MaintainContainer />} />
          
          {/* Improve */}
          <Route path="/improve" element={<ImproveContainer />} />
          
          {/* Track */}
          <Route path="/track" element={<TrackContainer />} />
          
          {/* Resources */}
          <Route path="/resources" element={<ResourcesContainer />} />
          
          {/* Settings */}
          <Route path="/settings" element={<AccountSettingsContainer />} />
        </Route>
        
        {/* Demo page for analytics and feedback system */}
        <Route
          path="/demo/analytics"
          element={<AnalyticsFeedbackDemo />}
        />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
