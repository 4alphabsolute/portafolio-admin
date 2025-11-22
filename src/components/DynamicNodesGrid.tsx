import React, { useRef, useEffect, useState } from 'react';

// --- CONFIGURACIÓN DE LA PALETA DE COLORES ---
// Basada en tu degradado: #7C3AED (Morado vibrante) y #60A5FA (Azul claro)
const THEME_COLOR_RGB = '124, 58, 237'; // El morado principal
const PULSE_COLOR_RGB = '96, 165, 250';  // Azul para "chispazos"

// Definimos los tipos de comportamiento visual
type VisualMode = 'circuit' | 'network' | 'floating';

interface Particle {
  x: number;
  y: number;
  vx: number; // Velocidad X
  vy: number; // Velocidad Y
  size: number;
  pulseTimer: number; // Para efectos de parpadeo en modo circuito
  circuitDir: 'horizontal' | 'vertical'; // Para restringir movimiento en circuito
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
          // Mapeamos las secciones a los modos visuales
          if (id === 'hero' || id === 'about') {
            setVisualMode('circuit');
          } else if (id === 'experience' || id === 'projects' || id === 'certifications') {
            setVisualMode('network');
          } else if (id === 'contact') {
            setVisualMode('floating');
          }
        }
      });
    }, { threshold: 0.3 }); // Detectar al 30% de visibilidad

    // IDs a observar (deben existir en App.tsx)
    ['hero', 'about', 'experience', 'projects', 'certifications', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // --- 2. INICIALIZACIÓN DEL CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Densidad media: suficiente para hacer redes, no demasiada para saturar
      const count = Math.floor((canvas.width * canvas.height) / 8000);

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // Velocidad base suave
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 1.5 + 0.5,
          pulseTimer: Math.random() * 100,
          circuitDir: Math.random() > 0.5 ? 'horizontal' : 'vertical'
        });
      }
      particles.current = newParticles;
    };

    initParticles();

    // --- 3. BUCLE DE ANIMACIÓN PRINCIPAL ---
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Ajustes según el modo actual
      let connectionDistance = 100;
      let speedMultiplier = 1;
      let baseOpacity = 0.3;
      let lineOpacityFactor = 0.15;

      if (visualMode === 'circuit') {
        speedMultiplier = 1.5; // Más rápido
        connectionDistance = 80; // Conexiones más cortas
        baseOpacity = 0.5;
      } else if (visualMode === 'network') {
        speedMultiplier = 0.8; // Velocidad media
        connectionDistance = 120; // Redes más amplias
      } else if (visualMode === 'floating') {
        speedMultiplier = 0.3; // Muy lento
        connectionDistance = 0; // Sin líneas (o casi invisibles)
        baseOpacity = 0.2;
      }

      // ACTUALIZAR Y DIBUJAR PUNTOS
      particles.current.forEach((p, i) => {
        p.pulseTimer++;

        // FÍSICA DEL MOVIMIENTO
        if (visualMode === 'circuit') {
          // Movimiento "Manhattan": Solo horizontal o vertical
          if (Math.random() < 0.02) { // Pequeña probabilidad de cambiar de dirección
            p.circuitDir = p.circuitDir === 'horizontal' ? 'vertical' : 'horizontal';
          }
          if (p.circuitDir === 'horizontal') p.x += p.vx * speedMultiplier * 2;
          else p.y += p.vy * speedMultiplier * 2;

        } else {
          // Movimiento orgánico normal
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;
        }

        // REBOTE EN BORDES
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // INTERACCIÓN CON MOUSE (Sutil repulsión)
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.x -= dx * 0.02;
          p.y -= dy * 0.02;
        }

        // DIBUJAR PUNTO
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Color base morado
        let color = `rgba(${THEME_COLOR_RGB}, ${baseOpacity})`;

        // Efecto "Chispazo" en modo circuito
        if (visualMode === 'circuit' && p.pulseTimer % 150 < 10) {
          color = `rgba(${PULSE_COLOR_RGB}, 0.8)`; // Destello azul
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgb(${PULSE_COLOR_RGB})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.fill();

        // DIBUJAR LÍNEAS (CONEXIONES)
        if (visualMode !== 'floating') {
          for (let j = i + 1; j < particles.current.length; j++) {
            const p2 = particles.current[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);

              if (visualMode === 'circuit') {
                // Estilo Circuito: Líneas rectas (Manhattan)
                // Solo dibujamos si están casi alineados horizontal o verticalmente
                if (Math.abs(dx) < 5 || Math.abs(dy) < 5) {
                  ctx.lineTo(p2.x, p2.y);
                  const opacity = (1 - dist / connectionDistance) * lineOpacityFactor * 2;
                  ctx.strokeStyle = `rgba(${THEME_COLOR_RGB}, ${opacity})`;
                  ctx.lineWidth = 1;
                  ctx.stroke();
                }
              } else {
                // Estilo Red Neuronal: Líneas directas
                ctx.lineTo(p2.x, p2.y);
                const opacity = (1 - dist / connectionDistance) * lineOpacityFactor;
                ctx.strokeStyle = `rgba(${THEME_COLOR_RGB}, ${opacity})`;
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

    // LISTENERS
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
      // z-0 para estar detrás, pointer-events-none para no bloquear clicks
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default DynamicNodesGrid;