import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CookieBannerProps {
  t: any;
}

export default function CookieBanner({ t }: CookieBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm flex-1">
          {t.cookies.message}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAccept}
            className="bg-[#0A66C2] hover:bg-[#094a8f] px-6 py-2 rounded-lg font-semibold transition"
          >
            {t.cookies.accept}
          </button>
          <button
            onClick={handleDecline}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-semibold transition"
          >
            {t.cookies.decline}
          </button>
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
