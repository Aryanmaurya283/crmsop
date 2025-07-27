import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ProtectedRoute, SignInPage, SignUpPage } from '../components/auth';
import { MainLayout } from '../components/layout';
import { Dashboard, Leads, Contacts, Deals, Projects, Reports, Admin } from '../pages';
import ActivitiesNew from '../pages/ActivitiesNew';
import { LoadingSpinner } from '../components/common';

const AppRoutes = () => {
  const { isLoaded, isSignedIn } = useAuth();

  // Debug logging
  console.log('AppRoutes render:', { isLoaded, isSignedIn });

  // Show loading while Clerk initializes
  if (!isLoaded) {
    console.log('Showing loading spinner - Clerk not loaded');
    return <LoadingSpinner message="Initializing application..." />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/sign-in" 
        element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignInPage />} 
      />
      <Route 
        path="/sign-up" 
        element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignUpPage />} 
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/activities" element={<ActivitiesNew />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;