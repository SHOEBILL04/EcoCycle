import React from 'react';
import Scanner from './components/Scanner';
import Dashboard from './components/Dashboard';
import LiveFeed from './components/LiveFeed';
import { Leaf } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-200">
      <nav className="bg-white p-4 shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-2">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-md shadow-emerald-200">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-800">
              Eco<span className="text-emerald-500">Cycle</span>
            </h1>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full border-2 border-white shadow-md overflow-hidden hover:scale-105 transition-transform cursor-pointer">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane&backgroundColor=b6e3f4" alt="Avatar" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <Dashboard />
          </div>
          
          <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0">
            <Scanner />
          </div>
          
          <div className="lg:col-span-4 order-3 lg:order-3">
            <LiveFeed />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
