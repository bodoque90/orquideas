import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Bell, Database, Wifi, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { updateSystemSettings, subscribeToSystemSettings } from '../lib/firebase/realtime';

export function Settings() {
  const { user } = useFirebaseAuth();
  
  // --- ESTADO FUNCIONAL (Conectado a Firebase) ---
  const [frequency, setFrequency] = useState("60"); // String para el Select
  const [loading, setLoading] = useState(false);

  // --- ESTADOS VISUALES (Del diseño original) ---
  const [notifications, setNotifications] = useState(true);
  const [autoWatering, setAutoWatering] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [dataRetention, setDataRetention] = useState('90');

  // 1. Cargar configuración real al iniciar
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSystemSettings(user.uid, (settings) => {
      if (settings?.recordingFrequency) {
        setFrequency(settings.recordingFrequency.toString());
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Guardar Frecuencia (Funcionalidad Real)
  const handleSaveFrequency = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateSystemSettings(user.uid, {
        recordingFrequency: parseInt(frequency)
      });
      toast.success('Frecuencia actualizada y enviada al sensor');
    } catch (error) {
      toast.error('Error al guardar frecuencia');
    } finally {
      setLoading(false);
    }
  };

  // 3. Guardar General (Visual)
  const handleSaveGeneral = () => {
    toast.success('Configuración visual guardada (Simulación)');
  };

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* --- SECCIÓN 1: FRECUENCIA (FUNCIONAL) --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <CardTitle>Configuración de Registro de Datos</CardTitle>
          </div>
          <CardDescription>
            Configura cada cuánto tiempo el sensor guarda un registro en el historial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frecuencia de Registro</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select 
                  value={frequency} 
                  onValueChange={setFrequency}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Modo Prueba (1 min)</SelectItem>
                    <SelectItem value="15">Cada 15 minutos</SelectItem>
                    <SelectItem value="30">Cada 30 minutos</SelectItem>
                    <SelectItem value="60">Cada 1 hora</SelectItem>
                    <SelectItem value="120">Cada 2 horas</SelectItem>
                    <SelectItem value="360">Cada 6 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveFrequency} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              El sensor actualizará su temporizador automáticamente a {frequency} minutos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Retención de Datos (Visual)</Label>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="90">90 días</SelectItem>
                <SelectItem value="180">6 meses</SelectItem>
                <SelectItem value="365">1 año</SelectItem>
                <SelectItem value="-1">Ilimitado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Los datos más antiguos se eliminarán automáticamente (Próximamente)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* --- SECCIÓN 2: NOTIFICACIONES (VISUAL) --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <CardTitle>Notificaciones y Alertas</CardTitle>
          </div>
          <CardDescription>
            Configura cuándo y cómo recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notificaciones Push</Label>
              <p className="text-muted-foreground">
                Recibe alertas de riego y condiciones ambientales
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="low-humidity">Alerta de Humedad Baja</Label>
              <p className="text-muted-foreground">
                Notificar cuando la humedad esté por debajo del 50%
              </p>
            </div>
            <Switch id="low-humidity" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-temp">Alerta de Temperatura Alta</Label>
              <p className="text-muted-foreground">
                Notificar cuando la temperatura supere los 26°C
              </p>
            </div>
            <Switch id="high-temp" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="watering-reminder">Recordatorio de Riego</Label>
              <p className="text-muted-foreground">
                Recibir recordatorios según el calendario de riego
              </p>
            </div>
            <Switch id="watering-reminder" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-time">Hora de Recordatorio</Label>
            <Input
              id="reminder-time"
              type="time"
              defaultValue="08:00"
            />
          </div>
        </CardContent>
      </Card>

      {/* --- SECCIÓN 3: SENSORES (VISUAL) --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-emerald-600" />
            <CardTitle>Configuración de Sensores</CardTitle>
          </div>
          <CardDescription>
            Ajustes de conectividad y calibración
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reconnect">Reconexión Automática</Label>
              <p className="text-muted-foreground">
                Intentar reconectar sensores automáticamente
              </p>
            </div>
            <Switch id="auto-reconnect" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calibration">Calibración de Humedad (%)</Label>
            <Input
              id="calibration"
              type="number"
              placeholder="0"
              defaultValue="0"
            />
            <p className="text-muted-foreground">
              Ajuste de calibración para todos los sensores (±20%)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp-calibration">Calibración de Temperatura (°C)</Label>
            <Input
              id="temp-calibration"
              type="number"
              placeholder="0"
              defaultValue="0"
              step="0.1"
            />
            <p className="text-muted-foreground">
              Ajuste de calibración de temperatura (±5°C)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* --- SECCIÓN 4: PREFERENCIAS (VISUAL) --- */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temp-unit">Unidad de Temperatura</Label>
            <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
              <SelectTrigger id="temp-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius (°C)</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-watering">Modo Riego Automático (Próximamente)</Label>
              <p className="text-muted-foreground">
                Sistema de riego automático basado en sensores
              </p>
            </div>
            <Switch
              id="auto-watering"
              checked={autoWatering}
              onCheckedChange={setAutoWatering}
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Modo Oscuro</Label>
              <p className="text-muted-foreground">
                Cambiar al tema oscuro
              </p>
            </div>
            <Switch id="dark-mode" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">
          Restaurar Valores por Defecto
        </Button>
        <Button onClick={handleSaveGeneral}>
          <Save className="w-4 h-4 mr-2" />
          Guardar Configuración Global
        </Button>
      </div>
    </div>
  );
}