import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Car, Client } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ROBOTO_FONT_BASE64 } from '../font';
import { CustomSelect } from '../components/CustomSelect';

export function Reporting({ cars, clients, onBack }: any) {
  const prevMonthDate = subMonths(new Date(), 1);
  const [reportMode, setReportMode] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customRange, setCustomRange] = useState({ 
    start: format(startOfMonth(prevMonthDate), 'yyyy-MM-dd'), 
    end: format(endOfMonth(prevMonthDate), 'yyyy-MM-dd') 
  });
  const [filterClientId, setFilterClientId] = useState('all');
  const [filterCarId, setFilterCarId] = useState('all');

  const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const years = Array.from({length: 5}, (_, i) => (new Date().getFullYear() - i).toString());

  const allRecords = useMemo(() => {
    // В отчетность попадают ТОЛЬКО записи со статусом 2 (Выполнено)
    return cars.flatMap(car => car.records.filter((r: any) => r.status === 2).map(r => ({
      ...r, carName: `${car.brand} ${car.model}`, carId: car.id, clientId: car.clientId,
      clientName: clients.find((c: any) => c.id === car.clientId)?.fullName || '—'
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
      const cleanFont = ROBOTO_FONT_BASE64.replace(/^data:font\/ttf;base64,/, '').replace(/['"()]/g, '').trim();
      doc.addFileToVFS('Roboto-Regular.ttf', cleanFont);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(18);
      doc.text('BRONCOMPARTS: ОТЧЕТ ПО ПРОДАЖАМ', 14, 20);
      const tableData = filteredData.map(r => [format(parseISO(r.date), 'dd.MM.yy'), r.clientName, r.carName, r.description, r.quantity, `${r.totalPrice.toLocaleString()} RUB`, `${r.purchasePrice.toLocaleString()} RUB`]);
      autoTable(doc, {
        startY: 35,
        head: [['Дата', 'Клиент', 'Автомобиль', 'Описание', 'Количество', 'Итоговая сумма', 'Закупка']],
        body: tableData,
        theme: 'grid',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 7 },
        headStyles: { fillColor: [0, 0, 0], font: 'Roboto', fontStyle: 'normal' },
        foot: [['ИТОГО', '', '', '', '', `${totals.sale.toLocaleString()} RUB`, `${totals.purchase.toLocaleString()} RUB`]],
        footStyles: { fillColor: [241, 245, 249], textColor: [0,0,0], font: 'Roboto', fontStyle: 'normal' }
      });
      doc.save(`Report_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
    } catch (err) { console.error(err); }
  };

  const selectedClientName = filterClientId === 'all' ? 'Все клиенты' : clients.find((c:any) => c.id === filterClientId)?.fullName;
  const availableCars = filterClientId === 'all' ? [] : cars.filter((c:any) => c.clientId === filterClientId);
  const selectedCar = availableCars.find((c:any) => c.id === filterCarId);
  const selectedCarName = filterCarId === 'all' ? 'Все авто' : (selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'Все авто');

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 text-left flex justify-between items-center">
        <h1 className="text-3xl font-black text-black uppercase tracking-tight italic">Отчетность</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">Только завершенные сделки</p>
      </div>

      <div className="p-8 bg-black text-white rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="flex gap-12 relative z-10">
          <div><p className="text-[10px] text-slate-400 uppercase font-black mb-1">Итоговая сумма</p><p className="text-3xl font-black whitespace-nowrap">{totals.sale.toLocaleString()} ₽</p></div>
          <div><p className="text-[10px] text-slate-400 uppercase font-black mb-1">Закупка</p><p className="text-3xl font-black text-slate-600 whitespace-nowrap">{totals.purchase.toLocaleString()} ₽</p></div>
        </div>
        <div className="text-right border-l border-white/10 pl-12 relative z-10">
          <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Чистая прибыль</p>
          <p className={`text-5xl font-black italic tracking-tighter whitespace-nowrap ${totals.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{totals.profit.toLocaleString()} ₽</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-end">
          {reportMode === 'month' ? (
            <>
              <div className="flex-1 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block ml-1">Месяц</label>
                <CustomSelect options={months} value={months[selectedMonth]} onChange={(val: string) => setSelectedMonth(months.indexOf(val))} />
              </div>
              <div className="w-28 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block ml-1">Год</label>
                <CustomSelect options={years} value={selectedYear.toString()} onChange={(val: string) => setSelectedYear(Number(val))} />
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block ml-1">От</label>
                <input type="date" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm focus:border-green-500 transition-all" value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})} />
              </div>
              <div className="flex-1 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block ml-1">До</label>
                <input type="date" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm focus:border-green-500 transition-all" value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})} />
              </div>
            </>
          )}
          <button onClick={() => setReportMode(reportMode === 'month' ? 'custom' : 'month')} className="bg-slate-100 text-slate-500 px-3 h-10 rounded-xl font-black text-[9px] uppercase border border-slate-200 hover:bg-slate-200">
            {reportMode === 'month' ? 'Период' : 'Месяц'}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-3 items-end">
          <div className="flex-1 text-left">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block ml-1">Клиент</label>
            <CustomSelect options={['Все клиенты', ...clients.map((c:any) => c.fullName)]} value={selectedClientName} onChange={(val: string) => {
              if (val === 'Все клиенты') setFilterClientId('all');
              else setFilterClientId(clients.find((c:any) => c.fullName === val)?.id || 'all');
              setFilterCarId('all');
            }} />
          </div>
          <div className="flex-1 text-left">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block ml-1">Машина</label>
            <CustomSelect className={filterClientId === 'all' ? 'opacity-30 pointer-events-none' : ''} options={['Все авто', ...availableCars.map((c:any) => `${c.brand} ${c.model}`)]} value={selectedCarName} onChange={(val: string) => {
              if (val === 'Все авто') setFilterCarId('all');
              else setFilterCarId(availableCars.find((c:any) => `${c.brand} ${c.model}` === val)?.id || 'all');
            }} />
          </div>
          <button onClick={exportPDF} className="btn-action !h-10 !px-4 hover:bg-green-600">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-450px)]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 shadow-sm">
              <tr className="text-slate-400 text-[10px] font-black uppercase">
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4">Клиент / Автомобиль</th>
                <th className="px-6 py-4">Описание</th>
                <th className="px-6 py-4 text-center">Количество</th>
                <th className="px-6 py-4 text-right">Итоговая сумма</th>
                <th className="px-6 py-4 text-right">Закупка</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {filteredData.map((r, i) => (
                <tr key={i} className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-3 text-slate-400 font-bold italic">{format(parseISO(r.date), 'dd.MM.yyyy')}</td>
                  <td className="px-6 py-3 leading-tight">
                    <div className="font-black uppercase text-[11px] text-slate-950">{r.clientName}</div>
                    <div className="text-[10px] font-bold text-slate-400">{r.carName}</div>
                  </td>
                  <td className="px-6 py-3 text-slate-600 font-medium">{r.description}</td>
                  <td className="px-6 py-3 text-center font-bold text-slate-900">{r.quantity}</td>
                  <td className="px-6 py-3 text-right font-black text-black whitespace-nowrap">{r.totalPrice.toLocaleString()} ₽</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-400 whitespace-nowrap">{r.purchasePrice.toLocaleString()} ₽</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">Нет завершенных сделок за выбранный период</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}