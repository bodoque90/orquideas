import { ref, set, get, onValue, off, push, update, remove } from 'firebase/database';
import { realtimeDb } from './config';
import { query, limitToLast, orderByKey } from 'firebase/database';

// --- TIPOS DE DATOS ---

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

export interface UnclaimedSensor {
  id: string; 
  type: string;
  status: string;
}

// --- NUEVO: Interfaz Completa de Configuración ---
export interface SystemSettings {
  recordingFrequency: number;
  // Notificaciones
  pushNotifications: boolean;
  lowHumidityAlert: boolean;
  highTempAlert: boolean;
  wateringReminder: boolean;
  reminderTime: string;
  // Sensores
  autoReconnect: boolean;
  humidityCalibration: number;
  tempCalibration: number;
  // Preferencias
  tempUnit: string;
  autoWatering: boolean;
  darkMode: boolean;
  dataRetention: string;
}

// --- FUNCIONES DE SENSORES ---

export async function updateRealtimeSensorData(data: RealtimeSensorData) {
  try {
    const sensorRef = ref(realtimeDb, `sensors/${data.userId}/${data.orchidId}`);
    await set(sensorRef, { ...data, timestamp: Date.now() });
  } catch (error) {
    console.error('Error updating realtime sensor data:', error);
    throw error;
  }
}

export async function getRealtimeSensorData(userId: string, orchidId: string): Promise<RealtimeSensorData | null> {
  try {
    const sensorRef = ref(realtimeDb, `sensors/${userId}/${orchidId}`);
    const snapshot = await get(sensorRef);
    if (snapshot.exists()) return snapshot.val() as RealtimeSensorData;
    return null;
  } catch (error) {
    console.error('Error getting realtime sensor data:', error);
    throw error;
  }
}

export function subscribeToRealtimeSensor(userId: string, orchidId: string, callback: (data: RealtimeSensorData | null) => void) {
  const sensorRef = ref(realtimeDb, `sensors/${userId}/${orchidId}`);
  return onValue(sensorRef, (snapshot) => {
    if (snapshot.exists()) callback(snapshot.val() as RealtimeSensorData);
    else callback(null);
  });
}

export function subscribeToAllUserSensors(userId: string, callback: (sensors: RealtimeSensorData[]) => void) {
  const sensorsRef = ref(realtimeDb, `sensors/${userId}`);
  return onValue(sensorsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const sensorsArray = Object.values(data) as RealtimeSensorData[];
      callback(sensorsArray);
    } else callback([]);
  });
}

// --- FUNCIONES DE DESCUBRIMIENTO ---

export function findUnclaimedSensors(callback: (sensors: UnclaimedSensor[]) => void) {
  const refDb = ref(realtimeDb, 'unclaimed_sensors');
  return onValue(refDb, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const sensors = Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, ...value }));
      callback(sensors);
    } else callback([]);
  });
}

export async function claimSensor(sensorId: string, userId: string) {
  try {
    const sensorRef = ref(realtimeDb, `unclaimed_sensors/${sensorId}`);
    await update(sensorRef, { target_uid: userId });
    return true;
  } catch (error) {
    console.error("Error claiming sensor:", error);
    throw error;
  }
}

// --- FUNCIONES DE ALERTAS ---

export async function updateSensorStatus(userId: string, status: SensorStatus) {
  try {
    const statusRef = ref(realtimeDb, `sensorStatus/${userId}/${status.orchidId}`);
    await set(statusRef, { ...status, lastSeen: Date.now() });
  } catch (error) {
    console.error('Error updating sensor status:', error);
    throw error;
  }
}

export function subscribeToSensorStatus(userId: string, callback: (statuses: SensorStatus[]) => void) {
  const statusRef = ref(realtimeDb, `sensorStatus/${userId}`);
  return onValue(statusRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const statuses = Object.values(data) as SensorStatus[];
      callback(statuses);
    } else callback([]);
  });
}

export async function createAlert(userId: string, alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) {
  try {
    const alertsRef = ref(realtimeDb, `alerts/${userId}`);
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, { ...alert, id: newAlertRef.key, timestamp: Date.now(), read: false });
    return newAlertRef.key;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}

export function subscribeToAlerts(userId: string, callback: (alerts: Alert[]) => void) {
  const alertsRef = ref(realtimeDb, `alerts/${userId}`);
  return onValue(alertsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const alerts = Object.values(data) as Alert[];
      callback(alerts.sort((a, b) => b.timestamp - a.timestamp));
    } else callback([]);
  });
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

// --- FUNCIONES DE CONFIGURACIÓN ---

export async function updateSystemSettings(userId: string, settings: Partial<SystemSettings>) {
  try {
    const settingsRef = ref(realtimeDb, `settings/${userId}`);
    await update(settingsRef, settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

export function subscribeToSystemSettings(userId: string, callback: (settings: SystemSettings | null) => void) {
  const settingsRef = ref(realtimeDb, `settings/${userId}`);
  return onValue(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as SystemSettings);
    } else {
      // Valores por defecto si no hay configuración guardada
      callback({
        recordingFrequency: 60,
        pushNotifications: true,
        lowHumidityAlert: true,
        highTempAlert: true,
        wateringReminder: true,
        reminderTime: "08:00",
        autoReconnect: true,
        humidityCalibration: 0,
        tempCalibration: 0,
        tempUnit: 'celsius',
        autoWatering: false,
        darkMode: false,
        dataRetention: "90"
      });
    }
  });
}

// --- HISTORIAL ---

export interface HistoryDataPoint extends RealtimeSensorData {
  id: string; 
}

export function subscribeToSensorHistory(userId: string, sensorId: string, callback: (history: HistoryDataPoint[]) => void) {
  const historyRef = ref(realtimeDb, `history/${userId}/${sensorId}`);
  const recentHistoryQuery = query(historyRef, limitToLast(100));

  return onValue(recentHistoryQuery, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const historyArray = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: key,
        ...value
      })).sort((a, b) => a.timestamp - b.timestamp);
      callback(historyArray);
    } else callback([]);
  });
}