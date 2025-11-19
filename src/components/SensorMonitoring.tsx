import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bluetooth, Wifi, RefreshCw, Plus, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Sensor {
  id: string;
  name: string;
  type: 'bluetooth' | 'wifi';
  connected: boolean;
  battery: number;
  lastReading: {
    humidity: number;
    temperature: number;
    timestamp: Date;
  };
}

export function SensorMonitoring() {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: '1',
      name: 'Sensor Invernadero',
      type: 'wifi',
      connected: true,
      battery: 87,
      lastReading: {
        humidity: 65,
        temperature: 22,
        timestamp: new Date(),
      },
    },
    {
      id: '2',
      name: 'Sensor Terraza',
      type: 'bluetooth',
      connected: true,
      battery: 45,
      lastReading: {
        humidity: 58,
        temperature: 24,
        timestamp: new Date(),
      },
    },
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSensorName, setNewSensorName] = useState('');
  const [newSensorType, setNewSensorType] = useState<'bluetooth' | 'wifi'>('wifi');

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        lastReading: {
          humidity: Math.max(40, Math.min(80, sensor.lastReading.humidity + (Math.random() - 0.5) * 3)),
          temperature: Math.max(18, Math.min(28, sensor.lastReading.temperature + (Math.random() - 0.5) * 0.8)),
          timestamp: new Date(),
        },
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scanForSensors = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const addSensor = () => {
    if (!newSensorName) return;

    const newSensor: Sensor = {
      id: Date.now().toString(),
      name: newSensorName,
      type: newSensorType,
      connected: true,
      battery: 100,
      lastReading: {
        humidity: 60 + Math.random() * 10,
        temperature: 20 + Math.random() * 5,
        timestamp: new Date(),
      },
    };

    setSensors([...sensors, newSensor]);
    setNewSensorName('');
    setIsDialogOpen(false);
  };

  const toggleConnection = (id: string) => {
    setSensors(sensors.map(s => 
      s.id === id ? { ...s, connected: !s.connected } : s
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-emerald-800">Monitoreo de Sensores</h2>
          <p className="text-muted-foreground">
            Gestiona tus sensores de humedad y temperatura
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={scanForSensors}
            disabled={isScanning}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Buscando...' : 'Buscar Sensores'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Sensor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Sensor</DialogTitle>
                <DialogDescription>
                  Configura un nuevo sensor de humedad para tus orquídeas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sensor-name">Nombre del Sensor</Label>
                  <Input
                    id="sensor-name"
                    placeholder="Ej: Sensor Jardín"
                    value={newSensorName}
                    onChange={(e) => setNewSensorName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sensor-type">Tipo de Conexión</Label>
                  <Select 
                    value={newSensorType} 
                    onValueChange={(value) => setNewSensorType(value as 'bluetooth' | 'wifi')}
                  >
                    <SelectTrigger id="sensor-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wifi">Wi-Fi</SelectItem>
                      <SelectItem value="bluetooth">Bluetooth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addSensor} className="w-full">
                Agregar Sensor
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sensors.map(sensor => (
          <Card key={sensor.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{sensor.name}</CardTitle>
                  <CardDescription className="text-blue-50 flex items-center gap-2 mt-2">
                    {sensor.type === 'wifi' ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <Bluetooth className="w-4 h-4" />
                    )}
                    {sensor.type === 'wifi' ? 'Wi-Fi' : 'Bluetooth'}
                  </CardDescription>
                </div>
                <Badge 
                  variant={sensor.connected ? 'default' : 'secondary'}
                  className={sensor.connected ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {sensor.connected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-muted-foreground mb-1">Humedad</p>
                  <p className="text-blue-600">{sensor.lastReading.humidity.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-muted-foreground mb-1">Temperatura</p>
                  <p className="text-orange-600">{sensor.lastReading.temperature.toFixed(1)}°C</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Batería</span>
                  <span className={sensor.battery < 20 ? 'text-red-500' : ''}>{sensor.battery}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      sensor.battery < 20 
                        ? 'bg-red-500' 
                        : sensor.battery < 50 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${sensor.battery}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-muted-foreground">
                  Última lectura: {sensor.lastReading.timestamp.toLocaleTimeString('es-ES')}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleConnection(sensor.id)}
                  className="flex-1"
                >
                  {sensor.connected ? 'Desconectar' : 'Conectar'}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sensors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay sensores configurados
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Sensor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
