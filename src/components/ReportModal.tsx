import React, { useState, useMemo } from 'react';
import { X, FileText, Download, Calendar } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { MaintenanceRecord, Car, Client } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MaintenanceRecord[];
  car: Car;
  client: Client;
}

export function ReportModal({ isOpen, onClose, records, car, client }: ReportModalProps) {
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-01'), // Начало текущего месяца
    end: format(new Date(), 'yyyy-MM-dd')    // Сегодня
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      isWithinInterval(parseISO(r.date), {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end)
      })
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, dateRange]);

  const totals = useMemo(() => {
    const sale = filteredRecords.reduce((sum, r) => sum + r.totalPrice, 0);
    const purchase = filteredRecords.reduce((sum, r) => sum + r.purchasePrice, 0);
    return { sale, purchase, profit: sale - purchase };
  }, [filteredRecords]);

  if (!isOpen) return null;

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // ВАЖНО: Для поддержки русского языка в PDF в идеале нужен кастомный шрифт.
    // jsPDF по умолчанию не поддерживает кириллицу. 
    // В данном примере мы используем стандартный шрифт, но для полноценного 
    // русского текста на разных ПК рекомендуется встраивание .ttf шрифта.
    
    doc.setFontSize(18);
    doc.text(`BroncoParts Report: ${car.brand} ${car.model}`, 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Owner: ${client.fullName}`, 14, 30);
    doc.text(`VIN: ${car.vin}`, 14, 35);
    doc.text(`Period: ${format(parseISO(dateRange.start), 'dd.MM.yyyy')} - ${format(parseISO(dateRange.end), 'dd.MM.yyyy')}`, 14, 40);

    const tableData = filteredRecords.map(r => [
      format(parseISO(r.date), 'dd.MM.yy'),
      r.description,
      r.quantity,
      `${r.totalPrice.toLocaleString()} RUB`,
      `${r.purchasePrice.toLocaleString()} RUB`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Description', 'Qty', 'Sale', 'Purchase']],
      body: tableData,
      foot: [[
        'TOTAL', 
        '', 
        '', 
        `${totals.sale.toLocaleString()} RUB`, 
        `${totals.purchase.toLocaleString()} RUB`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.text(`Total Profit: ${totals.profit.toLocaleString()} RUB`, 14, finalY + 10);

    doc.save(`BroncoParts_Report_${car.brand}_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={24} /></div>
            <h2 className="text-xl font-bold text-slate-800">Отчет по обслуживанию</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={28} /></button>
        </div>

        <div className="p-6">
          {/* Выбор дат */}
          <div className="flex flex-wrap items-end gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Начало периода</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Конец периода</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
              </div>
            </div>
            <button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95">
              <Download size={18} /> Скачать PDF
            </button>
          </div>

          {/* Превью таблицы */}
          <div className="border rounded-xl overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0">
                  <tr className="text-slate-500 text-[10px] font-bold uppercase">
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Описание</th>
                    <th className="px-4 py-2 text-right">Продажа</th>
                    <th className="px-4 py-2 text-right">Закупка</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-500">{format(parseISO(r.date), 'dd.MM.yy')}</td>
                      <td className="px-4 py-2 text-slate-800">{r.description}</td>
                      <td className="px-4 py-2 text-right font-medium">{r.totalPrice.toLocaleString()} ₽</td>
                      <td className="px-4 py-2 text-right text-slate-500">{r.purchasePrice.toLocaleString()} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Итоги в превью */}
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center mt-auto">
              <div className="flex gap-8">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Итого продажа</div>
                  <div className="text-lg font-bold">{totals.sale.toLocaleString()} ₽</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Итого закупка</div>
                  <div className="text-lg font-bold text-slate-300">{totals.purchase.toLocaleString()} ₽</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Общая прибыль</div>
                <div className="text-2xl font-black text-green-400">{totals.profit.toLocaleString()} ₽</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}