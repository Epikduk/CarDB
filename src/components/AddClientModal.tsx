import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function AddClientModal({ isOpen, onClose, onAdd, initialData }: any) {
  const [formData, setFormData] = useState({ 
    fullName: '', phone: '', 
    vin: '', brand: '', model: '', year: '', licensePlate: '', carNote: '' 
  });

  useEffect(() => {
    if (initialData) setFormData({ ...formData, ...initialData });
    else setFormData({ fullName: '', phone: '', vin: '', brand: '', model: '', year: '', licensePlate: '', carNote: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onAdd(formData.fullName, formData.phone, formData);
    onClose();
  };

  const labelStyle = "block text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest ml-1";
  const inputStyle = "w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all text-slate-800 font-bold text-xs bg-white shadow-sm";

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[130] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter leading-none">
              {initialData ? 'Редактировать клиента' : 'Новый клиент'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelStyle}>ФИО</label>
                <input required className={inputStyle} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className={labelStyle}>Телефон</label>
                <input className={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              {!initialData && (
                <>
                  <div className="col-span-2 flex items-center gap-3 py-1">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Автомобиль</span>
                    <div className="h-px bg-slate-100 flex-1"></div>
                  </div>
                  <div>
                    <label className={labelStyle}>Марка</label>
                    <input required className={inputStyle} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelStyle}>Модель</label>
                    <input required className={inputStyle} value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelStyle}>VIN Номер</label>
                    <input className={`${inputStyle} uppercase font-mono tracking-tighter`} value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelStyle}>Год выпуска</label>
                    <input className={inputStyle} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelStyle}>Гос. Номер</label>
                    <input className={`${inputStyle} uppercase font-bold tracking-widest`} value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelStyle}>Примечание</label>
                    <textarea className={`${inputStyle} h-16 resize-none font-normal text-[11px]`} value={formData.carNote} onChange={e => setFormData({...formData, carNote: e.target.value})} />
                  </div>
                </>
              )}
            </div>
            <button type="submit" className="w-full bg-slate-950 text-white py-3.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-green-600 transition-all shadow-lg active:scale-95 mt-2">
              Сохранить данные
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}