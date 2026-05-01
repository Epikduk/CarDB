import React, { useState } from 'react';
import { Home } from './pages/Home';
import { ClientList } from './pages/ClientList';
import { CarDetails } from './pages/CarDetails';
import { Reporting } from './pages/Reporting';
import { Settings, Home as HomeIcon } from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import { SettingsModal } from './components/SettingsModal';
import logo from './logo.png';

type View = { type: 'home' | 'list' | 'details' | 'reporting'; carId?: string };

function App() {
  const storage = useStorage();
  const [currentView, setCurrentView] = useState<View>({ type: 'home' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [expandedClientIds, setExpandedClientIds] = useState<Set<string>>(new Set());
  const [clientListScrollPos, setClientListScrollPos] = useState(0);
  const [clientSortBy, setClientSortBy] = useState<'name' | 'cars'>('name');

  if (!storage.isLoaded) return <div className="h-screen flex items-center justify-center font-bold text-slate-900 font-sans">Загрузка BroncomParts...</div>;

  return (
    <div className="min-h-screen font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView({ type: 'home' })}>
            {/* Сбалансированная тень для логотипа в углу */}
            <img 
              src={logo} 
              alt="L" 
              className="w-9 h-9 object-contain transition-transform group-hover:scale-110 drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)]" 
            />
            <span className="text-xl font-black tracking-tight uppercase italic transition-colors">
              <span className="text-black group-hover:text-green-600">Broncom</span>
              <span className="text-green-600 group-hover:text-black">Parts</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {currentView.type !== 'home' && (
              <button 
                onClick={() => setCurrentView({ type: 'home' })} 
                className="btn-action !bg-white !text-slate-500 border border-slate-200 hover:!border-slate-400 hover:!text-black shadow-none !px-5"
              >
                <HomeIcon size={18} /> На главную
              </button>
            )}
            <button onClick={() => setIsSettingsOpen(true)} className="btn-action">
              <Settings size={18} /> Настройка примечаний
            </button>
          </div>
        </div>
      </nav>

      <main>
        {currentView.type === 'home' && <Home onNavigate={(type) => setCurrentView({ type })} />}
        {currentView.type === 'list' && (
          <ClientList 
            clients={storage.clients} cars={storage.cars}
            addClient={storage.addClient} updateClient={storage.updateClient} deleteClient={storage.deleteClient}
            addCarToClient={storage.addCarToClient} updateCar={storage.updateCar} deleteCar={storage.deleteCar}
            onSelectCar={(carId: string) => {
              setClientListScrollPos(window.scrollY);
              setCurrentView({ type: 'details', carId });
            }} 
            expandedClientIds={expandedClientIds}
            setExpandedClientIds={setExpandedClientIds}
            scrollPos={clientListScrollPos}
            setScrollPos={setClientListScrollPos}
            sortBy={clientSortBy}
            setSortBy={setClientSortBy}
          />
        )}
        {currentView.type === 'details' && (
          <CarDetails 
            carId={currentView.carId!} clients={storage.clients} cars={storage.cars} noteOptions={storage.noteOptions}
            addRecord={storage.addRecord} updateRecord={storage.updateRecord} deleteRecord={storage.deleteRecord}
            onBack={() => setCurrentView({ type: 'list' })} 
          />
        )}
        {currentView.type === 'reporting' && <Reporting cars={storage.cars} clients={storage.clients} onBack={() => setCurrentView({ type: 'home' })} />}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} options={storage.noteOptions} onUpdate={storage.updateNoteOptions} />
    </div>
  );
}

export default App;