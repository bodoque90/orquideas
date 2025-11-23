import { ref, set, get, onValue, off, push, update, remove } from 'firebase/database';
import { realtimeDb } from './config';

// Tipos para datos en tiempo real
export interface RealtimeSensorData {
  orchidId: string;
  humidity: number;
  temperature: number;
  light: number;
  soilMoisture: number;
  timestamp: number;
  userId: string;
}

export interface SensorStatus {
  orchidId: string;
  connected: boolean;
  lastSeen: number;
  batteryLevel?: number;
}

// ===== DATOS DE SENSORES EN TIEMPO REAL =====

export async function updateRealtimeSensorData(data: RealtimeSensorData) {
  try {
    const sensorRef = ref(realtimeDb, `sensors/${data.userId}/${data.orchidId}`);
    await set(sensorRef, {
      ...data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error updating realtime sensor data:', error);
    throw error;
  }
}

export async function getRealtimeSensorData(
  userId: string,
  orchidId: string
): Promise<RealtimeSensorData | null> {
  try {
    const sensorRef = ref(realtimeDb, `sensors/${userId}/${orchidId}`);
    const snapshot = await get(sensorRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as RealtimeSensorData;
    }
    return null;
  } catch (error) {
    console.error('Error getting realtime sensor data:', error);
    throw error;
  }
}

export function subscribeToRealtimeSensor(
  userId: string,
  orchidId: string,
  callback: (data: RealtimeSensorData | null) => void
) {
  const sensorRef = ref(realtimeDb, `sensors/${userId}/${orchidId}`);
  
  const unsubscribe = onValue(sensorRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as RealtimeSensorData);
    } else {
      callback(null);
    }
  });
  
  return () => off(sensorRef);
}

// ===== ESTADO DE CONEXIÓN DE SENSORES =====

export async function updateSensorStatus(userId: string, status: SensorStatus) {
  try {
    const statusRef = ref(realtimeDb, `sensorStatus/${userId}/${status.orchidId}`);
    await set(statusRef, {
      ...status,
      lastSeen: Date.now(),
    });
  } catch (error) {
    console.error('Error updating sensor status:', error);
    throw error;
  }
}

export function subscribeToSensorStatus(
  userId: string,
  callback: (statuses: SensorStatus[]) => void
) {
  const statusRef = ref(realtimeDb, `sensorStatus/${userId}`);
  
  const unsubscribe = onValue(statusRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const statuses = Object.values(data) as SensorStatus[];
      callback(statuses);
    } else {
      callback([]);
    }
  });
  
  return () => off(statusRef);
}

// ===== ALERTAS Y NOTIFICACIONES =====

export interface Alert {
  id?: string;
  orchidId: string;
  orchidName: string;
  type: 'low_humidity' | 'high_temperature' | 'low_moisture' | 'watering_due';
  message: string;
  timestamp: number;
  read: boolean;
  userId: string;
}

export async function createAlert(userId: string, alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) {
  try {
    const alertsRef = ref(realtimeDb, `alerts/${userId}`);
    const newAlertRef = push(alertsRef);
    
    await set(newAlertRef, {
      ...alert,
      id: newAlertRef.key,
      timestamp: Date.now(),
      read: false,
    });
    
    return newAlertRef.key;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}

export function subscribeToAlerts(
  userId: string,
  callback: (alerts: Alert[]) => void
) {
  const alertsRef = ref(realtimeDb, `alerts/${userId}`);
  
  const unsubscribe = onValue(alertsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const alerts = Object.values(data) as Alert[];
      callback(alerts.sort((a, b) => b.timestamp - a.timestamp));
    } else {
      callback([]);
    }
  });
  
  return () => off(alertsRef);
}

export async function markAlertAsRead(userId: string, alertId: string) {
  try {
    const alertRef = ref(realtimeDb, `alerts/${userId}/${alertId}`);
    await update(alertRef, { read: true });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
}

export async function deleteAlert(userId: string, alertId: string) {
  try {
    const alertRef = ref(realtimeDb, `alerts/${userId}/${alertId}`);
    await remove(alertRef);
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
}
