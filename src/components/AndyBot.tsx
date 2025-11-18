import { useState } from 'react';

export default function AndyBot() {
  const [open, setOpen] = useState(false);
  const base = (import.meta.env.VITE_FLOWISE_URL as string) || 'http://localhost:3000';
  const canvasId = (import.meta.env.VITE_FLOWISE_CANVAS_ID as string) || '03fe25e4-9ea8-48fc-98ed-0bae9c814a41';
  const src = `${base}/canvas/${canvasId}`;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-[#0A66C2] text-white rounded-full p-3 shadow-lg hover:opacity-90"
          aria-label="AndyBot toggle"
        >
          {open ? 'Cerrar Bot' : 'AndyBot'}
        </button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
          <iframe src={src} className="w-full h-full" title="AndyBot" />
        </div>
      )}
    </>
  );
}
