
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { auth } from './firebase';
// FIX: The User type from 'firebase/auth' is for the v9 modular SDK. This project uses the v8 compat library.
import firebase from 'firebase/compat/app';

export type Page = 'landing' | 'login' | 'dashboard';

const App: React.FC = () => {
  // FIX: Use firebase.User which is the correct type for the v8 compat library user object.
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('landing');


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setCurrentPage('dashboard');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setCurrentPage('landing');
  };
  
  const navigateTo = (page: Page) => {
     setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">Loading Application...</div>
      </div>
    );
  }

  const renderUnauthenticatedView = () => {
    switch(currentPage) {
      case 'login':
        return <LoginPage />;
      case 'landing':
      default:
        return <LandingPage navigateTo={navigateTo} />;
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      {user ? (
        <DashboardPage user={user} handleLogout={handleLogout} />
      ) : (
         renderUnauthenticatedView()
      )}
    </div>
  );
};

export default App;