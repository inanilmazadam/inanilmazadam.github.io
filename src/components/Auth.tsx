import React from 'react';
import { auth, googleProvider, signInWithPopup, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Target, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center space-y-8 max-w-md w-full"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-600/40 rotate-3">
            <Target className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            HoopTrack <span className="text-orange-600">AI</span>
          </h1>
          <p className="text-zinc-400 text-lg font-medium">
            Master your shot with AI-powered analytics and real-time tracking.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <button
            onClick={handleLogin}
            className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
            Professional Grade Shot Tracking
          </p>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 opacity-10">
        <div className="text-8xl font-black italic select-none">ACCURACY</div>
      </div>
      <div className="absolute top-10 right-10 opacity-10">
        <div className="text-8xl font-black italic select-none">PRECISION</div>
      </div>
    </div>
  );
}
