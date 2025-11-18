// Manejo de errores de Firebase para evitar páginas en blanco
import { FirebaseError } from 'firebase/app';

export interface FirebaseErrorHandler {
  handleError: (error: any, fallbackData?: any) => any;
  isFirebaseError: (error: any) => boolean;
  getErrorMessage: (error: any) => string;
}

export const createFirebaseErrorHandler = (): FirebaseErrorHandler => {
  const handleError = (error: any, fallbackData: any = null) => {
    console.error('Firebase Error:', error);
    
    // Si es un error de Firebase, usar datos de fallback
    if (isFirebaseError(error)) {
      return fallbackData;
    }
    
    // Para otros errores, también usar fallback
    return fallbackData;
  };

  const isFirebaseError = (error: any): boolean => {
    return error instanceof FirebaseError || 
           (error?.code && typeof error.code === 'string' && error.code.startsWith('firebase/'));
  };

  const getErrorMessage = (error: any): string => {
    if (isFirebaseError(error)) {
      switch (error.code) {
        case 'firebase/network-request-failed':
          return 'Error de conexión. Mostrando datos locales.';
        case 'firebase/permission-denied':
          return 'Sin permisos. Usando datos de respaldo.';
        case 'firebase/unavailable':
          return 'Servicio no disponible. Modo offline activado.';
        default:
          return 'Error temporal. Usando datos locales.';
      }
    }
    return 'Error desconocido. Continuando con datos de respaldo.';
  };

  return { handleError, isFirebaseError, getErrorMessage };
};

// Hook para usar en componentes
export const useFirebaseErrorHandler = () => {
  return createFirebaseErrorHandler();
};