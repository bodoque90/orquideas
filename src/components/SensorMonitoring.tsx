import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Wifi, Plus, Thermometer, Droplets, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { subscribeToAllUserSensors, RealtimeSensorData, findUnclaimedSensors, claimSensor, UnclaimedSensor } from '../lib/firebase/realtime';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

export function SensorMonitoring() {
  const { user } = useFirebaseAuth();
  const [sensors, setSensors] = useState<RealtimeSensorData[]>([]);
  const [unclaimedSensors, setUnclaimedSensors] = useState<UnclaimedSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Escuchar mis sensores ya vinculados
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAllUserSensors(user.uid, (data) => {
      setSensors(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Función para buscar nuevos sensores (abre el modal)
  const handleScan = () => {
    setIsScanning(true);
    setIsDialogOpen(true);
    
    // Escuchar la carpeta 'unclaimed_sensors'
    const unsubscribe = findUnclaimedSensors((foundSensors) => {
      setUnclaimedSensors(foundSensors);
      setIsScanning(false);
    });

    // Limpiar suscripción al cerrar (esto es simplificado)
    return unsubscribe;
  };

  // 3. Función para vincular
  const handleClaim = async (sensorId: string) => {
    if (!user) return;
    try {
      await claimSensor(sensorId, user.uid);
      toast.success("Vinculando sensor...", { description: "El dispositivo se reiniciará y aparecerá en tu lista en unos segundos." });
      setIsDialogOpen(false); // Cerrar modal
    } catch (error) {
      console.error(error);
      toast.error("Error al vincular sensor");
    }
  };

  const isOnline = (timestamp: number) => {
    return (Date.now() - timestamp) < 2 * 60 * 1000;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-emerald-800 text-2xl font-bold">Mis Sensores</h2>
          <p className="text-muted-foreground">Gestión de dispositivos IoT</p>
        </div>
        
        {/* BOTÓN BUSCAR / AGREGAR */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleScan} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Buscar Nuevo Sensor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buscando dispositivos cercanos...</DialogTitle>
              <DialogDescription>
                Asegúrate de que tu sensor esté encendido y en modo configuración.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              {isScanning && unclaimedSensors.length === 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              )}

              {!isScanning && unclaimedSensors.length === 0 && (
                <p className="text-center text-muted-foreground">No se encontraron dispositivos nuevos.</p>
              )}

              {unclaimedSensors.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <Wifi className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{device.type}</p>
                      <p className="text-xs text-muted-foreground font-mono">ID: {device.id}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleClaim(device.id)}>
                    Vincular
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTA DE SENSORES YA VINCULADOS */}
      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
           <p>Cargando sensores...</p>
        ) : sensors.length === 0 ? (
           <Card className="col-span-2">
             <CardContent className="py-12 text-center">
               <p className="text-muted-foreground">No tienes sensores registrados.</p>
             </CardContent>
           </Card>
        ) : (
          sensors.map((sensor) => {
              const online = isOnline(sensor.timestamp);
              return (
                <Card key={sensor.orchidId} className="overflow-hidden shadow-lg border-0">
                  <CardHeader className={`${online ? 'bg-blue-500' : 'bg-gray-400'} text-white`}>
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-white capitalize">
                          {sensor.orchidId.replace('sensor_', 'Sensor ')}
                        </CardTitle>
                        <Badge className={online ? "bg-green-400 text-green-900" : "bg-gray-600 text-gray-200"}>
                          {online ? "Online" : "Offline"}
                        </Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="pt-6 bg-white">
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-blue-50 p-3 rounded-xl">
                          <div className="flex justify-center mb-1"><Droplets className="w-5 h-5 text-blue-500"/></div>
                          <p className="text-muted-foreground text-xs font-bold uppercase">Humedad</p>
                          <p className="text-xl font-bold text-blue-600">{sensor.humidity.toFixed(1)}%</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-xl">
                          <div className="flex justify-center mb-1"><Thermometer className="w-5 h-5 text-orange-500"/></div>
                          <p className="text-muted-foreground text-xs font-bold uppercase">Temp</p>
                          <p className="text-xl font-bold text-orange-600">{sensor.temperature.toFixed(1)}°C</p>
                        </div>
                     </div>
                     {/* Datos extra del suelo y luz */}
                     <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-500">
                        <span>Luz: {sensor.light}%</span>
                        <span>Suelo: {sensor.soilMoisture}%</span>
                     </div>
                  </CardContent>
                </Card>
              );
          })
        )}
      </div>
    </div>
  );
}