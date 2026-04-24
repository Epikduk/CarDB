import React, { useState } from 'react';
import { Home } from './pages/Home';
import { ClientList } from './pages/ClientList';
import { CarDetails } from './pages/CarDetails';
import { Reporting } from './pages/Reporting';
import { Layout, Settings, Home as HomeIcon } from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import { SettingsModal } from './components/SettingsModal';

type View = { type: 'home' | 'list' | 'details' | 'reporting'; carId?: string };

function App() {
  const storage = useStorage();
  const [currentView, setCurrentView] = useState<View>({ type: 'home' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!storage.isLoaded) return <div className="h-screen flex items-center justify-center">Загрузка BroncoParts...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView({ type: 'home' })}>
            <div className="bg-blue-600 p-2 rounded-lg"><Layout className="text-white" size={24} /></div>
            <span className="text-xl font-black tracking-tight text-slate-800 uppercase italic">Bronco<span className="text-blue-600">Parts</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {currentView.type !== 'home' && (
              <button onClick={() => setCurrentView({ type: 'home' })} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all"><HomeIcon size={18} />На главную</button>
            )}
            <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-bold text-sm"><Settings size={18} />Настройки</button>
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
            onSelectCar={(carId) => setCurrentView({ type: 'details', carId })} 
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