import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { JobSocketProvider } from './context/JobSocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import InsightsPage from './pages/InsightsPage';
import ContestsPage from './pages/ContestsPage';
import JobTrackerPage from './pages/job-tracker/JobTrackerPage';
import ApplicationsPage from './pages/job-tracker/ApplicationsPage';
import EmailsPage from './pages/job-tracker/EmailsPage';
import LiveJobsPage from './pages/live-jobs/LiveJobsPage';
import DailyProblemsPage from './pages/DailyProblemsPage';
import PublicCardPage from './pages/PublicCardPage';
import ResumeTailorPage from './pages/ResumeTailorPage';


function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/card/:userId" element={<PublicCardPage />} />

        {/* Protected routes inside DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/contests" element={<ContestsPage />} />
            <Route path="/job-tracker" element={<JobTrackerPage />} />
            <Route path="/job-tracker/applications" element={<ApplicationsPage />} />
            <Route path="/job-tracker/emails" element={<EmailsPage />} />
            <Route path="/live-jobs" element={<LiveJobsPage />} />
            <Route path="/daily" element={<DailyProblemsPage />} />
            <Route path="/resume" element={<ResumeTailorPage />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JobSocketProvider>
          <BrowserRouter>
            <AnimatedRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#111118', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
                success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
              }}
            />
          </BrowserRouter>
        </JobSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;