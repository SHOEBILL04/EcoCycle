import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function LiveFeed() {
  const [feed, setFeed] = useState([
    { id: 1, user: 'John D.', item: 'Cardboard Box', points: 15, time: 'Just now' },
    { id: 2, user: 'Alice M.', item: 'Glass Bottle', points: 30, time: '2m ago' },
    { id: 3, user: 'Karim R.', item: 'Newspaper', points: 10, time: '5m ago' },
  ]);

  const notifications = useAppStore(state => state.notifications);

  useEffect(() => {
    if (notifications.length > 0) {
      const msg = notifications[0];
      setFeed(prev => [
        { id: Date.now(), user: 'You', item: msg, points: '+', time: 'Just now' },
        ...prev.slice(0, 4)
      ]);
    }
  }, [notifications]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 h-full overflow-hidden">
      <h2 className="text-xl font-black text-gray-800 mb-6">Live Activity 👀</h2>
      
      <div className="space-y-4">
        <AnimatePresence>
          {feed.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors cursor-default"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                {item.user.charAt(0)}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-bold text-gray-800">{item.user}</p>
                <p className="text-xs text-gray-500 font-medium">{item.item}</p>
              </div>
              <div className="text-right">
                 <p className="text-emerald-500 font-black text-sm">{item.points} <span className="text-[10px]">pts</span></p>
                 <p className="text-[10px] text-gray-400 font-bold">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
