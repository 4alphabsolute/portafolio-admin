import { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Limpiar contenido previo por si acaso (react strict mode)
        container.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "feedMode": "all_symbols",
            "isTransparent": true,
            "displayMode": "regular",
            "width": "100%",
            "height": "500",
            "colorTheme": "light",
            "locale": "es",
            "largeChartUrl": "https://soyandresalmeida.com", // Tu web
            "customer": "andresalmeida" // Intentamos linkear a tu usuario si es posible en este widget
        });

        container.current.appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container w-full h-[500px] my-8 border border-gray-200 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <div className="tradingview-widget-container__widget" ref={container}></div>
            <div className="tradingview-widget-copyright text-center text-xs text-gray-500 py-2">
                <a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank">
                    <span className="text-[#2962FF]">TradingView</span>
                </a>
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
