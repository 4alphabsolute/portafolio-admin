import { useState, useEffect } from 'react';

export default function TrustIndicators() {
  const [currentIndicator, setCurrentIndicator] = useState(0);

  const indicators = [
    { icon: '🏆', text: 'MBA en curso - EUDE', color: '#0A66C2' },
    { icon: '🏦', text: 'Experiencia Banesco', color: '#059669' },
    { icon: '📊', text: 'Power BI Certificado', color: '#6366F1' },
    { icon: '⚡', text: 'Respuesta < 24h', color: '#DC2626' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndicator((prev) => (prev + 1) % indicators.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-40 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-lg">{indicators[currentIndicator].icon}</span>
        <span 
          className="font-medium transition-colors duration-300"
          style={{ color: indicators[currentIndicator].color }}
        >
          {indicators[currentIndicator].text}
        </span>
      </div>
      <div className="flex gap-1 mt-2">
        {indicators.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-4 rounded-full transition-all duration-300 ${
              index === currentIndicator ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}