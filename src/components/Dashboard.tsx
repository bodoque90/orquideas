import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Droplets, Thermometer, Wind, AlertCircle, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useOrchids } from '../hooks/useOrchids';
import { useRealtimeSensor } from '../hooks/useRealtimeSensor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { FirebaseDebug } from './FirebaseDebug';

export function Dashboard() {
  const { user } = useFirebaseAuth();
  const { orchids, loading, error, addOrchid } = useOrchids(user);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Form state
  const [newOrchid, setNewOrchid] = useState({
    name: '',
    species: '',
    location: '',
    wateringFrequency: 7,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Debug: mostrar errores
  useEffect(() => {
    if (error) {
      console.error('Dashboard Error:', error);
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleAddOrchid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrchid.name || !newOrchid.species) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const nextWatering = new Date(now);
      nextWatering.setDate(nextWatering.getDate() + newOrchid.wateringFrequency);

      await addOrchid({
        name: newOrchid.name,
        species: newOrchid.species,
        location: newOrchid.location,
        wateringFrequency: newOrchid.wateringFrequency,
        lastWatered: now,
        nextWatering: nextWatering,
        humidity: 65,
        temperature: 22,
        light: 75,
      });

      toast.success(`¡${newOrchid.name} agregada exitosamente!`);
      setNewOrchid({ name: '', species: '', location: '', wateringFrequency: 7 });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding orchid:', error);
      toast.error(error.message || 'Error al agregar orquídea');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar error si hay problema con Firebase
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Conexión</AlertTitle>
          <AlertDescription>
            No se pudo conectar a Firebase. Verifica tu configuración.
            <br />
            <code className="text-xs mt-2 block">{error}</code>
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Revisa la consola del navegador para más detalles
            </p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-emerald-800">Cargando tus orquídeas...</p>
        <p className="text-sm text-muted-foreground">Si tarda mucho, verifica la consola</p>
      </div>
    );
  }

  const needsWatering = orchids.filter(o => o.nextWatering <= currentTime);
  const lowHumidity = orchids.filter(o => o.humidity && o.humidity < 60);

  const getHumidityStatus = (humidity?: number) => {
    if (!humidity) return { status: 'N/A', variant: 'secondary' as const };
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
      {/* Debug Panel */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? 'Ocultar' : 'Mostrar'} Diagnóstico
        </Button>
      </div>

      {showDebug && <FirebaseDebug />}

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

      {needsWatering.length === 0 && lowHumidity.length === 0 && orchids.length > 0 && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800">Todo en orden</AlertTitle>
          <AlertDescription className="text-emerald-700">
            Todas tus orquídeas están en condiciones óptimas.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Orchid Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-emerald-800">Mis Orquídeas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Orquídea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Orquídea</DialogTitle>
              <DialogDescription>
                Registra una nueva orquídea en tu sistema de monitoreo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrchid} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Phalaenopsis Rosa"
                  value={newOrchid.name}
                  onChange={(e) => setNewOrchid({ ...newOrchid, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Especie *</Label>
                <Input
                  id="species"
                  placeholder="Ej: Phalaenopsis"
                  value={newOrchid.species}
                  onChange={(e) => setNewOrchid({ ...newOrchid, species: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Ej: Sala de estar"
                  value={newOrchid.location}
                  onChange={(e) => setNewOrchid({ ...newOrchid, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia de Riego</Label>
                <Select
                  value={newOrchid.wateringFrequency.toString()}
                  onValueChange={(value) => setNewOrchid({ ...newOrchid, wateringFrequency: parseInt(value) })}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Cada 3 días</SelectItem>
                    <SelectItem value="5">Cada 5 días</SelectItem>
                    <SelectItem value="7">Cada 7 días</SelectItem>
                    <SelectItem value="10">Cada 10 días</SelectItem>
                    <SelectItem value="14">Cada 14 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  'Agregar Orquídea'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orchid Cards */}
      {orchids.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No tienes orquídeas registradas aún
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Orquídea
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orchids.map(orchid => {
            const daysUntil = getDaysUntilWatering(orchid.nextWatering);
            const humidityStatus = getHumidityStatus(orchid.humidity);

            return (
              <OrchidCard
                key={orchid.id}
                orchid={orchid}
                daysUntil={daysUntil}
                humidityStatus={humidityStatus}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface OrchidCardProps {
  orchid: any;
  daysUntil: number;
  humidityStatus: { status: string; variant: any };
}

function OrchidCard({ orchid, daysUntil, humidityStatus }: OrchidCardProps) {
  const { user } = useFirebaseAuth();
  const { sensorData, loading } = useRealtimeSensor(user?.uid || null, orchid.id || null);

  // Use realtime sensor data if available, otherwise fall back to stored values
  const currentHumidity = sensorData?.humidity ?? orchid.humidity ?? 0;
  const currentTemp = sensorData?.temperature ?? orchid.temperature ?? 0;
  const currentLight = sensorData?.light ?? orchid.light ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardTitle>{orchid.name}</CardTitle>
        <CardDescription className="text-emerald-50">
          {daysUntil < 0
            ? '¡Necesita riego ahora!'
            : daysUntil === 0
            ? 'Regar hoy'
            : `Próximo riego en ${daysUntil} ${daysUntil === 1 ? 'día' : 'días'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Cargando datos del sensor...</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="text-muted-foreground">Humedad</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{currentHumidity.toFixed(1)}%</span>
            <Badge variant={humidityStatus.variant}>{humidityStatus.status}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-500" />
            <span className="text-muted-foreground">Temperatura</span>
          </div>
          <span>{currentTemp.toFixed(1)}°C</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-purple-500" />
            <span className="text-muted-foreground">Luz</span>
          </div>
          <span>{currentLight.toFixed(0)}%</span>
        </div>

        <div className="pt-2 border-t text-muted-foreground">
          <p className="text-sm">{orchid.species}</p>
          <p className="text-sm">
            Último riego: {orchid.lastWatered.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}