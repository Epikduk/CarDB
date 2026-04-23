import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (fullName: string, phone: string, vin: string, brand: string, model: string) => void;
}

export function AddClientModal({ isOpen, onClose, onAdd }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    vin: '',
    brand: '',
    model: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData.fullName, formData.phone, formData.vin, formData.brand, formData.model);
    setFormData({ fullName: '', phone: '', vin: '', brand: '', model: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">Новый клиент и автомобиль</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">ФИО Клиента</label>
              <input required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
              <input required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">VIN Номер</label>
              <input required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono" 
                value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Марка</label>
              <input required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Модель</label>
              <input required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
