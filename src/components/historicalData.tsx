import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarIcon, Download } from 'lucide-react';
import { Badge } from './ui/badge';

interface HistoricalDataProps {
  recordingFrequency: number;
}

interface DataPoint {
  timestamp: string;
  humidity: number;
  temperature: number;
  time: string;
}

export function HistoricalData({ recordingFrequency }: HistoricalDataProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'custom'>('24h');
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);

  useEffect(() => {
    generateHistoricalData();
  }, [timeRange, recordingFrequency]);

  const generateHistoricalData = () => {
    const data: DataPoint[] = [];
    const now = new Date();
    let dataPoints = 24;
    let intervalMinutes = 60;

    switch (timeRange) {
      case '24h':
        dataPoints = 24;
        intervalMinutes = 60;
        break;
      case '7d':
        dataPoints = 168;
        intervalMinutes = 60;
        break;
      case '30d':
        dataPoints = 720;
        intervalMinutes = 60;
        break;
      default:
        dataPoints = 24;
        intervalMinutes = recordingFrequency;
    }

    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
      const hour = timestamp.getHours();
      
      // Simulate natural variations
      const baseHumidity = 60 + Math.sin(i / 10) * 10;
      const baseTemp = 22 + Math.sin(i / 8) * 3 + (hour > 12 && hour < 18 ? 2 : 0);
      
      data.push({
        timestamp: timestamp.toISOString(),
        humidity: Math.max(40, Math.min(80, baseHumidity + (Math.random() - 0.5) * 5)),
        temperature: Math.max(18, Math.min(28, baseTemp + (Math.random() - 0.5) * 2)),
        time: timestamp.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(timeRange !== '24h' && { month: 'short', day: 'numeric' })
        }),
      });
    }

    setHistoricalData(data);
  };

  const exportData = () => {
    const csv = [
      ['Fecha/Hora', 'Humedad (%)', 'Temperatura (°C)'].join(','),
      ...historicalData.map(d => [
        new Date(d.timestamp).toLocaleString('es-ES'),
        d.humidity.toFixed(2),
        d.temperature.toFixed(2),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos-orquideas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    avgHumidity: historicalData.reduce((acc, d) => acc + d.humidity, 0) / historicalData.length,
    avgTemp: historicalData.reduce((acc, d) => acc + d.temperature, 0) / historicalData.length,
    minHumidity: Math.min(...historicalData.map(d => d.humidity)),
    maxHumidity: Math.max(...historicalData.map(d => d.humidity)),
    minTemp: Math.min(...historicalData.map(d => d.temperature)),
    maxTemp: Math.max(...historicalData.map(d => d.temperature)),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSensor} onValueChange={setSelectedSensor}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los sensores</SelectItem>
              <SelectItem value="1">Sensor Invernadero</SelectItem>
              <SelectItem value="2">Sensor Terraza</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Seleccionar fechas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        <Button onClick={exportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Humedad Promedio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">{stats.avgHumidity.toFixed(1)}%</div>
            <p className="text-muted-foreground">
              Rango: {stats.minHumidity.toFixed(1)}% - {stats.maxHumidity.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Temperatura Promedio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-orange-600">{stats.avgTemp.toFixed(1)}°C</div>
            <p className="text-muted-foreground">
              Rango: {stats.minTemp.toFixed(1)}°C - {stats.maxTemp.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Frecuencia de Registro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-emerald-600">Cada {recordingFrequency} min</div>
            <p className="text-muted-foreground">
              {historicalData.length} registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Estado General</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500">
              Óptimo
            </Badge>
            <p className="text-muted-foreground mt-2">
              Condiciones ideales
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráfica de Humedad</CardTitle>
          <CardDescription>Seguimiento del nivel de humedad en el tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval={Math.floor(historicalData.length / 8)}
              />
              <YAxis domain={[40, 80]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorHumidity)"
                name="Humedad (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráfica de Temperatura</CardTitle>
          <CardDescription>Seguimiento de la temperatura ambiental</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval={Math.floor(historicalData.length / 8)}
              />
              <YAxis domain={[18, 28]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="Temperatura (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparativa</CardTitle>
          <CardDescription>Humedad y temperatura en el mismo período</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval={Math.floor(historicalData.length / 8)}
              />
              <YAxis yAxisId="left" domain={[40, 80]} />
              <YAxis yAxisId="right" orientation="right" domain={[18, 28]} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Humedad (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="Temperatura (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}