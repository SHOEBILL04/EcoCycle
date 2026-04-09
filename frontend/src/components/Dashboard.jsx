import React from 'react';
import { Trophy, Flame } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Dashboard() {
  const { user, clan } = useAppStore();

  const rivalPoints = 42000;
  const myPoints = clan.points;
  const total = myPoints + rivalPoints;
  const percentage = (myPoints / total) * 100;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clan War</h2>
          <p className="text-sm text-gray-500 font-medium">Season 4 • Ends in 12 days</p>
        </div>
        <div className="bg-amber-100 p-3 rounded-2xl">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-emerald-600 flex items-center tracking-tight">
             <Flame className="w-4 h-4 mr-1 text-emerald-500" /> {clan.name}
          </span>
          <span className="font-bold text-rose-500 tracking-tight">Mirpur Mutants</span>
        </div>
        
        <div className="w-full h-8 bg-rose-500 rounded-full flex overflow-hidden shadow-inner relative">
          <div 
             className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out flex items-center"
             style={{ width: `${percentage}%` }}
          >
             <span className="text-white text-xs font-black ml-3 shadow-sm">{myPoints.toLocaleString()}</span>
          </div>
          <div className="absolute right-3 top-0 h-full flex items-center">
             <span className="text-white text-xs font-black shadow-sm">{rivalPoints.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 flex justify-between items-center rounded-2xl p-4 border border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors cursor-pointer">
         <div>
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Stats</h3>
           <p className="text-gray-800 font-black text-lg leading-tight">{user.name}</p>
           <p className="text-emerald-600 font-bold text-xs">{user.title}</p>
         </div>
         <div className="text-right">
           <p className="text-3xl font-black text-gray-800">{user.points}</p>
           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Points</p>
         </div>
      </div>
    </div>
  );
}
