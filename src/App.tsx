import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

import { Droplets, Calendar, Activity, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SensorMonitoring } from './components/SensorMonitoring';
import { WateringCalendar } from './components/WateringCalendar';
import { Settings } from './components/Settings';

export default function App() {
  const [recordingFrequency, setRecordingFrequency] = useState(60); // minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-emerald-800 mb-2">Sistema de Monitoreo de Orquídeas</h1>
          <p className="text-emerald-600">Cuida tus orquídeas con tecnología inteligente</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="sensors" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Sensores</span>
            </TabsTrigger>
            <TabsTrigger value="historical" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="calendar">
            <WateringCalendar />
          </TabsContent>

          <TabsContent value="sensors">
            <SensorMonitoring />
          </TabsContent>

          <TabsContent value="historical">
            <div className="p-4">Histórico (próximamente)</div>
          </TabsContent>

          <TabsContent value="settings">
            <Settings recordingFrequency={recordingFrequency} setRecordingFrequency={setRecordingFrequency} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
