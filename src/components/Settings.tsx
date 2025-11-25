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
// Asegúrate de que SystemSettings esté exportado en realtime.ts
import { updateSystemSettings, subscribeToSystemSettings, SystemSettings } from '../lib/firebase/realtime';

export function Settings() {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);

  // Estado inicial unificado (Todo esto se guardará en Firebase)
  const [settings, setSettings] = useState<SystemSettings>({
    recordingFrequency: 60,
    pushNotifications: true,
    lowHumidityAlert: true,
    highTempAlert: true,
    wateringReminder: true,
    reminderTime: "08:00",
    autoReconnect: true,
    humidityCalibration: 0,
    tempCalibration: 0,
    tempUnit: 'celsius',
    autoWatering: false,
    darkMode: false,
    dataRetention: "90"
  });

  // 1. Cargar configuración real desde Firebase al entrar
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSystemSettings(user.uid, (data) => {
      if (data) {
        // Fusionamos los datos de Firebase con el estado local
        setSettings(prev => ({ ...prev, ...data }));
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Función mágica: Guarda un cambio INMEDIATAMENTE al tocar un switch
  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    if (!user) return;
    
    // Actualización visual rápida (Optimistic UI)
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      // Guardado real en Firebase
      await updateSystemSettings(user.uid, { [key]: value });
    } catch (error) {
      toast.error('Error al guardar cambio');
    }
  };

  // 3. Función para guardar todo manualmente (Botón "Guardar Todo")
  const handleManualSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateSystemSettings(user.uid, settings);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* --- REGISTRO DE DATOS --- */}
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
                {/* Usamos settings.recordingFrequency conectado a Firebase */}
                <Select 
                  value={settings.recordingFrequency.toString()} 
                  onValueChange={(val) => updateSetting('recordingFrequency', parseInt(val))}
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
            </div>
            <p className="text-muted-foreground text-sm">
              El sensor actualizará su temporizador automáticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Retención de Datos</Label>
            <Select 
              value={settings.dataRetention} 
              onValueChange={(val) => updateSetting('dataRetention', val)}
            >
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
          </div>
        </CardContent>
      </Card>

      {/* --- NOTIFICACIONES Y ALERTAS --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <CardTitle>Notificaciones y Alertas</CardTitle>
          </div>
          <CardDescription>Configura qué avisos quieres ver en el Dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notificaciones Globales</Label>
              <p className="text-muted-foreground text-sm">Activar/desactivar todas las alertas</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(val) => updateSetting('pushNotifications', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="low-humidity">Alerta de Humedad Baja</Label>
              <p className="text-muted-foreground text-sm">Avisar si baja del 50%</p>
            </div>
            <Switch 
              id="low-humidity" 
              checked={settings.lowHumidityAlert}
              onCheckedChange={(val) => updateSetting('lowHumidityAlert', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-temp">Alerta de Temperatura Alta</Label>
              <p className="text-muted-foreground text-sm">Avisar si supera los 26°C</p>
            </div>
            <Switch 
              id="high-temp" 
              checked={settings.highTempAlert}
              onCheckedChange={(val) => updateSetting('highTempAlert', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="watering-reminder">Recordatorio de Riego</Label>
              <p className="text-muted-foreground text-sm">Recordatorios según calendario</p>
            </div>
            <Switch 
              id="watering-reminder" 
              checked={settings.wateringReminder}
              onCheckedChange={(val) => updateSetting('wateringReminder', val)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-time">Hora de Recordatorio</Label>
            <Input
              id="reminder-time"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => setSettings({...settings, reminderTime: e.target.value})}
              onBlur={() => updateSetting('reminderTime', settings.reminderTime)}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- SENSORES --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-emerald-600" />
            <CardTitle>Configuración de Sensores</CardTitle>
          </div>
          <CardDescription>Ajustes de conectividad y calibración</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reconnect">Reconexión Automática</Label>
              <p className="text-muted-foreground text-sm">Reintentar conexión si falla</p>
            </div>
            <Switch 
              id="auto-reconnect" 
              checked={settings.autoReconnect}
              onCheckedChange={(val) => updateSetting('autoReconnect', val)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calibration">Calibración de Humedad (%)</Label>
            <Input
              id="calibration"
              type="number"
              value={settings.humidityCalibration}
              onChange={(e) => setSettings({...settings, humidityCalibration: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp-calibration">Calibración de Temperatura (°C)</Label>
            <Input
              id="temp-calibration"
              type="number"
              step="0.1"
              value={settings.tempCalibration}
              onChange={(e) => setSettings({...settings, tempCalibration: parseFloat(e.target.value) || 0})}
            />
          </div>
          
          <div className="flex justify-end">
             <Button size="sm" variant="outline" onClick={handleManualSave}>Guardar Calibración</Button>
          </div>
        </CardContent>
      </Card>

      {/* --- PREFERENCIAS GENERALES --- */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temp-unit">Unidad de Temperatura</Label>
            <Select 
              value={settings.tempUnit} 
              onValueChange={(val) => updateSetting('tempUnit', val)}
            >
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
              <p className="text-muted-foreground text-sm">Sistema de riego automático</p>
            </div>
            <Switch
              id="auto-watering"
              checked={settings.autoWatering}
              onCheckedChange={(val) => updateSetting('autoWatering', val)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button onClick={handleManualSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar Todo
        </Button>
      </div>
    </div>
  );
}