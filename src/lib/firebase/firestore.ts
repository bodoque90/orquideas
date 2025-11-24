import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// --- TIPOS DE DATOS ACTUALIZADOS ---
export interface Orchid {
  id?: string;
  name: string;
  species: string;
  location: string;
  sensorId?: string; // <--- ¡ESTO ES LO QUE FALTABA!
  wateringFrequency: number; // días
  lastWatered: Date;
  nextWatering: Date;
  humidity?: number;
  temperature?: number;
  light?: number;
  createdAt: Date;
  userId: string;
}

export interface WateringRecord {
  id?: string;
  orchidId: string;
  orchidName: string;
  date: Date;
  notes?: string;
  userId: string;
}

// ===== ORQUÍDEAS =====

export async function createOrchid(orchid: Omit<Orchid, 'id' | 'createdAt'>) {
  try {
    const orchidsRef = collection(db, 'orchids');
    const docRef = await addDoc(orchidsRef, {
      ...orchid,
      lastWatered: Timestamp.fromDate(orchid.lastWatered),
      nextWatering: Timestamp.fromDate(orchid.nextWatering),
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...orchid };
  } catch (error) {
    console.error('Error creating orchid:', error);
    throw error;
  }
}

export async function getOrchids(userId: string): Promise<Orchid[]> {
  try {
    const orchidsRef = collection(db, 'orchids');
    const q = query(orchidsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastWatered: data.lastWatered?.toDate(),
        nextWatering: data.nextWatering?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as Orchid;
    });
  } catch (error) {
    console.error('Error getting orchids:', error);
    throw error;
  }
}

export async function updateOrchid(orchidId: string, updates: Partial<Orchid>) {
  try {
    const orchidRef = doc(db, 'orchids', orchidId);
    const updateData: any = { ...updates };
    
    if (updates.lastWatered) {
      updateData.lastWatered = Timestamp.fromDate(updates.lastWatered);
    }
    if (updates.nextWatering) {
      updateData.nextWatering = Timestamp.fromDate(updates.nextWatering);
    }
    
    await updateDoc(orchidRef, updateData);
  } catch (error) {
    console.error('Error updating orchid:', error);
    throw error;
  }
}

export async function deleteOrchid(orchidId: string) {
  try {
    const orchidRef = doc(db, 'orchids', orchidId);
    await deleteDoc(orchidRef);
  } catch (error) {
    console.error('Error deleting orchid:', error);
    throw error;
  }
}

// ===== REGISTROS DE RIEGO =====

export async function createWateringRecord(record: Omit<WateringRecord, 'id'>) {
  try {
    const recordsRef = collection(db, 'wateringRecords');
    const docRef = await addDoc(recordsRef, {
      ...record,
      date: Timestamp.fromDate(record.date),
    });
    return { id: docRef.id, ...record };
  } catch (error) {
    console.error('Error creating watering record:', error);
    throw error;
  }
}

export async function getWateringRecords(userId: string, orchidId?: string): Promise<WateringRecord[]> {
  try {
    const recordsRef = collection(db, 'wateringRecords');
    let q = query(recordsRef, where('userId', '==', userId), orderBy('date', 'desc'));
    
    if (orchidId) {
      q = query(recordsRef, where('userId', '==', userId), where('orchidId', '==', orchidId), orderBy('date', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate(),
      } as WateringRecord;
    });
  } catch (error) {
    console.error('Error getting watering records:', error);
    throw error;
  }
}

// ===== SUSCRIPCIONES EN TIEMPO REAL =====

export function subscribeToOrchids(
  userId: string,
  callback: (orchids: Orchid[]) => void
) {
  const orchidsRef = collection(db, 'orchids');
  const q = query(orchidsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const orchids = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastWatered: data.lastWatered?.toDate(),
        nextWatering: data.nextWatering?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as Orchid;
    });
    callback(orchids);
  });
}