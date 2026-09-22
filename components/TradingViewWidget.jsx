'use client';

import { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol }) {
  const container = useRef(null);
  const loadedFor = useRef(null);

  useEffect(() => {
    if (!container.current || !symbol) return;
    if (loadedFor.current === symbol) return;
    loadedFor.current = symbol;

    container.current.innerHTML = '';

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.height = '100%';
    inner.style.width = '100%';
    container.current.appendChild(inner);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Europe/Rome',
      theme: 'light',
      style: '1',
      locale: 'it',
      allow_symbol_change: true,
      hide_side_toolbar: false,
      withdateranges: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div style={{ height: '900px', width: '100%' }}>
      <div
        ref={container}
        className="tradingview-widget-container"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

export default memo(TradingViewWidget);
