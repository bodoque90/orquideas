import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Droplets, Trash2, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useOrchids } from '../hooks/useOrchids';
import { createWateringRecord, getWateringRecords, WateringRecord } from '../lib/firebase/firestore';
import { toast } from 'sonner';

export function WateringCalendar() {
  const { user } = useFirebaseAuth();
  const { orchids, loading: orchidsLoading, editOrchid } = useOrchids(user);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [wateringRecords, setWateringRecords] = useState<WateringRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadWateringRecords = async () => {
      try {
        setLoading(true);
        const records = await getWateringRecords(user.uid);
        setWateringRecords(records);
      } catch (error) {
        console.error('Error loading watering records:', error);
        toast.error('Error al cargar registros de riego');
      } finally {
        setLoading(false);
      }
    };

    loadWateringRecords();
  }, [user]);

  const markAsWatered = async (orchidId: string, orchidName: string, orchidFrequency: number) => {
    if (!user) return;

    try {
      const now = new Date();
      const nextWatering = new Date(now);
      nextWatering.setDate(nextWatering.getDate() + orchidFrequency);

      // Create watering record
      const record = await createWateringRecord({
        orchidId,
        orchidName,
        date: now,
        userId: user.uid,
      });

      // Update orchid
      await editOrchid(orchidId, {
        lastWatered: now,
        nextWatering: nextWatering,
      });

      // Update local state
      setWateringRecords([...wateringRecords, record as WateringRecord]);
      
      toast.success(`${orchidName} regada exitosamente`);
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar riego');
    }
  };

  const getEventsForDate = (date: Date) => {
    return orchids.filter(orchid => {
      const nextWatering = new Date(orchid.nextWatering);
      return (
        nextWatering.getDate() === date.getDate() &&
        nextWatering.getMonth() === date.getMonth() &&
        nextWatering.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const modifiers = {
    watering: orchids.map(o => o.nextWatering),
  };

  const modifiersStyles = {
    watering: {
      backgroundColor: 'rgb(16 185 129)',
      color: 'white',
      fontWeight: 'bold',
    },
  };

  if (loading || orchidsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Riego</CardTitle>
          <CardDescription>
            Programa y gestiona el riego de tus orquídeas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Eventos del Día</CardTitle>
                <CardDescription>
                  {selectedDate?.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay eventos programados para este día
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(orchid => {
                  const isPast = orchid.nextWatering < new Date();
                  return (
                    <div
                      key={orchid.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Droplets className={`w-5 h-5 ${isPast ? 'text-red-500' : 'text-emerald-500'}`} />
                        <div>
                          <p>{orchid.name}</p>
                          <p className="text-muted-foreground">
                            Cada {orchid.wateringFrequency} días
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPast && (
                          <Badge variant="destructive">Vencido</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => orchid.id && markAsWatered(orchid.id, orchid.name, orchid.wateringFrequency)}
                        >
                          Regado
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Riegos</CardTitle>
          </CardHeader>
          <CardContent>
            {orchids.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay orquídeas registradas
              </p>
            ) : (
              <div className="space-y-2">
                {orchids
                  .sort((a, b) => a.nextWatering.getTime() - b.nextWatering.getTime())
                  .slice(0, 5)
                  .map(orchid => (
                    <div key={orchid.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span>{orchid.name}</span>
                      <span className="text-muted-foreground">
                        {orchid.nextWatering.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {wateringRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay registros de riego aún
              </p>
            ) : (
              <div className="space-y-2">
                {wateringRecords
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .slice(0, 10)
                  .map(record => (
                    <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span>{record.orchidName}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {record.date.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
