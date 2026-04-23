import React, { useState } from 'react';
import { ClientList } from './pages/ClientList';
import { CarDetails } from './pages/CarDetails';
import { Layout, Settings } from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const storage = useStorage();
  const [currentView, setCurrentView] = useState<{ type: 'list' | 'details'; carId?: string }>({ type: 'list' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!storage.isLoaded) return <div className="h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView({ type: 'list' })}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Layout className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 uppercase italic">
              BRONCO<span className="text-blue-600">PARTS</span>
            </span>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium text-sm"
          >
            <Settings size={18} />
            <span>Настройки</span>
          </button>
        </div>
      </nav>

      <main>
        {currentView.type === 'list' ? (
          <ClientList 
            clients={storage.clients}
            cars={storage.cars}
            addClient={storage.addClient}
            deleteClient={storage.deleteClient}
            deleteCar={storage.deleteCar} // Проброс функции
            addCarToClient={storage.addCarToClient}
            onSelectCar={(carId) => setCurrentView({ type: 'details', carId })} 
          />
        ) : (
          <CarDetails 
            carId={currentView.carId!} 
            clients={storage.clients}
            cars={storage.cars}
            noteOptions={storage.noteOptions}
            addRecord={storage.addRecord}
            deleteRecord={storage.deleteRecord}
            onBack={() => setCurrentView({ type: 'list' })} 
          />
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        options={storage.noteOptions}
        onUpdate={storage.updateNoteOptions}
      />
    </div>
  );
}

export default App;