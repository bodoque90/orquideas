import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Droplets, Thermometer, Wind, AlertCircle, CheckCircle, Plus, Loader2, Link as LinkIcon, Unlink, AlertTriangle, Flame, MoreVertical, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useOrchids } from '../hooks/useOrchids';
import { useRealtimeSensor } from '../hooks/useRealtimeSensor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';
import { FirebaseDebug } from './FirebaseDebug';
import { subscribeToAllUserSensors, RealtimeSensorData, subscribeToSystemSettings, SystemSettings } from '../lib/firebase/realtime';

export function Dashboard() {
  const { user } = useFirebaseAuth();
  // IMPORTANTE: Agregamos removeOrchid aquí
  const { orchids, loading, error, addOrchid, editOrchid, removeOrchid } = useOrchids(user);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const [availableSensors, setAvailableSensors] = useState<RealtimeSensorData[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [newOrchid, setNewOrchid] = useState({
    name: '',
    species: '',
    location: '',
    wateringFrequency: 7,
  });

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribeSensors = subscribeToAllUserSensors(user.uid, (data) => setAvailableSensors(data));
    const unsubscribeSettings = subscribeToSystemSettings(user.uid, (data) => setSettings(data));
    return () => { unsubscribeSensors(); unsubscribeSettings(); };
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
        humidity: 0, temperature: 0, light: 0,
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

  const handleLinkSensor = async (orchidId: string, sensorId: string) => {
    try {
      await editOrchid(orchidId, { sensorId: sensorId });
      toast.success('Sensor vinculado correctamente');
    } catch (error) {
      toast.error('Error al vincular sensor');
    }
  };

  // NUEVA FUNCIÓN PARA ELIMINAR
  const handleDeleteOrchid = async (orchidId: string) => {
    try {
      await removeOrchid(orchidId);
      toast.success('Orquídea eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar orquídea');
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

  // --- ALERTAS ---
  const needsWatering = settings?.wateringReminder ? orchids.filter(o => o.nextWatering <= currentTime) : [];
  const lowHumidityOrchids = settings?.lowHumidityAlert ? orchids.filter(orchid => {
    if (!orchid.sensorId) return false;
    const sensor = availableSensors.find(s => s.orchidId === orchid.sensorId);
    return sensor && sensor.humidity < 50; 
  }) : [];
  const highTempOrchids = settings?.highTempAlert ? orchids.filter(orchid => {
    if (!orchid.sensorId) return false;
    const sensor = availableSensors.find(s => s.orchidId === orchid.sensorId);
    return sensor && sensor.temperature > 26; 
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Ocultar' : 'Mostrar'} Diagnóstico
        </Button>
      </div>
      {showDebug && <FirebaseDebug />}

      {needsWatering.length > 0 && (
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Riego Necesario</AlertTitle><AlertDescription>{needsWatering.length} orquídeas necesitan agua.</AlertDescription></Alert>
      )}
      {lowHumidityOrchids.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900"><AlertTriangle className="h-4 w-4 text-yellow-600" /><AlertTitle>Ambiente Seco</AlertTitle><AlertDescription>Humedad baja en: {lowHumidityOrchids.map(o => o.name).join(', ')}.</AlertDescription></Alert>
      )}
      {highTempOrchids.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 text-orange-900"><Flame className="h-4 w-4 text-orange-600" /><AlertTitle>Temperatura Alta</AlertTitle><AlertDescription>Calor en: {highTempOrchids.map(o => o.name).join(', ')}.</AlertDescription></Alert>
      )}
      {orchids.length > 0 && needsWatering.length === 0 && lowHumidityOrchids.length === 0 && highTempOrchids.length === 0 && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900"><CheckCircle className="h-4 w-4 text-emerald-600" /><AlertTitle>Estado Óptimo</AlertTitle><AlertDescription>Todo en orden.</AlertDescription></Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-emerald-800 text-2xl font-bold">Mis Orquídeas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Agregar Orquídea</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva Orquídea</DialogTitle><DialogDescription>Registra una nueva planta.</DialogDescription></DialogHeader>
            <form onSubmit={handleAddOrchid} className="space-y-4 py-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={newOrchid.name} onChange={(e) => setNewOrchid({ ...newOrchid, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Especie</Label><Input value={newOrchid.species} onChange={(e) => setNewOrchid({ ...newOrchid, species: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Frecuencia Riego (días)</Label><Input type="number" value={newOrchid.wateringFrequency} onChange={(e) => setNewOrchid({ ...newOrchid, wateringFrequency: parseInt(e.target.value) })} required min={1} /></div>
              <Button type="submit" className="w-full bg-emerald-600" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {orchids.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No tienes orquídeas registradas.</CardContent></Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orchids.map(orchid => (
            <OrchidCard
              key={orchid.id}
              orchid={orchid}
              sensors={availableSensors}
              onLinkSensor={handleLinkSensor}
              onDelete={handleDeleteOrchid} // Pasamos la función borrar
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface OrchidCardProps {
  orchid: any;
  sensors: RealtimeSensorData[];
  onLinkSensor: (orchidId: string, sensorId: string) => void;
  onDelete: (orchidId: string) => void; // Nueva prop
}

function OrchidCard({ orchid, sensors, onLinkSensor, onDelete }: OrchidCardProps) {
  const { user } = useFirebaseAuth();
  const { sensorData } = useRealtimeSensor(user, orchid.sensorId || null);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false); // Para confirmar borrado

  const isConnected = !!orchid.sensorId;
  const formatValue = (val: any, unit: string) => (!isConnected || val == null) ? "--" : `${val.toFixed(1)}${unit}`;
  const formatInt = (val: any, unit: string) => (!isConnected || val == null) ? "--" : `${val.toFixed(0)}${unit}`;

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
          
          {/* MENÚ DESPLEGABLE (PUNTITOS) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsLinkOpen(true)}>
                <LinkIcon className="mr-2 h-4 w-4" /> Vincular Sensor
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* MODAL DE VINCULACIÓN (Oculto, se activa con el state) */}
          <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Vincular Sensor</DialogTitle><DialogDescription>Elige un sensor para {orchid.name}.</DialogDescription></DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Sensor Disponible</Label>
                  <Select defaultValue={orchid.sensorId} onValueChange={(val) => { onLinkSensor(orchid.id, val); setIsLinkOpen(false); }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {sensors.length > 0 ? sensors.map(s => <SelectItem key={s.orchidId} value={s.orchidId}>{s.orchidId.replace(/_/g, ' ')} (T: {s.temperature?.toFixed(1)}°C)</SelectItem>) : <div className="p-2 text-sm text-muted-foreground">Sin sensores</div>}
                    </SelectContent>
                  </Select>
                </div>
                {orchid.sensorId && <Button variant="destructive" className="w-full" onClick={() => { onLinkSensor(orchid.id, ""); setIsLinkOpen(false); }}><Unlink className="mr-2 h-4 w-4" /> Desvincular</Button>}
              </div>
            </DialogContent>
          </Dialog>

          {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
          <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogDescription>
                  Esta acción eliminará permanentemente a "{orchid.name}" y todo su historial.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteAlertOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={() => { onDelete(orchid.id); setIsDeleteAlertOpen(false); }}>Eliminar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 bg-white">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-xl flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-1"><Droplets className="w-4 h-4 text-blue-500" /><span className="text-xs font-bold text-muted-foreground uppercase">Humedad</span></div>
            <span className="text-xl font-bold text-blue-700">{formatValue(sensorData?.humidity, "%")}</span>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-1"><Thermometer className="w-4 h-4 text-orange-500" /><span className="text-xs font-bold text-muted-foreground uppercase">Temp</span></div>
            <span className="text-xl font-bold text-orange-700">{formatValue(sensorData?.temperature, "°C")}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
          <div className="flex items-center justify-between text-muted-foreground"><div className="flex items-center gap-2"><Wind className="w-4 h-4 text-purple-500" /><span>Luz</span></div><span className="font-medium">{formatInt(sensorData?.light, "%")}</span></div>
          <div className="flex items-center justify-between text-muted-foreground"><div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-brown-500" /><span>Suelo</span></div><span className="font-medium">{formatInt(sensorData?.soilMoisture, "%")}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}