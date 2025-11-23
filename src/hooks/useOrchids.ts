import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Orchid,
  getOrchids,
  createOrchid,
  updateOrchid,
  deleteOrchid,
  subscribeToOrchids,
} from '../lib/firebase/firestore';

export function useOrchids(user: User | null) {
  const [orchids, setOrchids] = useState<Orchid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrchids([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToOrchids(user.uid, (updatedOrchids) => {
      setOrchids(updatedOrchids);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addOrchid = async (orchid: Omit<Orchid, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;

    try {
      setError(null);
      const newOrchid = await createOrchid({
        ...orchid,
        userId: user.uid,
      });
      return newOrchid;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const editOrchid = async (orchidId: string, updates: Partial<Orchid>) => {
    try {
      setError(null);
      await updateOrchid(orchidId, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeOrchid = async (orchidId: string) => {
    try {
      setError(null);
      await deleteOrchid(orchidId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    orchids,
    loading,
    error,
    addOrchid,
    editOrchid,
    removeOrchid,
  };
}
