import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Bell, Database, Wifi, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';

interface SettingsProps {
  recordingFrequency: number;
  setRecordingFrequency: (value: number) => void;
}

export function Settings({ recordingFrequency, setRecordingFrequency }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [autoWatering, setAutoWatering] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [dataRetention, setDataRetention] = useState('90');

  const handleSave = () => {
    toast.success('Configuración guardada correctamente');
  };

  return (
    <div className="space-y-6">
      <Toaster />
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <CardTitle>Configuración de Registro de Datos</CardTitle>
          </div>
          <CardDescription>
            Configura la frecuencia de registro de las condiciones ambientales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frecuencia de Registro</Label>
            <Select 
              value={recordingFrequency.toString()} 
              onValueChange={(value) => setRecordingFrequency(parseInt(value))}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Cada 15 minutos</SelectItem>
                <SelectItem value="30">Cada 30 minutos</SelectItem>
                <SelectItem value="60">Cada 1 hora</SelectItem>
                <SelectItem value="120">Cada 2 horas</SelectItem>
                <SelectItem value="180">Cada 3 horas</SelectItem>
                <SelectItem value="360">Cada 6 horas</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground">
              Los datos se registrarán automáticamente cada {recordingFrequency} minutos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Retención de Datos</Label>
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
            <p className="text-muted-foreground">
              Los datos más antiguos se eliminarán automáticamente
            </p>
          </div>
        </CardContent>
      </Card>

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
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
