import React from 'react';
import { Users, BarChart3 } from 'lucide-react';
import logo from '../logo.png';

export function Home({ onNavigate }: { onNavigate: (view: 'list' | 'reporting') => void }) {
  return (
    <div className="max-w-4xl mx-auto pt-16 px-6 font-sans">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <img 
          src={logo} 
          alt="L" 
          className="w-32 h-32 object-contain mx-auto mb-6 transition-transform hover:scale-110 duration-500 
                     drop-shadow-[0_12px_8px_rgba(0,0,0,1)] 
                     drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)]" 
        />
        <h1 className="text-5xl font-black tracking-tight mb-4 uppercase italic leading-none">
          <span className="text-black">BRONCOM</span>
          <span className="text-green-600">PARTS</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-[0.2em] text-xs uppercase leading-none">Система управления базой данных</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button onClick={() => onNavigate('list')} className="group flex flex-col items-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-green-500 hover:shadow-2xl transition-all duration-300 active:scale-95">
          <div className="p-6 bg-slate-50 text-black rounded-2xl mb-6 group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-inner leading-none">
            <Users size={48} />
          </div>
          <span className="text-2xl font-black text-slate-900 uppercase italic leading-none">База клиентов</span>
        </button>
        <button onClick={() => onNavigate('reporting')} className="group flex flex-col items-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-green-500 hover:shadow-2xl transition-all duration-300 active:scale-95">
          <div className="p-6 bg-slate-50 text-green-600 rounded-2xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-inner leading-none">
            <BarChart3 size={48} />
          </div>
          <span className="text-2xl font-black text-slate-900 uppercase italic leading-none">Отчетность</span>
        </button>
      </div>
    </div>
  );
}