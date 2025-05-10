import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import OnboardingContainer from './features/onboarding/OnboardingContainer'
import AuthContainer from './features/auth/AuthContainer'
import AccountSettingsContainer from './features/settings/AccountSettingsContainer'
import AnalyticsFeedbackDemo from './features/demo/AnalyticsFeedbackDemo'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import ChakraProviderWrapper from './ChakraProviderWrapper'
import { useAuthStore } from './store/authStore'
import './App.css'

// New user-centric container components
import HomeContainer from './features/home/HomeContainer'
import TasksProjectsContainer from './features/tasks-projects/TasksProjectsContainer'
import AIAssistantContainer from './features/assistant/AIAssistantContainer'
import MyLawnContainer from './features/my-lawn/MyLawnContainer'
import PlantIdentifierContainer from './features/plant-identifier/PlantIdentifierContainer'

/**
 * Main App component
 * Provides routing between app sections using the user-centric approach
 * Each section focuses on specific user goals rather than features
 * Updated navigation structure based on user feedback
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
    <ChakraProviderWrapper>
      <div className="lawnsync-app">
        <Routes>
        {/* Redirect root to onboarding or dashboard based on auth state */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/home" replace />
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
          {/* Home (Dashboard) */}
          <Route path="/home" element={<HomeContainer />} />
          
          {/* Tasks and Projects */}
          <Route path="/tasks-projects" element={<TasksProjectsContainer />} />
          
          {/* AI Assistant */}
          <Route path="/assistant" element={<AIAssistantContainer />} />
          
          {/* My Lawn */}
          <Route path="/my-lawn" element={<MyLawnContainer />} />
          
          {/* Plant Identifier */}
          <Route path="/plant-identifier" element={<PlantIdentifierContainer />} />
          
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
    </ChakraProviderWrapper>
  );
}

export default App;
