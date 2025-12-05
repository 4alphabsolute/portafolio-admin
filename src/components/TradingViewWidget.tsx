import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
    language?: 'es' | 'en';
    title?: string;
    subtitle?: string;
}

function TradingViewWidget({ language = 'es', title, subtitle }: TradingViewWidgetProps) {
    const container = useRef<HTMLDivElement>(null);
    const tickerContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Widget de Ticker Tape (Cinta de Cotizaciones) - Siempre visible y activo
        if (tickerContainer.current) {
            tickerContainer.current.innerHTML = '';
            const scriptTicker = document.createElement('script');
            scriptTicker.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
            scriptTicker.type = "text/javascript";
            scriptTicker.async = true;
            scriptTicker.innerHTML = JSON.stringify({
                "symbols": [
                    { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
                    { "proName": "FOREXCOM:NSXUSD", "title": "US 100" },
                    { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
                    { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
                    { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" }
                ],
                "showSymbolLogo": true,
                "colorTheme": "light",
                "isTransparent": true,
                "displayMode": "adaptive",
                "locale": language // Dynamic locale
            });
            tickerContainer.current.appendChild(scriptTicker);
        }

        // 2. Widget de Ideas del Usuario
        if (container.current) {
            container.current.innerHTML = '';
            const scriptIdeas = document.createElement('script');
            scriptIdeas.src = "https://s3.tradingview.com/external-embedding/embed-widget-ideas.js";
            scriptIdeas.type = "text/javascript";
            scriptIdeas.async = true;
            scriptIdeas.innerHTML = JSON.stringify({
                "width": "100%",
                "height": 600,
                "isTransparent": true,
                "colorTheme": "light",
                "locale": language, // Dynamic locale
                "username": "4alphabsolute",
                "sort": "recent",
                "time": "all",
                "showChart": true,
                "headerColor": "rgba(0, 0, 0, 1)",
                "borderColor": "#e0e3eb"
            });
            container.current.appendChild(scriptIdeas);
        }
    }, [language]); // Re-run when language changes

    return (
        <div className="w-full space-y-6">
            {/* Ticker Tape Superior */}
            <div className="w-full overflow-hidden bg-white/50 backdrop-blur-sm border-b border-gray-200">
                <div className="tradingview-widget-container" ref={tickerContainer}></div>
            </div>

            {/* Contenedor Principal de Ideas */}
            <div className="tradingview-widget-container w-full border border-gray-200 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden p-4">
                <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-800">{title || 'Análisis y Estrategias'}</h4>
                    <p className="text-gray-600">
                        {subtitle || 'Publicaciones recientes de'} <a href="https://es.tradingview.com/u/4alphabsolute/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">@4alphabsolute</a>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {language === 'es'
                            ? '(Si no ves la última idea, puede tardar unos minutos en actualizarse la caché de TradingView)'
                            : '(If you don\'t see the latest idea, it may take a few minutes for TradingView cache to update)'}
                    </p>
                </div>

                <div className="tradingview-widget-container__widget min-h-[500px]" ref={container}></div>

                <div className="text-center mt-4">
                    <a
                        href="https://es.tradingview.com/u/4alphabsolute/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-2 bg-[#2962FF] text-white rounded-full text-sm font-medium hover:bg-[#1E53E5] transition-colors shadow-md"
                    >
                        {language === 'es' ? 'Ver Perfil Completo en TradingView' : 'View Full Profile on TradingView'}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
