import React, { useState, useMemo } from 'react';
import { ArrowLeft, Download, Calendar, Users, Car as CarIcon } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Car, Client } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ROBOTO_FONT_BASE64 } from '../font';

interface ReportingProps {
  cars: Car[]; clients: Client[]; onBack: () => void;
}

export function Reporting({ cars, clients, onBack }: ReportingProps) {
  const prevMonthDate = subMonths(new Date(), 1);
  const [reportMode, setReportMode] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState(prevMonthDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(prevMonthDate.getFullYear());
  const [customRange, setCustomRange] = useState({ start: format(startOfMonth(prevMonthDate), 'yyyy-MM-dd'), end: format(endOfMonth(prevMonthDate), 'yyyy-MM-dd') });
  const [filterClientId, setFilterClientId] = useState('all');
  const [filterCarId, setFilterCarId] = useState('all');

  const allRecords = useMemo(() => {
    return cars.flatMap(car => car.records.map(r => ({
      ...r, carName: `${car.brand} ${car.model}`, carId: car.id, clientId: car.clientId,
      clientName: clients.find(c => c.id === car.clientId)?.fullName || '—'
    })));
  }, [cars, clients]);

  const filteredData = useMemo(() => {
    const start = reportMode === 'month' ? new Date(selectedYear, selectedMonth, 1) : parseISO(customRange.start);
    const end = reportMode === 'month' ? endOfMonth(start) : parseISO(customRange.end);
    return allRecords.filter(r => {
      const inDate = isWithinInterval(parseISO(r.date), { start, end });
      const clientMatch = filterClientId === 'all' || r.clientId === filterClientId;
      const carMatch = filterCarId === 'all' || r.carId === filterCarId;
      return inDate && clientMatch && carMatch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allRecords, reportMode, selectedMonth, selectedYear, customRange, filterClientId, filterCarId]);

  const totals = useMemo(() => {
    const sale = filteredData.reduce((sum, r) => sum + r.totalPrice, 0);
    const purchase = filteredData.reduce((sum, r) => sum + r.purchasePrice, 0);
    return { sale, purchase, profit: sale - purchase };
  }, [filteredData]);

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const periodText = reportMode === 'month' ? format(new Date(selectedYear, selectedMonth), 'LLLL yyyy', { locale: ru }) : `${format(parseISO(customRange.start), 'dd.MM.yyyy')} - ${format(parseISO(customRange.end), 'dd.MM.yyyy')}`;
      const cleanFont = ROBOTO_FONT_BASE64.replace(/^data:font\/ttf;base64,/, '').replace(/['"()]/g, '').trim();
      if (cleanFont.length > 100) { doc.addFileToVFS('Roboto-Regular.ttf', cleanFont); doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal'); doc.setFont('Roboto', 'normal'); }
      doc.setFontSize(18); doc.text('BRONCOPARTS: ОТЧЕТ ПО ПРОДАЖАМ', 14, 20);
      doc.setFontSize(10); doc.text(`Период: ${periodText.toUpperCase()}`, 14, 28);
      const tableData = filteredData.map(r => [format(parseISO(r.date), 'dd.MM.yy'), r.clientName, r.carName, r.description, r.quantity, `${r.totalPrice.toLocaleString()} RUB`, `${r.purchasePrice.toLocaleString()} RUB`]);
      autoTable(doc, {
        startY: 35, head: [['Дата', 'Клиент', 'Автомобиль', 'Описание', 'Кол-во', 'Итоговая сумма', 'Закупка']], body: tableData, theme: 'grid',
        styles: { font: (cleanFont.length > 200) ? 'Roboto' : 'helvetica', fontSize: 7, fontStyle: 'normal' },
        headStyles: { fillColor: [30, 41, 59], fontStyle: 'normal' },
        foot: [['ИТОГО', '', '', '', '', `${totals.sale.toLocaleString()} RUB`, `${totals.purchase.toLocaleString()} RUB`]],
        footStyles: { fillColor: [241, 245, 249], textColor: [0,0,0], fontStyle: 'normal' }
      });
      const finalY = (doc as any).lastAutoTable.finalY || 60;
      doc.setFontSize(11); doc.text(`Чистая прибыль за период: ${totals.profit.toLocaleString()} RUB`, 14, finalY + 10);
      doc.save(`BroncoParts_Report_${periodText}.pdf`);
    } catch (err) { console.error(err); }
  };

  const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  const availableCars = filterClientId === 'all' ? [] : cars.filter(c => c.clientId === filterClientId);

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-500 font-normal text-slate-700">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors"><ArrowLeft size={18} /> <span>На главную</span></button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Отчетность</h1>
      </div>

      {/* ПАНЕЛЬ ИТОГОВ ПЕРЕМЕЩЕНА НАВЕРХ */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 mb-6 shadow-xl animate-in slide-in-from-top-4 duration-500">
        <div className="flex gap-10">
          <div><p className="text-[9px] text-slate-400 uppercase font-normal mb-1 tracking-widest">Итоговая сумма</p><p className="text-3xl font-black">{totals.sale.toLocaleString()} ₽</p></div>
          <div><p className="text-[9px] text-slate-400 uppercase font-normal mb-1 tracking-widest">Закупка</p><p className="text-3xl font-black text-slate-400">{totals.purchase.toLocaleString()} ₽</p></div>
        </div>
        <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-10">
          <p className="text-[9px] text-slate-400 uppercase font-normal mb-1 tracking-widest">Чистая прибыль</p>
          <p className={`text-5xl font-black tracking-tighter ${totals.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totals.profit.toLocaleString()} ₽</p>
        </div>
      </div>

      {/* ФИЛЬТРЫ */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit mb-4">
        {['month', 'custom'].map((mode) => (
          <button key={mode} onClick={() => setReportMode(mode as any)} className={`px-5 py-2 rounded-lg text-xs transition-all ${reportMode === mode ? 'bg-blue-600 text-white shadow-lg font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
            {mode === 'month' ? 'По месяцам' : 'Произвольный период'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 font-normal">
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-end">
          {reportMode === 'month' ? (
            <>
              <div className="flex-1"><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Месяц</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>{months.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
              </div>
              <div className="w-24"><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Год</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
              </div>
            </>
          ) : (
            <><div className="flex-1"><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">От</label><input type="date" className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm" value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})} /></div>
              <div className="flex-1"><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">До</label><input type="date" className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm" value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})} /></div>
            </>
          )}
        </div>
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-end font-normal">
          <div className="flex-1"><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Клиент</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm" value={filterClientId} onChange={e => { setFilterClientId(e.target.value); setFilterCarId('all'); }}>
              <option value="all">Все клиенты</option>{clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div className="flex-1"><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Машина</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm" value={filterCarId} onChange={e => setFilterCarId(e.target.value)} disabled={filterClientId === 'all'}>
              <option value="all">Все машины</option>{availableCars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
            </select>
          </div>
          <button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9 rounded-lg flex items-center gap-2 font-bold shadow-lg active:scale-95 transition-all text-xs"><Download size={16} /> Скачать PDF</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden font-normal text-slate-700">
        <div className="overflow-auto max-h-[calc(100vh-450px)] bg-white">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b">
              <tr className="text-slate-500 text-[10px] font-normal uppercase tracking-widest border-b"><th className="px-4 py-2">Дата</th><th className="px-4 py-2">Клиент / Автомобиль</th><th className="px-4 py-2">Описание</th><th className="px-4 py-2 text-center">Количество</th><th className="px-4 py-2 text-right">Итоговая сумма</th><th className="px-4 py-2 text-right">Закупка</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] font-normal text-slate-700">
              {filteredData.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors font-normal">
                  <td className="px-4 py-1 text-slate-500 font-normal whitespace-nowrap">{format(parseISO(r.date), 'dd.MM.yyyy')}</td>
                  <td className="px-4 py-1 leading-tight font-normal text-slate-800"><div className="uppercase text-[10px]">{r.clientName}</div><div className="text-[10px] text-slate-400 font-normal">{r.carName}</div></td>
                  <td className="px-4 py-1">{r.description}</td><td className="px-4 py-1 text-center">{r.quantity}</td>
                  <td className="px-4 py-1 text-right text-slate-900 font-normal">{r.totalPrice.toLocaleString()} ₽</td>
                  <td className="px-4 py-1 text-right text-slate-900 font-normal">{r.purchasePrice.toLocaleString()} ₽</td>
                </tr>
              ))}
              {filteredData.length === 0 && (<tr><td colSpan={6} className="py-20 text-center text-slate-400 italic font-normal bg-white">Записей не найдено</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}