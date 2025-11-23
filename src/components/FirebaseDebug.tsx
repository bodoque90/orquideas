import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { auth, db, realtimeDb } from '../lib/firebase/config';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function FirebaseDebug() {
  const { user } = useFirebaseAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const results: DiagnosticResult[] = [];

    // 1. Check Firebase Configuration
    try {
      if (auth && db && realtimeDb) {
        results.push({
          name: 'Configuración de Firebase',
          status: 'success',
          message: 'Firebase inicializado correctamente',
          details: `App: ${auth.app.name}`,
        });
      } else {
        results.push({
          name: 'Configuración de Firebase',
          status: 'error',
          message: 'Firebase no está inicializado',
          details: 'Verifica src/lib/firebase.ts',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Configuración de Firebase',
        status: 'error',
        message: 'Error al verificar Firebase',
        details: error.message,
      });
    }

    // 2. Check Firebase Authentication
    try {
      if (auth) {
        results.push({
          name: 'Firebase Authentication',
          status: 'success',
          message: 'Auth inicializado',
          details: auth.currentUser ? `Usuario actual: ${auth.currentUser.email}` : 'Sin usuario',
        });
      } else {
        results.push({
          name: 'Firebase Authentication',
          status: 'error',
          message: 'Auth no disponible',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Firebase Authentication',
        status: 'error',
        message: 'Error en Auth',
        details: error.message,
      });
    }

    // 3. Check Firestore
    try {
      if (db) {
        results.push({
          name: 'Firestore Database',
          status: 'success',
          message: 'Firestore conectado',
          details: 'Base de datos principal operativa',
        });
      } else {
        results.push({
          name: 'Firestore Database',
          status: 'error',
          message: 'Firestore no disponible',
          details: 'Verifica que Firestore esté creado en Firebase Console',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Firestore Database',
        status: 'error',
        message: 'Error en Firestore',
        details: error.message,
      });
    }

    // 4. Check Realtime Database
    try {
      if (realtimeDb) {
        results.push({
          name: 'Realtime Database',
          status: 'success',
          message: 'Realtime DB conectado',
          details: 'Base de datos en tiempo real operativa',
        });
      } else {
        results.push({
          name: 'Realtime Database',
          status: 'error',
          message: 'Realtime DB no disponible',
          details: 'Verifica que Realtime Database esté creado en Firebase Console',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Realtime Database',
        status: 'error',
        message: 'Error en Realtime DB',
        details: error.message,
      });
    }

    // 5. Check User Authentication
    if (user) {
      results.push({
        name: 'Usuario Autenticado',
        status: 'success',
        message: `Usuario conectado: ${user.email}`,
        details: `UID: ${user.uid}`,
      });
    } else {
      results.push({
        name: 'Usuario Autenticado',
        status: 'warning',
        message: 'No hay usuario autenticado',
        details: 'Esto es normal si acabas de cargar la página',
      });
    }

    setDiagnostics(results);
    setIsChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">OK</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">ERROR</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">AVISO</Badge>;
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const allSuccess = diagnostics.every(d => d.status === 'success');

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🔍 Diagnóstico de Firebase
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={runDiagnostics}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Verificar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Summary */}
        {allSuccess && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>✅ Todo funcionando correctamente</span>
            </div>
          </div>
        )}
        
        {hasErrors && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span>⚠️ Se detectaron errores - revisa abajo</span>
            </div>
          </div>
        )}

        {/* Individual Diagnostics */}
        <div className="space-y-3">
          {diagnostics.map((diagnostic, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(diagnostic.status)}
                  <span>{diagnostic.name}</span>
                </div>
                {getStatusBadge(diagnostic.status)}
              </div>
              <div className="text-sm text-muted-foreground pl-8">
                <p>{diagnostic.message}</p>
                {diagnostic.details && (
                  <p className="text-xs mt-1 font-mono bg-gray-100 p-2 rounded">
                    {diagnostic.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-sm">
              <strong>👤 Usuario actual:</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Email: {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              UID: {user.uid}
            </p>
            {user.displayName && (
              <p className="text-sm text-muted-foreground">
                Nombre: {user.displayName}
              </p>
            )}
          </div>
        )}

        {/* Help Text */}
        {hasErrors && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="mb-2">
              <strong>💡 Pasos para resolver:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Abre la consola del navegador (F12)</li>
              <li>Ve a la pestaña "Console"</li>
              <li>Busca errores en rojo</li>
              <li>Verifica tu archivo <code>src/lib/firebase.ts</code></li>
              <li>Verifica que Firestore y Realtime Database estén creados en Firebase Console</li>
              <li>Verifica las reglas de seguridad en Firebase Console</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}