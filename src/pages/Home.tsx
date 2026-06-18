import React from 'react';
import { Users, BarChart3, Package, Wallet } from 'lucide-react';
import logo from '../logo.png';

export function Home({ onNavigate }: { onNavigate: (view: 'list' | 'reporting' | 'warehouse' | 'cashier') => void }) {
  return (
    <div className="max-w-6xl mx-auto pt-16 px-6 font-sans">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* КНОПКА: БАЗА КЛИЕНТОВ */}
        <button 
          onClick={() => onNavigate('list')} 
          className="group flex flex-col items-center p-8 bg-white border border-slate-200 rounded-[2.5rem] transition-all duration-300 active:scale-95 hover:border-green-500 hover:shadow-[0_20px_40px_rgba(34,197,94,0.1)]"
        >
          <div className="p-6 bg-slate-50 text-slate-400 rounded-2xl mb-6 group-hover:bg-green-50 group-hover:text-green-600 transition-all duration-300 shadow-inner leading-none">
            <Users size={40} />
          </div>
          <span className="text-xl font-black text-slate-900 uppercase italic leading-none group-hover:text-green-600 transition-colors">База клиентов</span>
        </button>

        {/* КНОПКА: СКЛАД */}
        <button 
          onClick={() => onNavigate('warehouse')} 
          className="group flex flex-col items-center p-8 bg-white border border-slate-200 rounded-[2.5rem] transition-all duration-300 active:scale-95 hover:border-green-500 hover:shadow-[0_20px_40px_rgba(34,197,94,0.1)]"
        >
          <div className="p-6 bg-slate-50 text-slate-400 rounded-2xl mb-6 group-hover:bg-green-50 group-hover:text-green-600 transition-all duration-300 shadow-inner leading-none">
            <Package size={40} />
          </div>
          <span className="text-xl font-black text-slate-900 uppercase italic leading-none group-hover:text-green-600 transition-colors">Склад</span>
        </button>

        {/* КНОПКА: КАССА */}
        <button 
          onClick={() => onNavigate('cashier')} 
          className="group flex flex-col items-center p-8 bg-white border border-slate-200 rounded-[2.5rem] transition-all duration-300 active:scale-95 hover:border-green-500 hover:shadow-[0_20px_40px_rgba(34,197,94,0.1)]"
        >
          <div className="p-6 bg-slate-50 text-slate-400 rounded-2xl mb-6 group-hover:bg-green-50 group-hover:text-green-600 transition-all duration-300 shadow-inner leading-none">
            <Wallet size={40} />
          </div>
          <span className="text-xl font-black text-slate-900 uppercase italic leading-none group-hover:text-green-600 transition-colors">Касса</span>
        </button>

        {/* КНОПКА: ОТЧЕТНОСТЬ */}
        <button 
          onClick={() => onNavigate('reporting')} 
          className="group flex flex-col items-center p-8 bg-white border border-slate-200 rounded-[2.5rem] transition-all duration-300 active:scale-95 hover:border-green-500 hover:shadow-[0_20px_40px_rgba(34,197,94,0.1)]"
        >
          <div className="p-6 bg-slate-50 text-slate-400 rounded-2xl mb-6 group-hover:bg-green-50 group-hover:text-green-600 transition-all duration-300 shadow-inner leading-none">
            <BarChart3 size={40} />
          </div>
          <span className="text-xl font-black text-slate-900 uppercase italic leading-none group-hover:text-green-600 transition-colors">Отчетность</span>
        </button>
      </div>
    </div>
  );
}