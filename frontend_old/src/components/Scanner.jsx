import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [result, setResult] = useState(null);
  const addPoints = useAppStore(state => state.addPoints);
  const addNotification = useAppStore(state => state.addNotification);

  const handleScan = () => {
    setScanning(true);
    setConfidence(0);
    setResult(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 8;
      if (progress >= 100) {
        clearInterval(interval);
        setConfidence(92);
        setScanning(false);
        setResult('Category: PLASTIC (PET Bottle)');
        addPoints(50);
        addNotification('Earned 50 pts for Pet Bottle!');
      } else {
        setConfidence(progress);
      }
    }, 200);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md mx-auto hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow border border-emerald-50">
      <h2 className="text-2xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
        AI Waste Scanner
      </h2>
      
      <div 
        className={`relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden ${scanning ? 'border-emerald-400 bg-emerald-50/50' : result ? 'border-teal-400 bg-teal-50/30' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 cursor-pointer'}`}
        onClick={!scanning ? handleScan : undefined}
      >
        {scanning ? (
          <div className="relative w-full h-full flex items-center justify-center rounded-xl">
             <motion.div 
                initial={{ top: '-10%' }}
                animate={{ top: ['-10%', '110%', '-10%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_15px_3px_#34d399]"
             />
             <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-emerald-600 font-bold z-10 tracking-widest text-sm"
             >
                ANALYZING MATERIAL
             </motion.p>
          </div>
        ) : result ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <CheckCircle className="w-16 h-16 text-teal-500 mb-3 drop-shadow-md" />
            <p className="font-extrabold text-gray-800 tracking-tight">{result}</p>
            <p className="text-sm font-semibold text-emerald-600 mt-1">+50 Points Rewarded!</p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
             <div className="p-4 bg-emerald-50 rounded-full mb-3 text-emerald-500">
                <UploadCloud className="w-8 h-8" />
             </div>
             <p className="text-gray-600 font-medium">Tap to scan waste item</p>
             <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm font-bold text-gray-700">
          <span>AI Confidence Level</span>
          <span className={confidence > 85 ? 'text-emerald-600' : 'text-amber-500'}>{confidence}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div 
             className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 h-full rounded-full relative"
             initial={{ width: 0 }}
             animate={{ width: `${confidence}%` }}
             transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
