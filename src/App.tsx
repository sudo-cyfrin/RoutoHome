import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [currentScreen, setCurrentScreen] = useState('home');

  // Handle navigation
  const navigate = (screen: string) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user logs in, ensure they go to dashboard
  useEffect(() => {
    if (user && (currentScreen === 'login' || currentScreen === 'signup')) {
      setCurrentScreen('home');
    }
  }, [user, currentScreen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-100">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-yellow-100">
      <Navbar onNavigate={navigate} currentScreen={currentScreen} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* Public Landing Page */}
          {!user && currentScreen === 'home' && (
            <LandingPage key="landing" onGetStarted={() => navigate('signup')} />
          )}

          {/* Auth Screens */}
          {!user && (currentScreen === 'login' || currentScreen === 'signup') && (
            <div key="auth" className="py-20 bg-yellow-100 min-h-[calc(100vh-80px)] flex items-center">
              <Auth 
                initialMode={currentScreen as 'login' | 'signup'} 
                onSuccess={() => navigate('home')} 
              />
            </div>
          )}

          {/* Protected Dashboard Screens */}
          {user && (
            <Dashboard 
              key="dashboard" 
              initialScreen={currentScreen === 'login' || currentScreen === 'signup' ? 'home' : currentScreen} 
            />
          )}

          {/* Fallback for unauthenticated users trying to access protected routes */}
          {!user && currentScreen !== 'home' && currentScreen !== 'login' && currentScreen !== 'signup' && (
            <motion.div 
              key="redirect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center space-y-6"
            >
              <h2 className="text-3xl font-bold text-slate-800">Please Sign In</h2>
              <p className="text-slate-500">You need to be logged in to access this feature.</p>
              <button onClick={() => navigate('login')} className="btn-primary !w-auto px-8">
                Go to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
