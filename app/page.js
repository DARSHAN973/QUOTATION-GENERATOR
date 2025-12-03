'use client';

import { useAuth } from '../context/AuthContext.js';
import { AppProvider } from '../context/AppContext.js';
import MainLayout from '../components/layout/MainLayout.js';
import LoginPage from '../components/auth/LoginPage.js';

export default function Home() {
  const { isAuthenticated, isLoading, user, setUser } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={setUser} />;
  }

  // Show main app if authenticated
  return (
    <AppProvider>
      <MainLayout user={user} />
    </AppProvider>
  );
}
