import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from './config';

// ===== AUTENTICACIÓN CON EMAIL/PASSWORD =====

export async function signUp(email: string, password: string, displayName?: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// ===== AUTENTICACIÓN CON GOOGLE =====

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

// ===== RESET DE CONTRASEÑA =====

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

// ===== OBSERVADOR DE ESTADO DE AUTENTICACIÓN =====

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ===== OBTENER USUARIO ACTUAL =====

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ===== MENSAJES DE ERROR EN ESPAÑOL =====

function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de red. Verifica tu conexión',
    'auth/popup-closed-by-user': 'Ventana de autenticación cerrada',
  };
  
  return errorMessages[errorCode] || 'Error de autenticación. Intenta nuevamente';
}
