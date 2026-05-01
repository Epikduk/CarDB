import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200 text-center">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-[340px] overflow-hidden animate-in zoom-in duration-200 border border-white/20">
        <div className="p-8">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-[1.5rem] mb-5">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-950 uppercase italic mb-3 tracking-tighter leading-none">{title}</h2>
          <p className="text-slate-500 leading-relaxed text-[14px] font-bold px-2">{message}</p>
        </div>
        <div className="p-4 bg-slate-50/50 flex gap-3 border-t border-slate-50">
          <button onClick={onClose} className="flex-1 px-4 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 active:scale-95 transition-all">Отмена</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-3.5 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95">Удалить</button>
        </div>
      </div>
    </div>
  );
}