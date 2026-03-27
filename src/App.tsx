import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from './firebase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SessionSetup from './components/SessionSetup';
import CameraView from './components/CameraView';
import Analytics from './components/Analytics';
import { ShotType } from './types';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'setup' | 'camera' | 'analytics';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedType, setSelectedType] = useState<ShotType | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans selection:bg-orange-600 selection:text-white">
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              onStartSession={() => setCurrentView('setup')} 
              onViewAnalytics={() => setCurrentView('analytics')}
            />
          </motion.div>
        )}

        {currentView === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SessionSetup 
              onCancel={() => setCurrentView('dashboard')}
              onSelect={(type) => {
                setSelectedType(type);
                setCurrentView('camera');
              }}
            />
          </motion.div>
        )}

        {currentView === 'camera' && selectedType && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CameraView 
              type={selectedType}
              onClose={() => {
                setCurrentView('dashboard');
                setSelectedType(null);
              }}
            />
          </motion.div>
        )}

        {currentView === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Analytics onBack={() => setCurrentView('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
