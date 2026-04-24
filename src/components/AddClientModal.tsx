import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function AddClientModal({ isOpen, onClose, onAdd, initialData }: any) {
  const [formData, setFormData] = useState({ fullName: '', phone: '' });

  useEffect(() => {
    if (initialData) setFormData({ fullName: initialData.fullName, phone: initialData.phone });
    else setFormData({ fullName: '', phone: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onAdd(formData.fullName, formData.phone);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[130] p-4 font-normal">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Редактировать клиента' : 'Новый клиент'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-normal text-slate-400 uppercase mb-1 tracking-widest">ФИО Клиента</label>
              <input required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-normal text-slate-400 uppercase mb-1 tracking-widest">Телефон</label>
              <input required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] mt-4">
            Сохранить клиента
          </button>
        </form>
      </div>
    </div>
  );
}