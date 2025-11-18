import { useState } from 'react';
import { migrateJSONToFirebase, checkMigrationStatus } from '../utils/dataManager';

export default function MigrationButton() {
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const handleMigration = async () => {
    setMigrating(true);
    
    // Verificar si ya se migró
    const alreadyMigrated = await checkMigrationStatus();
    if (alreadyMigrated) {
      alert('Los datos ya fueron migrados anteriormente');
      setMigrated(true);
      setMigrating(false);
      return;
    }

    // Ejecutar migración
    const success = await migrateJSONToFirebase();
    
    if (success) {
      alert('✅ Migración completada! Todos los datos del JSON ahora están en Firebase y se pueden editar desde el panel de admin.');
      setMigrated(true);
    } else {
      alert('❌ Error en la migración. Revisa la consola para más detalles.');
    }
    
    setMigrating(false);
  };

  if (migrated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Datos migrados exitosamente a Firebase
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Migración de datos requerida
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Tus datos están actualmente en un archivo JSON estático. Para poder editarlos completamente desde el panel de admin, necesitas migrarlos a Firebase.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleMigration}
              disabled={migrating}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 text-sm font-medium"
            >
              {migrating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Migrando...
                </>
              ) : (
                'Migrar datos a Firebase'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}