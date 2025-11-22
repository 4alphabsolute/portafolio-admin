import React, { useRef, useEffect, useState } from 'react';

// --- CONFIGURACIÓN CORPORATE TECH ---
const COLORS = {
  BLUE: '59, 130, 246',   // Royal Blue (#3B82F6) - Hero
  VIOLET: '124, 58, 237', // Corporate Violet (#7C3AED) - Network
};

type VisualMode = 'circuit' | 'network' | 'floating';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetSize: number;
  currentSize: number;
  colorRGB: string;
  circuitDir: 'horizontal' | 'vertical'; // Para modo circuito
  pulsePhase: number; // Para efectos de parpadeo
}

const DynamicNodesGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualMode, setVisualMode] = useState<VisualMode>('circuit');
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();

  // --- 1. DETECTOR DE SECCIONES (El Cerebro) ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          // Mapeo de secciones a modos visuales
          if (id === 'hero' || id === 'about') {
            setVisualMode('circuit');
          } else if (id === 'experience' || id === 'projects' || id === 'certifications') {
            setVisualMode('network');
          } else if (id === 'contact') {
            setVisualMode('floating');
          }
        }
      });
    }, { threshold: 0.25 });

    ['hero', 'about', 'experience', 'projects', 'certifications', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // --- 2. INICIALIZACIÓN ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Densidad Moderada/Baja (Limpieza > Saturación)
      // Desktop: 1 partícula cada 9000px² | Mobile: 1 cada 5000px²
      const densityDivisor = window.innerWidth < 768 ? 5000 : 9000;
      const count = Math.floor((canvas.width * canvas.height) / densityDivisor);

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          targetSize: 2,
          currentSize: 2,
          colorRGB: COLORS.BLUE,
          circuitDir: Math.random() > 0.5 ? 'horizontal' : 'vertical',
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
      particles.current = newParticles;
    };

    initParticles();

    // --- 3. BUCLE DE ANIMACIÓN ---
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Configuración según modo
      let targetColor = COLORS.BLUE;
      let connectionDist = 0;
      let speedMult = 1;
      let targetBaseSize = 2;

      if (visualMode === 'circuit') {
        targetColor = COLORS.BLUE;
        connectionDist = 100; // Conexiones largas pero estrictas
        speedMult = 1.2;      // Rápido y constante
        targetBaseSize = 2;   // Pequeños y precisos
      } else if (visualMode === 'network') {
        targetColor = COLORS.VIOLET;
        connectionDist = 150; // Red amplia
        speedMult = 0.6;      // Orgánico y suave
        targetBaseSize = 4;   // Grandes y pesados (3px-6px range logic below)
      } else if (visualMode === 'floating') {
        targetColor = COLORS.BLUE; // O Violeta, latente
        connectionDist = 0;   // Sin conexiones
        speedMult = 0.2;      // Muy lento
        targetBaseSize = 2;
      }

      particles.current.forEach((p, i) => {
        // --- A. TRANSICIONES SUAVES (LERP) ---
        // Tamaño
        const sizeVariation = (Math.sin(p.pulsePhase) + 1) * 0.5; // 0 a 1
        const finalTargetSize = visualMode === 'network'
          ? targetBaseSize + sizeVariation * 2 // 4px a 6px
          : targetBaseSize;

        p.currentSize += (finalTargetSize - p.currentSize) * 0.05;
        p.pulsePhase += 0.05;

        // Color (Simple switch for now, could be lerped but RGB string is tricky without parsing)
        p.colorRGB = targetColor;

        // --- B. MOVIMIENTO ---
        if (visualMode === 'circuit') {
          // Movimiento Manhattan (Robótico)
          // Cambio de dirección aleatorio pero poco frecuente
          if (Math.random() < 0.01) {
            p.circuitDir = p.circuitDir === 'horizontal' ? 'vertical' : 'horizontal';
          }

          if (p.circuitDir === 'horizontal') {
            p.x += (p.vx > 0 ? 1 : -1) * speedMult; // Velocidad constante
            // Corrección de Y para mantener líneas rectas perfectas
            // (Opcional: Snap to grid, pero por ahora solo no mover Y)
          } else {
            p.y += (p.vy > 0 ? 1 : -1) * speedMult;
          }
        } else {
          // Movimiento Orgánico (Network/Floating)
          p.x += p.vx * speedMult;
          p.y += p.vy * speedMult;
        }

        // Rebote
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Mouse (Sutil)
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x -= dx * 0.01;
          p.y -= dy * 0.01;
        }

        // --- C. DIBUJADO DE NODOS ---
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRGB}, ${visualMode === 'network' ? 0.6 : 0.8})`;
        ctx.fill();

        // --- D. CONEXIONES ---
        if (connectionDist > 0) {
          for (let j = i + 1; j < particles.current.length; j++) {
            const p2 = particles.current[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;

            // Optimización: Check rápido de caja
            if (Math.abs(dx) > connectionDist || Math.abs(dy) > connectionDist) continue;

            const distSq = dx * dx + dy * dy;
            if (distSq < connectionDist * connectionDist) {
              const dist = Math.sqrt(distSq);
              const alpha = 1 - dist / connectionDist;

              if (visualMode === 'circuit') {
                // Solo conectar si están alineados en X o Y (con margen de error)
                const alignmentThreshold = 2.0; // 2px de tolerancia
                if (Math.abs(dx) < alignmentThreshold || Math.abs(dy) < alignmentThreshold) {
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = `rgba(${p.colorRGB}, ${alpha * 0.5})`;
                  ctx.lineWidth = 1;
                  ctx.stroke();
                }
              } else {
                // Red Neuronal: Conexión directa
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${p.colorRGB}, ${alpha * 0.3})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Listeners
    const handleResize = () => initParticles();
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [visualMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default DynamicNodesGrid;