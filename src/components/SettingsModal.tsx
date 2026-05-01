import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronRight, ArrowLeft, ClipboardList } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, options, onUpdate }: any) {
  const [activeView, setActiveView] = useState('menu');
  const [newOption, setNewOption] = useState('');
  if (!isOpen) return null;
  const handleClose = () => { setActiveView('menu'); onClose(); };

  const inputStyle = "flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:border-green-500 outline-none font-bold text-[14px] shadow-sm";

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200 text-left">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-white/20">
        <div className="flex items-center p-6 border-b bg-slate-50/50">
          {activeView !== 'menu' && (
            <button onClick={() => setActiveView('menu')} className="mr-3 p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><ArrowLeft size={18} /></button>
          )}
          <h2 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">
            {activeView === 'menu' ? 'Настройки' : 'Варианты'}
          </h2>
          <button onClick={handleClose} className="ml-auto p-1.5 text-slate-300 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all"><X size={22} /></button>
        </div>
        <div className="p-6 min-h-[250px] max-h-[70vh] overflow-y-auto">
          {activeView === 'menu' ? (
            <button onClick={() => setActiveView('notes')} className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-green-500 hover:shadow-xl transition-all group text-left shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-900 rounded-xl group-hover:bg-slate-950 group-hover:text-white transition-colors">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <div className="font-black text-slate-900 uppercase italic tracking-tight text-sm">Примечания</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Список для истории</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-green-500" />
            </button>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex gap-2 mb-4">
                <input type="text" autoFocus className={inputStyle} placeholder="Новый вариант..." value={newOption} onChange={(e) => setNewOption(e.target.value)} onKeyDown={(e) => {if(e.key==='Enter' && newOption.trim()){ onUpdate([...options, newOption.trim()]); setNewOption(''); }}} />
                <button onClick={() => {if(newOption.trim()){ onUpdate([...options, newOption.trim()]); setNewOption(''); }}} className="bg-slate-950 text-white p-2.5 rounded-xl hover:bg-green-600 transition-all"><Plus size={20} /></button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {options.map((opt: string, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100/50 group">
                    <span className="text-slate-700 font-bold text-[13px] italic">{opt}</span>
                    <button onClick={() => onUpdate(options.filter((_:any, index:number) => index !== i))} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}