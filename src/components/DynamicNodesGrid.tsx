import React, { useRef, useEffect, useState } from 'react';

// --- CONFIGURACIÓN CORPORATE TECH ---
const COLORS = {
  BLUE: '59, 130, 246',   // Royal Blue (#3B82F6) - Hero
  CYAN: '34, 211, 238',   // Cyberpunk Cyan (#22D3EE) - Circuit glow
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
  circuitDir: 'horizontal' | 'vertical';
  pulsePhase: number;
  isPulseNode: boolean; // Para nodos que pulsan en circuito
}

const DynamicNodesGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualMode, setVisualMode] = useState<VisualMode>('circuit');
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();

  // --- 1. DETECTOR DE SECCIONES ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
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

      // DENSIDAD REDUCIDA ~40% (15000 en lugar de 9000)
      const densityDivisor = window.innerWidth < 768 ? 8000 : 15000;
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
          pulsePhase: Math.random() * Math.PI * 2,
          isPulseNode: Math.random() < 0.15 // 15% son nodos que pulsan
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

      let targetColor = COLORS.BLUE;
      let connectionDist = 0;
      let speedMult = 1;
      let targetBaseSize = 2;

      if (visualMode === 'circuit') {
        targetColor = COLORS.BLUE;
        connectionDist = 120;
        speedMult = 1.2;
        targetBaseSize = 2;
      } else if (visualMode === 'network') {
        targetColor = COLORS.VIOLET;
        connectionDist = 140;
        speedMult = 0.6;
        targetBaseSize = 4;
      } else if (visualMode === 'floating') {
        targetColor = COLORS.BLUE;
        connectionDist = 0;
        speedMult = 0.2;
        targetBaseSize = 2;
      }

      particles.current.forEach((p, i) => {
        // --- A. TRANSICIONES SUAVES ---
        const sizeVariation = (Math.sin(p.pulsePhase) + 1) * 0.5;
        const finalTargetSize = visualMode === 'network'
          ? targetBaseSize + sizeVariation * 2
          : targetBaseSize;

        p.currentSize += (finalTargetSize - p.currentSize) * 0.05;
        p.pulsePhase += 0.05;
        p.colorRGB = targetColor;

        // --- B. MOVIMIENTO ---
        if (visualMode === 'circuit') {
          if (Math.random() < 0.01) {
            p.circuitDir = p.circuitDir === 'horizontal' ? 'vertical' : 'horizontal';
          }
          if (p.circuitDir === 'horizontal') {
            p.x += (p.vx > 0 ? 1 : -1) * speedMult;
          } else {
            p.y += (p.vy > 0 ? 1 : -1) * speedMult;
          }
        } else {
          p.x += p.vx * speedMult;
          p.y += p.vy * speedMult;
        }

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x -= dx * 0.01;
          p.y -= dy * 0.01;
        }

        // --- C. DIBUJADO DE NODOS ---
        // Efecto Cyberpunk en modo circuito
        if (visualMode === 'circuit' && p.isPulseNode) {
          const pulseIntensity = (Math.sin(p.pulsePhase * 2) + 1) * 0.5;
          // Glow exterior
          ctx.shadowBlur = 8 * pulseIntensity;
          ctx.shadowColor = `rgba(${COLORS.CYAN}, ${pulseIntensity * 0.8})`;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.currentSize * (1 + pulseIntensity * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLORS.CYAN}, ${0.6 + pulseIntensity * 0.4})`;
          ctx.fill();

          ctx.shadowBlur = 0;
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.colorRGB}, ${visualMode === 'network' ? 0.6 : 0.8})`;
          ctx.fill();
        }

        // --- D. CONEXIONES ---
        if (connectionDist > 0) {
          for (let j = i + 1; j < particles.current.length; j++) {
            const p2 = particles.current[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;

            if (Math.abs(dx) > connectionDist || Math.abs(dy) > connectionDist) continue;

            const distSq = dx * dx + dy * dy;
            if (distSq < connectionDist * connectionDist) {
              const dist = Math.sqrt(distSq);
              const alpha = 1 - dist / connectionDist;

              if (visualMode === 'circuit') {
                const alignmentThreshold = 2.0;
                if (Math.abs(dx) < alignmentThreshold || Math.abs(dy) < alignmentThreshold) {
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);

                  // Líneas con glow sutil si conectan nodos pulsantes
                  if (p.isPulseNode || p2.isPulseNode) {
                    ctx.strokeStyle = `rgba(${COLORS.CYAN}, ${alpha * 0.4})`;
                    ctx.lineWidth = 1.2;
                  } else {
                    ctx.strokeStyle = `rgba(${p.colorRGB}, ${alpha * 0.5})`;
                    ctx.lineWidth = 1;
                  }
                  ctx.stroke();
                }
              } else {
                // Patrón hexagonal sutil para redes
                const angle = Math.atan2(dy, dx);
                const hexBias = Math.abs(Math.sin(angle * 3)) > 0.7; // Favorece ángulos de 60°

                if (hexBias || Math.random() < 0.3) { // 30% de conexiones aleatorias
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = `rgba(${p.colorRGB}, ${alpha * 0.25})`;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
                }
              }
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

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