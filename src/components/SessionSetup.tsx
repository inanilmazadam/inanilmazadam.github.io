import React from 'react';
import { ShotType } from '../types';
import { 
  X, 
  ChevronRight, 
  CircleDot, 
  Dribbble, 
  Zap, 
  Target,
  Move
} from 'lucide-react';
import { motion } from 'motion/react';

interface SessionSetupProps {
  onCancel: () => void;
  onSelect: (type: ShotType) => void;
}

const SHOT_TYPES: { type: ShotType; label: string; icon: any; desc: string; color: string }[] = [
  { type: '3pt', label: '3-Pointers', icon: Zap, desc: 'Long range accuracy training', color: 'text-purple-500' },
  { type: 'midrange', label: 'Mid-Range', icon: Target, desc: 'Classic jump shot consistency', color: 'text-orange-500' },
  { type: 'freethrow', label: 'Free Throws', icon: CircleDot, desc: 'Static pressure shooting', color: 'text-green-500' },
  { type: 'layup', label: 'Layups', icon: Dribbble, desc: 'Close range finishing', color: 'text-blue-500' },
  { type: 'floater', label: 'Floaters', icon: Move, desc: 'Soft touch over defenders', color: 'text-pink-500' },
];

export default function SessionSetup({ onCancel, onSelect }: SessionSetupProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <header className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Select <span className="text-orange-600">Drill</span></h2>
        <button 
          onClick={onCancel}
          className="p-2 bg-zinc-900 rounded-full border border-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="space-y-4">
        {SHOT_TYPES.map((item, idx) => (
          <motion.button
            key={item.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(item.type)}
            className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex items-center justify-between group hover:border-orange-600/50 transition-all text-left"
          >
            <div className="flex items-center space-x-5">
              <div className={`w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tight">{item.label}</h3>
                <p className="text-xs text-zinc-500 font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-orange-600 transition-colors" />
          </motion.button>
        ))}
      </div>

      <div className="mt-12 p-6 bg-orange-600/10 border border-orange-600/20 rounded-3xl">
        <h4 className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2">Pro Tip</h4>
        <p className="text-sm text-zinc-400 italic font-medium leading-relaxed">
          Ensure your phone is mounted securely and the hoop is clearly visible in the frame for optimal AI tracking accuracy.
        </p>
      </div>
    </div>
  );
}
