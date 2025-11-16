import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { auth } from './firebase';
// FIX: The User type from 'firebase/auth' is for the v9 modular SDK. This project uses the v8 compat library.
import firebase from 'firebase/compat/app';

export type Page = 'landing' | 'login' | 'dashboard';

const App: React.FC = () => {
  // FIX: Use firebase.auth.User as the type for the user state.
  const [user, setUser] = useState<firebase.auth.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };
  
  const navigateTo = (page: Page) => {
     if (page === 'login') {
       // A bit of a hack to show login page when user is logged out
       // but wants to navigate from landing page.
       setUser(null);
     }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">Loading Application...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      {user ? (
        <DashboardPage user={user} handleLogout={handleLogout} />
      ) : (
         <LandingPage navigateTo={navigateTo} />
        // <LoginPage /> // This is now part of the conditional rendering logic
      )}
    </div>
  );
};

export default App;
