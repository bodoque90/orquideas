import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dashboard } from './components/Dashboard';
import { WateringCalendar } from './components/WateringCalendar';
import { SensorMonitoring } from './components/SensorMonitoring';
import { HistoricalData } from './components/historicalData';
import { Settings } from './components/Settings';
import { AuthGuard } from './components/AuthGuard';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { Droplets, Calendar, Activity, BarChart3, Settings as SettingsIcon, LogOut, User } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [recordingFrequency, setRecordingFrequency] = useState(60); // minutes
  const { user, logOut } = useFirebaseAuth();

  const handleLogOut = async () => {
    try {
      await logOut();
      toast.success('Sesión cerrada exitosamente');
    } catch (err) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-emerald-800 mb-2">Sistema de Monitoreo de Orquídeas</h1>
                <p className="text-emerald-600">Cuida tus orquídeas con tecnología inteligente</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800">{user?.displayName || user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogOut}
                  className="bg-white/50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
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
              <HistoricalData recordingFrequency={recordingFrequency} />
            </TabsContent>

            <TabsContent value="settings">
              <Settings 
                recordingFrequency={recordingFrequency}
                setRecordingFrequency={setRecordingFrequency}
              />
            </TabsContent>
          </Tabs>
        </div>
        <Toaster position="bottom-right" />
      </div>
    </AuthGuard>
  );
}