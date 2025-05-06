import { Routes, Route, Navigate } from 'react-router-dom'
import OnboardingContainer from './features/onboarding/OnboardingContainer'
import DashboardContainer from './features/dashboard/DashboardContainer'
import './App.css'

/**
 * Main App component
 * Provides routing between onboarding and dashboard screens
 * Temporarily removed ChakraProvider due to compatibility issues with version 3.17.0
 */
function App() {
  return (
    <div className="lawnsync-app">
      <Routes>
        {/* Redirect root to onboarding */}
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        
        {/* Onboarding flow */}
        <Route path="/onboarding" element={<OnboardingContainer />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardContainer />} />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </div>
  );
}

export default App;
