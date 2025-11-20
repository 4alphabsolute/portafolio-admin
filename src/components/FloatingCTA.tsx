import { useState, useEffect } from 'react';

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [currentCTA, setCurrentCTA] = useState(0);

  const ctas = [
    {
      text: "📊 ¿Necesitas análisis de datos?",
      action: "Consulta gratuita",
      color: "from-blue-600 to-blue-700",
      urgency: "Solo 3 slots disponibles esta semana"
    },
    {
      text: "💼 ¿Buscas un analista senior?",
      action: "Ver CV personalizado",
      color: "from-purple-600 to-purple-700",
      urgency: "Disponible para proyectos inmediatos"
    },
    {
      text: "🚀 ¿Quieres automatizar reportes?",
      action: "Hablemos",
      color: "from-green-600 to-green-700",
      urgency: "Implementación en 2 semanas"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setCurrentCTA((prev) => (prev + 1) % ctas.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!visible) return null;

  const cta = ctas[currentCTA];

  return (
    <div className="fixed bottom-24 left-4 z-40 max-w-xs">
      <div className={`bg-gradient-to-r ${cta.color} text-white rounded-lg shadow-xl p-4 transform transition-all duration-500 hover:scale-105`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-sm mb-1">{cta.text}</p>
            <p className="text-xs opacity-90 mb-3">{cta.urgency}</p>
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors">
              {cta.action}
            </button>
          </div>
          <button 
            onClick={() => setVisible(false)}
            className="text-white/70 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}