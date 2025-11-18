import { useState, useEffect } from 'react';

export default function SimpleAdmin() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <a 
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Volver al Portafolio
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-6">🔧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Panel en Desarrollo
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            El panel de administración está siendo configurado. Mientras tanto, puedes:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Ver Analytics</h3>
              <p className="text-blue-700 text-sm mb-4">Revisa las métricas de tu portafolio</p>
              <a 
                href="/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
              >
                Ir a Dashboard
              </a>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Contacto Directo</h3>
              <p className="text-green-700 text-sm mb-4">Para gestión de contenido</p>
              <a 
                href="mailto:soyandresalmeida@gmail.com"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block"
              >
                Enviar Email
              </a>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 text-sm">
              💡 <strong>Próximamente:</strong> Gestión de certificados, subida de documentos y más funcionalidades
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}