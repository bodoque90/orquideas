import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Droplets, Thermometer, Wind, AlertCircle, CheckCircle, Plus, Loader2, Link as LinkIcon, Unlink } from 'lucide-react';
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
// Importamos para obtener la lista de sensores
import { subscribeToAllUserSensors, RealtimeSensorData } from '../lib/firebase/realtime';

export function Dashboard() {
  const { user } = useFirebaseAuth();
  const { orchids, loading, error, addOrchid, editOrchid } = useOrchids(user); // Agregamos editOrchid
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Estado para los sensores disponibles
  const [availableSensors, setAvailableSensors] = useState<RealtimeSensorData[]>([]);

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

  // Cargar lista de sensores para el dropdown de vinculación
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAllUserSensors(user.uid, (data) => {
      setAvailableSensors(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddOrchid = async (e: React.FormEvent) => {
    e.preventDefault();
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
        humidity: 0, 
        temperature: 0,
        light: 0,
      });

      toast.success(`¡${newOrchid.name} agregada exitosamente!`);
      setNewOrchid({ name: '', species: '', location: '', wateringFrequency: 7 });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar orquídea');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para vincular sensor
  const handleLinkSensor = async (orchidId: string, sensorId: string) => {
    try {
      await editOrchid(orchidId, { sensorId: sensorId });
      toast.success('Sensor vinculado correctamente');
    } catch (error) {
      toast.error('Error al vincular sensor');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-emerald-800">Cargando tus orquídeas...</p>
      </div>
    );
  }

  if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  const needsWatering = orchids.filter(o => o.nextWatering <= currentTime);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Ocultar' : 'Mostrar'} Diagnóstico
        </Button>
      </div>

      {showDebug && <FirebaseDebug />}

      {needsWatering.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Riego Necesario</AlertTitle>
          <AlertDescription>{needsWatering.length} orquídeas necesitan agua hoy.</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-emerald-800 text-2xl font-bold">Mis Orquídeas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Orquídea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Orquídea</DialogTitle>
              <DialogDescription>Registra una nueva planta en tu colección.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrchid} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={newOrchid.name} onChange={(e) => setNewOrchid({ ...newOrchid, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Especie</Label>
                <Input id="species" value={newOrchid.species} onChange={(e) => setNewOrchid({ ...newOrchid, species: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia de Riego (días)</Label>
                <Input type="number" id="frequency" value={newOrchid.wateringFrequency} onChange={(e) => setNewOrchid({ ...newOrchid, wateringFrequency: parseInt(e.target.value) })} required min={1} />
              </div>
              <Button type="submit" className="w-full bg-emerald-600" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {orchids.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No tienes orquídeas registradas.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orchids.map(orchid => (
            <OrchidCard
              key={orchid.id}
              orchid={orchid}
              sensors={availableSensors}
              onLinkSensor={handleLinkSensor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE DE TARJETA MEJORADO ---

interface OrchidCardProps {
  orchid: any;
  sensors: RealtimeSensorData[];
  onLinkSensor: (orchidId: string, sensorId: string) => void;
}

function OrchidCard({ orchid, sensors, onLinkSensor }: OrchidCardProps) {
  const { user } = useFirebaseAuth();
  // Pasamos 'user' (objeto) correctamente
  const { sensorData } = useRealtimeSensor(user, orchid.sensorId || null);
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  // Verificar si hay un sensor vinculado
  const isConnected = !!orchid.sensorId;

  // Helper para formatear valores: Muestra "--" si no hay sensor o no hay dato
  const formatValue = (val: number | undefined | null, unit: string) => {
    if (!isConnected || val === null || val === undefined) return "--";
    return `${val.toFixed(1)}${unit}`;
  };

  const formatInt = (val: number | undefined | null, unit: string) => {
    if (!isConnected || val === null || val === undefined) return "--";
    return `${val.toFixed(0)}${unit}`;
  };

  // Obtenemos los datos reales (si existen)
  const humidity = sensorData?.humidity;
  const temp = sensorData?.temperature;
  const light = sensorData?.light;
  const soil = sensorData?.soilMoisture;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-0">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{orchid.name}</CardTitle>
            <CardDescription className="text-emerald-50 text-xs mt-1 flex items-center gap-1">
              {orchid.species} 
              {isConnected && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-emerald-400/30 text-white border-0">Sensor Activo</Badge>}
            </CardDescription>
          </div>
          
          {/* BOTÓN DE VINCULACIÓN */}
          <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                {orchid.sensorId ? <LinkIcon className="h-4 w-4" /> : <Unlink className="h-4 w-4 opacity-50" />}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vincular Sensor a {orchid.name}</DialogTitle>
                <DialogDescription>Elige un sensor para ver sus datos en esta planta.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Sensor Disponible</Label>
                  <Select 
                    defaultValue={orchid.sensorId} 
                    onValueChange={(value) => {
                      onLinkSensor(orchid.id, value);
                      setIsLinkOpen(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un sensor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sensors.length > 0 ? (
                        sensors.map(s => (
                          <SelectItem key={s.orchidId} value={s.orchidId}>
                            {s.orchidId.replace(/_/g, ' ')} (T: {s.temperature?.toFixed(1)}°C)
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">No hay sensores conectados</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {orchid.sensorId && (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => {
                      onLinkSensor(orchid.id, ""); // Desvincular
                      setIsLinkOpen(false);
                    }}
                  >
                    <Unlink className="mr-2 h-4 w-4" /> Desvincular Sensor Actual
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 bg-white">
        {/* DATOS PRINCIPALES */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-xl flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-1">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase">Humedad</span>
            </div>
            <span className="text-xl font-bold text-blue-700">{formatValue(humidity, "%")}</span>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-1">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase">Temp</span>
            </div>
            <span className="text-xl font-bold text-orange-700">{formatValue(temp, "°C")}</span>
          </div>
        </div>

        {/* DATOS SECUNDARIOS */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-purple-500" />
              <span>Luz</span>
            </div>
            <span className="font-medium">{formatInt(light, "%")}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-brown-500" /> 
              <span>Suelo</span>
            </div>
            <span className="font-medium">{formatInt(soil, "%")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}