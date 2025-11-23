import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  RealtimeSensorData,
  subscribeToRealtimeSensor,
  updateRealtimeSensorData,
} from '../lib/firebase/realtime';

export function useRealtimeSensor(user: User | null, orchidId: string | null) {
  const [sensorData, setSensorData] = useState<RealtimeSensorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orchidId) {
      setSensorData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Suscribirse a datos del sensor en tiempo real
    const unsubscribe = subscribeToRealtimeSensor(user.uid, orchidId, (data) => {
      setSensorData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, orchidId]);

  const updateSensorData = async (data: Omit<RealtimeSensorData, 'timestamp' | 'userId'>) => {
    if (!user) return;

    try {
      await updateRealtimeSensorData({
        ...data,
        timestamp: Date.now(),
        userId: user.uid,
      });
    } catch (err) {
      console.error('Error updating sensor data:', err);
      throw err;
    }
  };

  return {
    sensorData,
    loading,
    updateSensorData,
  };
}
