import React from 'react';
import { Users, BarChart3, Layout } from 'lucide-react';

export function Home({ onNavigate }: { onNavigate: (view: 'list' | 'reporting') => void }) {
  return (
    <div className="max-w-4xl mx-auto pt-16 px-6">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex p-4 bg-blue-600 rounded-3xl mb-6 shadow-xl shadow-blue-200">
          <Layout className="text-white" size={48} />
        </div>
        <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-4 uppercase italic">
          BRONCO<span className="text-blue-600">PARTS</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-normal">
        <button onClick={() => onNavigate('list')} className="group flex flex-col items-center p-10 bg-white border border-slate-100 rounded-3xl hover:border-blue-500 hover:shadow-2xl transition-all duration-300 active:scale-95">
          <div className="p-5 bg-blue-50 text-blue-600 rounded-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Users size={40} /></div>
          <span className="text-2xl font-bold text-slate-800 mb-2">База клиентов</span>
        </button>
        <button onClick={() => onNavigate('reporting')} className="group flex flex-col items-center p-10 bg-white border border-slate-100 rounded-3xl hover:border-green-500 hover:shadow-2xl transition-all duration-300 active:scale-95">
          <div className="p-5 bg-green-50 text-green-600 rounded-2xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors"><BarChart3 size={40} /></div>
          <span className="text-2xl font-bold text-slate-800 mb-2">Отчетность</span>
        </button>
      </div>
    </div>
  );
}