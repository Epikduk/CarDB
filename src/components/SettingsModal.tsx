import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronRight, ArrowLeft, ClipboardList } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, options, onUpdate }: any) {
  const [activeView, setActiveView] = useState('menu');
  const [newOption, setNewOption] = useState('');
  if (!isOpen) return null;
  const handleClose = () => { setActiveView('menu'); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in font-normal text-slate-700">
        <div className="flex items-center p-6 border-b bg-slate-50">
          {activeView !== 'menu' && (
            <button onClick={() => setActiveView('menu')} className="mr-4 p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500 font-normal"><ArrowLeft size={20} /></button>
          )}
          <h2 className="text-xl font-bold text-slate-800">{activeView === 'menu' ? 'Настройки' : 'Варианты примечаний'}</h2>
          <button onClick={handleClose} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-6 min-h-[250px] font-normal text-slate-700">
          {activeView === 'menu' ? (
            <button onClick={() => setActiveView('notes')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group font-normal text-left">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors font-normal"><ClipboardList size={20} /></div>
                <div><div className="font-bold text-slate-800">Примечания</div><div className="text-xs text-slate-500">Список для таблицы истории</div></div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500" />
            </button>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300 font-normal">
              <div className="flex gap-2 mb-6">
                <input type="text" autoFocus className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Добавить вариант..." value={newOption} onChange={(e) => setNewOption(e.target.value)} onKeyDown={(e) => {if(e.key==='Enter' && newOption.trim()){ onUpdate([...options, newOption.trim()]); setNewOption(''); }}} />
                <button onClick={() => {if(newOption.trim()){ onUpdate([...options, newOption.trim()]); setNewOption(''); }}} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors font-normal"><Plus size={24} /></button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 font-normal">
                {options.map((opt: string, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 font-normal"><span className="text-slate-700 font-normal">{opt}</span><button onClick={() => onUpdate(options.filter((_:any, index:number) => index !== i))} className="text-slate-300 hover:text-red-500 transition-colors font-normal"><Trash2 size={18} /></button></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}