import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 text-red-600 mb-4"><div className="p-3 bg-red-100 rounded-full"><AlertTriangle size={24} /></div><h2 className="text-xl font-bold text-slate-800">{title}</h2></div>
          <p className="text-slate-600 leading-relaxed font-normal text-sm">{message}</p>
        </div>
        <div className="p-4 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-normal hover:bg-slate-100 active:scale-95 transition-all">Отмена</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95 font-normal">Удалить</button>
        </div>
      </div>
    </div>
  );
}