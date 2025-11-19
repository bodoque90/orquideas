import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Droplets, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface WateringEvent {
  id: string;
  orchidName: string;
  date: Date;
  frequency: number; // days
}

export function WateringCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [wateringEvents, setWateringEvents] = useState<WateringEvent[]>([
    {
      id: '1',
      orchidName: 'Phalaenopsis Rosa',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      frequency: 7,
    },
    {
      id: '2',
      orchidName: 'Cattleya Blanca',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      frequency: 6,
    },
    {
      id: '3',
      orchidName: 'Dendrobium Púrpura',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      frequency: 5,
    },
  ]);

  const [newOrchidName, setNewOrchidName] = useState('');
  const [newFrequency, setNewFrequency] = useState('7');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addWateringEvent = () => {
    if (!newOrchidName || !selectedDate) return;

    const newEvent: WateringEvent = {
      id: Date.now().toString(),
      orchidName: newOrchidName,
      date: selectedDate,
      frequency: parseInt(newFrequency),
    };

    setWateringEvents([...wateringEvents, newEvent]);
    setNewOrchidName('');
    setNewFrequency('7');
    setIsDialogOpen(false);
  };

  const deleteEvent = (id: string) => {
    setWateringEvents(wateringEvents.filter(e => e.id !== id));
  };

  const markAsWatered = (event: WateringEvent) => {
    const nextDate = new Date(event.date);
    nextDate.setDate(nextDate.getDate() + event.frequency);

    setWateringEvents(wateringEvents.map(e => 
      e.id === event.id ? { ...e, date: nextDate } : e
    ));
  };

  const getEventsForDate = (date: Date) => {
    return wateringEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const modifiers = {
    watering: wateringEvents.map(e => e.date),
  };

  const modifiersStyles = {
    watering: {
      backgroundColor: 'rgb(16 185 129)',
      color: 'white',
      fontWeight: 'bold',
    },
  };

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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Orquídea al Calendario</DialogTitle>
                    <DialogDescription>
                      Configura el calendario de riego para una nueva orquídea
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Orquídea</Label>
                      <Input
                        id="name"
                        placeholder="Ej: Phalaenopsis Rosa"
                        value={newOrchidName}
                        onChange={(e) => setNewOrchidName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frecuencia de Riego</Label>
                      <Select value={newFrequency} onValueChange={setNewFrequency}>
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
                  </div>
                  <Button onClick={addWateringEvent} className="w-full">
                    Agregar al Calendario
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay eventos programados para este día
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => {
                  const isPast = event.date < new Date();
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Droplets className={`w-5 h-5 ${isPast ? 'text-red-500' : 'text-emerald-500'}`} />
                        <div>
                          <p>{event.orchidName}</p>
                          <p className="text-muted-foreground">
                            Cada {event.frequency} días
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
                          onClick={() => markAsWatered(event)}
                        >
                          Regado
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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
            <div className="space-y-2">
              {wateringEvents
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span>{event.orchidName}</span>
                    <span className="text-muted-foreground">
                      {event.date.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
