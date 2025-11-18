import { useEffect, useRef, useState } from 'react';

interface SecureDocumentViewerProps {
  documentUrl: string;
  title: string;
  onClose: () => void;
}

export default function SecureDocumentViewer({ documentUrl, title, onClose }: SecureDocumentViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Prevenir clic derecho
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevenir teclas de captura
    const preventScreenshot = (e: KeyboardEvent) => {
      // Prevenir F12, Ctrl+Shift+I, Ctrl+U, Print Screen, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'a')
      ) {
        e.preventDefault();
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 2000);
        return false;
      }
    };

    // Detectar cambio de ventana/tab (posible captura)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 1000);
      }
    };

    // Prevenir selección de texto
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Detectar herramientas de desarrollador
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 3000);
      }
    };

    // Agregar event listeners
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventScreenshot);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);
    
    // Verificar herramientas de desarrollador cada segundo
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // CSS para prevenir selección
    if (viewerRef.current) {
      viewerRef.current.style.userSelect = 'none';
      viewerRef.current.style.webkitUserSelect = 'none';
      viewerRef.current.style.mozUserSelect = 'none';
      viewerRef.current.style.msUserSelect = 'none';
    }

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventScreenshot);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
      clearInterval(devToolsInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div 
          ref={viewerRef}
          className={`relative h-[70vh] overflow-auto ${isBlurred ? 'blur-lg' : ''}`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          {/* Overlay invisible para prevenir interacciones */}
          <div 
            className="absolute inset-0 z-10"
            style={{ 
              background: 'transparent',
              pointerEvents: isBlurred ? 'all' : 'none'
            }}
          />
          
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 text-6xl font-bold opacity-10 rotate-45">
              ANDRÉS ALMEIDA
            </div>
          </div>
          
          {documentUrl.endsWith('.pdf') ? (
            <iframe
              src={documentUrl}
              className="w-full h-full"
              style={{ border: 'none' }}
              title={title}
            />
          ) : (
            <img
              src={documentUrl}
              alt={title}
              className="w-full h-full object-contain"
              style={{ 
                pointerEvents: 'none',
                userSelect: 'none'
              }}
              draggable={false}
            />
          )}
        </div>
        
        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
            <div className="bg-red-600 text-white p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-xl font-bold mb-2">Acción No Permitida</h3>
              <p>Este documento está protegido contra capturas de pantalla</p>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            📄 Documento protegido - No se permiten capturas de pantalla
          </p>
        </div>
      </div>
    </div>
  );
}