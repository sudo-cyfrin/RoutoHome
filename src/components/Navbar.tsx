import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Menu, X, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useLogo } from '../hooks/useLogo';

interface NavbarProps {
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

export default function Navbar({ onNavigate, currentScreen }: NavbarProps) {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = React.useState(false);
  const { logo } = useLogo();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'transport', label: 'Transport' },
    { id: 'risk', label: 'Risk Analysis' },
    { id: 'helpline', label: 'Helplines' },
  ];

  return (
    <nav className="bg-yellow-100/80 backdrop-blur-md border-b border-yellow-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 md:h-24">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center group"
            >
              <img 
                src="/public/logo.png"  
                alt="RoutoHome Logo" 
                className="h-12 sm:h-16 md:h-20 w-auto object-contain group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-link ${currentScreen === item.id ? 'text-primary after:w-full' : ''}`}
              >
                {item.label}
              </button>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</p>
                  <p className="font-bold text-slate-800 text-sm">{user.displayName || user.email?.split('@')[0]}</p>
                </div>
                <button 
                  onClick={() => auth.signOut()}
                  className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="btn-primary !w-auto px-8 py-2.5 text-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-secondary/50 hover:text-primary transition-all"
                >
                  {item.label}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsOpen(false);
                  }}
                  className="btn-primary mt-4"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
