import React, { useState } from 'react';
import { X, Plus, Trash2, ClipboardList } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, options, onUpdate }: any) {
  const [newOption, setNewOption] = useState('');
  if (!isOpen) return null;

  const labelStyle = "block text-[11px] font-black text-slate-400 uppercase mb-1.5 tracking-[0.1em] ml-1";
  const inputStyle = "flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:border-green-500 outline-none font-bold text-[14px] shadow-sm";

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200 text-left">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-white/20">
        <div className="flex items-center p-6 border-b bg-slate-50/50">
          <div className="p-2 bg-slate-100 text-slate-900 rounded-lg mr-4">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">Варианты</h2>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 text-slate-300 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all"><X size={22} /></button>
        </div>
        
        <div className="p-6">
          <div className="animate-in slide-in-from-right-4 duration-300">
            <label className={labelStyle}>Добавить новый вариант</label>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                autoFocus 
                className={inputStyle} 
                placeholder="Текст..." 
                value={newOption} 
                onChange={(e) => setNewOption(e.target.value)} 
                onKeyDown={(e) => {if(e.key==='Enter' && newOption.trim()){ onUpdate([...options, newOption.trim()]); setNewOption(''); }}} 
              />
              <button 
                onClick={() => {if(newOption.trim()){ onUpdate([...options, newOption.trim()]); setNewOption(''); }}} 
                className="bg-slate-950 text-white p-2.5 rounded-xl hover:bg-green-600 transition-all shadow-lg active:scale-95"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <label className={labelStyle}>Список вариантов</label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {[...options].sort((a, b) => a.localeCompare(b)).map((opt: string, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100/50 group hover:border-slate-200 transition-all">
                  <span className="text-slate-700 font-bold text-[13px] italic">{opt}</span>
                  <button onClick={() => onUpdate(options.filter((_:any, index:number) => index !== i))} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {options.length === 0 && (
                <p className="text-center py-4 text-slate-300 text-[10px] font-bold uppercase italic font-sans leading-none">Список пуст</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}