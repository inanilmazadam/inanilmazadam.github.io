import React, { useState, useRef, useEffect } from 'react';
import { ShotType, Shot } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { 
  X, 
  Camera, 
  Check, 
  XCircle, 
  RefreshCcw, 
  Target,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface CameraViewProps {
  type: ShotType;
  onClose: () => void;
}

export default function CameraView({ type, onClose }: CameraViewProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastShotResult, setLastShotResult] = useState<'made' | 'missed' | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const user = auth.currentUser;

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      try {
        const newSessionId = Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'sessions', newSessionId), {
          id: newSessionId,
          userId: user.uid,
          type,
          totalShots: 0,
          madeShots: 0,
          accuracy: 0,
          timestamp: new Date().toISOString(),
        });
        setSessionId(newSessionId);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'sessions');
      }
    };
    initSession();
  }, [user, type]);

  // Start Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        setCameraError(null);
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (error: any) {
        console.error('Camera error:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.message?.includes('Permission dismissed')) {
          setCameraError('Camera access denied. Please enable camera permissions in your browser settings to use the tracking feature.');
        } else {
          setCameraError('Unable to access camera. Please ensure no other app is using it.');
        }
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const recordShot = async (isMade: boolean) => {
    if (!sessionId || !user) return;

    const newShot: Shot = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId,
      userId: user.uid,
      isMade,
      location: { x: 0.5, y: 0.5 }, // Simulated location
      timestamp: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, `sessions/${sessionId}/shots`), newShot);
      
      const updatedShots = [...shots, newShot];
      setShots(updatedShots);
      setLastShotResult(isMade ? 'made' : 'missed');
      
      // Update Session Stats
      const madeCount = updatedShots.filter(s => s.isMade).length;
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        totalShots: updatedShots.length,
        madeShots: madeCount,
        accuracy: madeCount / updatedShots.length
      });

      // Clear result after 1s
      setTimeout(() => setLastShotResult(null), 1000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `sessions/${sessionId}/shots`);
    }
  };

  const currentAccuracy = shots.length > 0 
    ? (shots.filter(s => s.isMade).length / shots.length) * 100 
    : 0;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col">
      {/* Camera Feed */}
      <div className="relative flex-1 bg-zinc-900">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black italic uppercase tracking-tight">Camera Error</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                {cameraError}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        
        {/* Overlay UI */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanning Effect */}
          <div className="absolute inset-0 border-[20px] border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-orange-600/30 rounded-full animate-pulse" />
          
          {/* Corner Accents */}
          <div className="absolute top-10 left-10 w-8 h-8 border-t-4 border-l-4 border-orange-600" />
          <div className="absolute top-10 right-10 w-8 h-8 border-t-4 border-r-4 border-orange-600" />
          <div className="absolute bottom-10 left-10 w-8 h-8 border-b-4 border-l-4 border-orange-600" />
          <div className="absolute bottom-10 right-10 w-8 h-8 border-b-4 border-r-4 border-orange-600" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-orange-600 rounded-full text-[10px] font-black uppercase italic tracking-widest animate-pulse">
              Live Tracking
            </div>
            <div className="text-sm font-black italic uppercase tracking-tighter">
              {type} <span className="text-zinc-400">Drill</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shot Result Animation */}
        <AnimatePresence>
          {lastShotResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className={`text-8xl font-black italic uppercase tracking-tighter ${lastShotResult === 'made' ? 'text-green-500' : 'text-red-500'}`}>
                {lastShotResult === 'made' ? 'BUCKET' : 'MISS'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats HUD */}
        <div className="absolute bottom-32 left-6 right-6 flex items-end justify-between pointer-events-none">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Accuracy</p>
            <p className="text-5xl font-black italic text-orange-600">{currentAccuracy.toFixed(0)}%</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Shots</p>
            <p className="text-5xl font-black italic">{shots.length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-32 bg-[#0a0a0a] border-t border-zinc-800 p-6 flex items-center justify-center space-x-8">
        <button
          onClick={() => recordShot(false)}
          className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-red-500 active:scale-90 transition-all"
        >
          <XCircle className="w-8 h-8" />
        </button>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-orange-600/20 blur-xl rounded-full animate-pulse" />
          <button
            className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-600/40 relative z-10"
          >
            <Camera className="w-10 h-10 text-white" />
          </button>
        </div>

        <button
          onClick={() => recordShot(true)}
          className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-green-500 active:scale-90 transition-all"
        >
          <Check className="w-8 h-8" />
        </button>
      </div>

      {/* AI Helper Hint */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-2 pointer-events-none">
        <Info className="w-3 h-3 text-orange-600" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Tap buttons to log shots manually for high precision
        </span>
      </div>
    </div>
  );
}
