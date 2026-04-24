import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-[320px] overflow-hidden animate-in zoom-in duration-200 border border-white/20">
        <div className="p-6 text-center">
          <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-2xl mb-4">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-lg font-black text-slate-950 uppercase italic mb-2 tracking-tighter">{title}</h2>
          <p className="text-slate-400 leading-snug text-[13px] font-bold px-2">{message}</p>
        </div>
        <div className="p-4 bg-slate-50/50 flex gap-2 border-t border-slate-50">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-100 active:scale-95 transition-all">Отмена</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95">Удалить</button>
        </div>
      </div>
    </div>
  );
}