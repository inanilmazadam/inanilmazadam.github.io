import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Session, ShotType } from '../types';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  BarChart2,
  Calendar,
  Zap,
  Dribbble,
  CircleDot,
  Move,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface AnalyticsProps {
  onBack: () => void;
}

export default function Analytics({ onBack }: AnalyticsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    });

    return () => unsubscribe();
  }, [user]);

  const getStatsByType = (type: ShotType) => {
    const typeSessions = sessions.filter(s => s.type === type);
    const total = typeSessions.reduce((acc, s) => acc + s.totalShots, 0);
    const made = typeSessions.reduce((acc, s) => acc + s.madeShots, 0);
    return {
      total,
      made,
      accuracy: total > 0 ? (made / total) * 100 : 0
    };
  };

  const runAiAnalysis = async () => {
    if (sessions.length === 0) return;
    setIsAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these basketball shooting stats and provide professional coaching advice. 
        User Stats: ${JSON.stringify(sessions.map(s => ({ type: s.type, accuracy: s.accuracy * 100, total: s.totalShots })))}
        Focus on:
        1. Strengths
        2. Weaknesses
        3. Specific drills to improve (e.g. if 3pt is low, suggest midrange first)
        Keep it concise, professional, and encouraging. Use markdown.`,
      });
      
      const response = await model;
      setAiAnalysis(response.text || "Unable to generate analysis.");
    } catch (error) {
      console.error('AI error:', error);
      setAiAnalysis("Failed to connect to AI coach. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const shotTypes: ShotType[] = ['3pt', 'midrange', 'freethrow', 'layup', 'floater'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-12">
      <header className="flex items-center space-x-4 mb-10">
        <button 
          onClick={onBack}
          className="p-2 bg-zinc-900 rounded-full border border-zinc-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Performance <span className="text-orange-600">Report</span></h2>
      </header>

      {/* AI Coach Section */}
      <div className="mb-10">
        <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/10 border border-orange-600/30 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit className="w-24 h-24" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-600 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              AI Performance Coach
            </h3>
            
            {aiAnalysis ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-zinc-300 italic leading-relaxed">
                  <Markdown>{aiAnalysis}</Markdown>
                </div>
                <button 
                  onClick={() => setAiAnalysis(null)}
                  className="mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  Reset Analysis
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400 font-medium italic">
                  Get personalized insights based on your shooting history.
                </p>
                <button
                  onClick={runAiAnalysis}
                  disabled={isAnalyzing || sessions.length === 0}
                  className="bg-orange-600 text-white font-black py-3 px-6 rounded-xl flex items-center space-x-2 disabled:opacity-50 active:scale-95 transition-all uppercase italic text-xs tracking-widest"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Generate Insights</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Breakdown by Shot Type
        </h3>

        <div className="grid gap-4">
          {shotTypes.map((type, idx) => {
            const stats = getStatsByType(type);
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                      {type === '3pt' && <Zap className="w-5 h-5 text-purple-500" />}
                      {type === 'midrange' && <Target className="w-5 h-5 text-orange-500" />}
                      {type === 'freethrow' && <CircleDot className="w-5 h-5 text-green-500" />}
                      {type === 'layup' && <Dribbble className="w-5 h-5 text-blue-500" />}
                      {type === 'floater' && <Move className="w-5 h-5 text-pink-500" />}
                    </div>
                    <div>
                      <h4 className="font-black italic uppercase tracking-tight text-sm">{type}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{stats.total} Total Shots</p>
                    </div>
                  </div>
                  <div className="text-2xl font-black italic text-white">
                    {stats.accuracy.toFixed(0)}%
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.accuracy}%` }}
                    className="h-full bg-orange-600"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
