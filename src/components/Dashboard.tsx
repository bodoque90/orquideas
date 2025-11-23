import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Droplets, Thermometer, Wind, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface OrchidStatus {
  id: string;
  name: string;
  lastWatered: Date;
  nextWatering: Date;
  humidity: number;
  temperature: number;
  airQuality: number;
}

export function Dashboard() {
  const [orchids, setOrchids] = useState<OrchidStatus[]>([
    {
      id: '1',
      name: 'Phalaenopsis Rosa',
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextWatering: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      humidity: 65,
      temperature: 22,
      airQuality: 78,
    },
    {
      id: '2',
      name: 'Cattleya Blanca',
      lastWatered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextWatering: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      humidity: 58,
      temperature: 24,
      airQuality: 82,
    },
    {
      id: '3',
      name: 'Dendrobium Púrpura',
      lastWatered: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      nextWatering: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      humidity: 52,
      temperature: 23,
      airQuality: 75,
    },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate sensor readings
      setOrchids(prev => prev.map(orchid => ({
        ...orchid,
        humidity: Math.max(40, Math.min(80, orchid.humidity + (Math.random() - 0.5) * 2)),
        temperature: Math.max(18, Math.min(28, orchid.temperature + (Math.random() - 0.5) * 0.5)),
        airQuality: Math.max(60, Math.min(100, orchid.airQuality + (Math.random() - 0.5) * 3)),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const needsWatering = orchids.filter(o => o.nextWatering <= currentTime);
  const lowHumidity = orchids.filter(o => o.humidity < 60);

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 50) return { status: 'Bajo', variant: 'destructive' as const };
    if (humidity < 60) return { status: 'Medio', variant: 'default' as const };
    return { status: 'Óptimo', variant: 'default' as const };
  };

  const getDaysUntilWatering = (nextWatering: Date) => {
    const diff = nextWatering.getTime() - currentTime.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {needsWatering.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>¡Atención! Orquídeas necesitan riego</AlertTitle>
          <AlertDescription>
            {needsWatering.map(o => o.name).join(', ')} necesitan ser regadas hoy.
          </AlertDescription>
        </Alert>
      )}

      {lowHumidity.length > 0 && needsWatering.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Humedad baja detectada</AlertTitle>
          <AlertDescription>
            Algunas orquídeas tienen niveles de humedad por debajo del óptimo.
          </AlertDescription>
        </Alert>
      )}

      {needsWatering.length === 0 && lowHumidity.length === 0 && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800">Todo en orden</AlertTitle>
          <AlertDescription className="text-emerald-700">
            Todas tus orquídeas están en condiciones óptimas.
          </AlertDescription>
        </Alert>
      )}

      {/* Orchid Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orchids.map(orchid => {
          const daysUntil = getDaysUntilWatering(orchid.nextWatering);
          const humidityStatus = getHumidityStatus(orchid.humidity);

          return (
            <Card key={orchid.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardTitle>{orchid.name}</CardTitle>
                <CardDescription className="text-emerald-50">
                  {daysUntil < 0 
                    ? '¡Necesita riego ahora!' 
                    : daysUntil === 0 
                    ? 'Regar hoy' 
                    : `Próximo riego en ${daysUntil} ${daysUntil === 1 ? 'día' : 'días'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <span className="text-muted-foreground">Humedad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{orchid.humidity.toFixed(1)}%</span>
                    <Badge variant={humidityStatus.variant}>{humidityStatus.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    <span className="text-muted-foreground">Temperatura</span>
                  </div>
                  <span>{orchid.temperature.toFixed(1)}°C</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-purple-500" />
                    <span className="text-muted-foreground">Calidad del aire</span>
                  </div>
                  <span>{orchid.airQuality.toFixed(0)}%</span>
                </div>

                <div className="pt-2 border-t text-muted-foreground">
                  <p>
                    Último riego: {orchid.lastWatered.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}