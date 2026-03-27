import React, { useState, useEffect } from 'react';
import { auth, db, signOut } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Session, ShotType } from '../types';
import { 
  Plus, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Target, 
  History,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onStartSession: () => void;
  onViewAnalytics: () => void;
}

export default function Dashboard({ onStartSession, onViewAnalytics }: DashboardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Session[];
      setSessions(sessionData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalShots = sessions.reduce((acc, s) => acc + s.totalShots, 0);
  const totalMade = sessions.reduce((acc, s) => acc + s.madeShots, 0);
  const avgAccuracy = totalShots > 0 ? (totalMade / totalShots) * 100 : 0;

  const getAccuracyColor = (acc: number) => {
    if (acc >= 70) return 'text-green-500';
    if (acc >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.photoURL || ''} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border border-zinc-800"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-sm text-zinc-500 font-bold uppercase tracking-wider">Welcome back</h2>
            <p className="font-black italic uppercase tracking-tight">{user?.displayName?.split(' ')[0]}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-5 h-5 text-zinc-400" />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Accuracy</span>
          </div>
          <div className={`text-3xl font-black italic ${getAccuracyColor(avgAccuracy)}`}>
            {avgAccuracy.toFixed(1)}%
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Shots</span>
          </div>
          <div className="text-3xl font-black italic text-white">
            {totalShots}
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Sessions
          </h3>
          <button 
            onClick={onViewAnalytics}
            className="text-[10px] font-bold text-orange-600 uppercase tracking-widest hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="h-20 bg-zinc-900/30 rounded-2xl animate-pulse" />
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
              <p className="text-zinc-500 text-sm font-medium italic">No sessions recorded yet.</p>
            </div>
          ) : (
            sessions.slice(0, 3).map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group hover:border-orange-600/50 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-orange-600 italic">
                    {session.type.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">
                      {session.madeShots}/{session.totalShots} Made
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-xl font-black italic ${getAccuracyColor(session.accuracy * 100)}`}>
                  {(session.accuracy * 100).toFixed(0)}%
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
        <div className="max-w-md mx-auto flex gap-4">
          <button
            onClick={onStartSession}
            className="flex-1 bg-orange-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 shadow-2xl shadow-orange-600/30 active:scale-95 transition-all uppercase italic tracking-tight"
          >
            <Plus className="w-6 h-6" />
            <span>New Session</span>
          </button>
          <button
            onClick={onViewAnalytics}
            className="w-16 bg-zinc-900 border border-zinc-800 text-white rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95"
          >
            <BarChart3 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
