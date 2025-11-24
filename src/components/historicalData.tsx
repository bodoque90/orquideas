import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Download, WifiOff, Loader2, Sprout } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { subscribeToAllUserSensors, subscribeToSensorHistory, RealtimeSensorData, HistoryDataPoint } from '../lib/firebase/realtime';

export function HistoricalData() {
  const { user } = useFirebaseAuth();
  
  const [sensors, setSensors] = useState<RealtimeSensorData[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [rawData, setRawData] = useState<HistoryDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('all'); 

  // 1. Cargar Sensores
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAllUserSensors(user.uid, (data) => {
      setSensors(data);
      if (data.length > 0 && !selectedSensorId) {
        setSelectedSensorId(data[0].orchidId);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Cargar Historial
  useEffect(() => {
    if (!user || !selectedSensorId) return;
    setLoading(true);
    
    const unsubscribe = subscribeToSensorHistory(user.uid, selectedSensorId, (data) => {
      setRawData(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, selectedSensorId]);

  // 3. Filtrar Datos
  useEffect(() => {
    if (!rawData || rawData.length === 0) {
      setFilteredData([]);
      return;
    }

    const now = Date.now();
    let cutoffTime = 0;

    if (timeRange === '1h') cutoffTime = now - 60 * 60 * 1000;
    if (timeRange === '24h') cutoffTime = now - 24 * 60 * 60 * 1000;
    if (timeRange === '7d') cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
    if (timeRange === '30d') cutoffTime = now - 30 * 24 * 60 * 60 * 1000;

    const filtered = rawData
      .map(d => {
        // PARCHE: Si el timestamp no es número (es "sv" o null), lo descartamos marcándolo como 0
        const validTs = typeof d.timestamp === 'number' ? d.timestamp : 0;
        return { ...d, timestamp: validTs };
      })
      .filter(d => {
        // Ignorar datos inválidos (0) y aplicar filtro de tiempo
        if (d.timestamp === 0) return false;
        if (timeRange === 'all') return true;
        return d.timestamp >= cutoffTime;
      })
      .map(d => ({
        ...d,
        displayTime: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(d.timestamp).toLocaleString()
      }));

    setFilteredData(filtered);
  }, [rawData, timeRange]);

  const handleDownload = () => {
    if (filteredData.length === 0) return;
    const csv = [
      ['Fecha', 'Hora', 'Humedad (%)', 'Temperatura (°C)', 'Luz', 'Suelo'].join(','),
      ...filteredData.map(d => [
        new Date(d.timestamp).toLocaleDateString(),
        new Date(d.timestamp).toLocaleTimeString(),
        d.humidity,
        d.temperature,
        d.light,
        d.soilMoisture
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${selectedSensorId}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* BARRA DE CONTROLES */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border shadow-sm">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <Select value={selectedSensorId} onValueChange={setSelectedSensorId}>
              <SelectTrigger className="w-[200px] border-0 h-8 focus:ring-0 p-0 bg-transparent">
                <SelectValue placeholder="Seleccionar sensor" />
              </SelectTrigger>
              <SelectContent>
                {sensors.map(s => (
                  <SelectItem key={s.orchidId} value={s.orchidId}>
                    {s.orchidId.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el historial</SelectItem>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
            </SelectContent>
          </Select>
          
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        <Button variant="outline" size="sm" onClick={handleDownload} disabled={filteredData.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Descargar
        </Button>
      </div>

      {/* ESTADO SIN DATOS */}
      {filteredData.length === 0 && !loading ? (
        <Card className="border-dashed bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <div className="rounded-full bg-slate-100 p-3 mb-4">
              <WifiOff className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-900">Sin datos históricos</p>
            <p className="text-sm text-slate-500 max-w-xs mt-2">
              No se encontraron registros válidos. Espera a que el sensor guarde nuevos datos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* GRÁFICO HUMEDAD */}
          <Card>
            <CardHeader>
              <CardTitle>Humedad Relativa</CardTitle>
              <CardDescription>Evolución en el tiempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="displayTime" tick={{ fontSize: 12 }} tickMargin={10} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHumidity)" name="Humedad" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GRÁFICO TEMPERATURA */}
          <Card>
            <CardHeader>
              <CardTitle>Temperatura</CardTitle>
              <CardDescription>Variación térmica</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="displayTime" tick={{ fontSize: 12 }} tickMargin={10} />
                    <YAxis domain={['auto', 'auto']} unit="°C" tick={{ fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f97316" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }} 
                      activeDot={{ r: 6 }} 
                      name="Temperatura" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}