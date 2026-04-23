import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronRight, ArrowLeft, ClipboardList } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: string[];
  onUpdate: (newOptions: string[]) => void;
}

type SettingsView = 'menu' | 'notes';

export function SettingsModal({ isOpen, onClose, options, onUpdate }: SettingsModalProps) {
  const [activeView, setActiveView] = useState<SettingsView>('menu');
  const [newOption, setNewOption] = useState('');

  if (!isOpen) return null;

  const handleAddNote = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      onUpdate([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleDeleteNote = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const handleClose = () => {
    setActiveView('menu');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        
        <div className="flex items-center p-6 border-b bg-slate-50">
          {activeView !== 'menu' && (
            <button onClick={() => setActiveView('menu')} className="mr-4 p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-slate-800">
            {activeView === 'menu' ? 'Настройки' : 'Варианты примечаний'}
          </h2>
          <button onClick={handleClose} className="ml-auto text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 min-h-[250px]">
          {activeView === 'menu' ? (
            <div className="space-y-3">
              <button 
                onClick={() => setActiveView('notes')}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ClipboardList size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">Примечания</div>
                    <div className="text-xs text-slate-500">Управление выпадающим списком в таблице</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" autoFocus className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Добавить вариант..."
                  value={newOption} onChange={(e) => setNewOption(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button onClick={handleAddNote} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus size={24} /></button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {options.map((opt, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-700 font-medium">{opt}</span>
                    <button onClick={() => handleDeleteNote(i)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
                {options.length === 0 && <p className="text-center py-8 text-slate-400 text-sm italic">Список пуст</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}