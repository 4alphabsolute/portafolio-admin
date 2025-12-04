import { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Limpiar contenido previo
        container.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "550",
            "colorTheme": "light",
            "isTransparent": true,
            "symbol": "NASDAQ:AAPL", // Placeholder inicial, pero el foco será el perfil abajo
            "locale": "es",
            "customer": "andresalmeida", // Tu usuario
            "showIdeas": true, // IMPORTANTE: Mostrar tus ideas
            "showChart": true
        });

        // NOTA: Para mostrar ESPECÍFICAMENTE solo tus ideas, el widget de "Ideas Stream" es mejor,
        // pero requiere configuración específica. Voy a usar una combinación o el widget de perfil si está disponible.
        // Como alternativa segura y visual, usaré el widget de "Symbol Overview" que permite ver gráficos,
        // pero para TU perfil específico, lo mejor es un enlace directo o el widget de "Mini Chart" con tus scripts si son públicos.

        // CAMBIO ESTRATÉGICO: Usar el widget de "Profile" (Perfil) es lo ideal, pero TradingView a veces restringe esto.
        // Voy a implementar un embed directo a tu perfil de ideas si es posible, o un widget de "Ticker Tape" arriba y tus ideas abajo.

        // Vamos a probar con el widget de IDEAS STREAM filtrado por usuario si la API lo permite, 
        // si no, usaremos el widget de Perfil Mini.

        // Reemplazo con el script de Perfil/Ideas Stream
        const scriptIdeas = document.createElement('script');
        scriptIdeas.src = "https://s3.tradingview.com/external-embedding/embed-widget-ideas.js";
        scriptIdeas.type = "text/javascript";
        scriptIdeas.async = true;
        scriptIdeas.innerHTML = JSON.stringify({
            "interval": "D",
            "width": "100%",
            "height": 500,
            "isTransparent": true,
            "colorTheme": "light",
            "locale": "es",
            "username": "andresalmeida", // FILTRO CLAVE: Tu usuario
            "sort": "recent"
        });

        container.current.appendChild(scriptIdeas);
    }, []);

    return (
        <div className="tradingview-widget-container w-full my-8 border border-gray-200 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden p-4">
            <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-700">Mis Ideas y Scripts en TradingView</h4>
                <p className="text-sm text-gray-500">Análisis técnico y estrategias Pine Script publicadas por @andresalmeida</p>
            </div>
            <div className="tradingview-widget-container__widget" ref={container}></div>
            <div className="tradingview-widget-copyright text-center text-xs text-gray-500 py-2">
                <a href="https://es.tradingview.com/u/andresalmeida/" rel="noopener nofollow" target="_blank">
                    <span className="text-[#2962FF]">Ver perfil completo en TradingView</span>
                </a>
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
