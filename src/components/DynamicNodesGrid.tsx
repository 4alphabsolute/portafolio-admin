import React, { useRef, useEffect, useState } from 'react';

// --- MATRICES DE GRILLA (Plantillas "Stencil") ---
// 1 = Punto, 0 = Vacío. Diseñadas para verse "Bold".

const SQL_GRID = [
  "01111100011111001100000",
  "11000110110001101100000",
  "11000000110001101100000",
  "01111100110001101100000",
  "00000110110011101100000",
  "11000110110001001100000",
  "01111100011111001111110"
];

const CODE_GRID = [
  "00110000001100",
  "01100000000110",
  "11000011000011",
  "01100000000110",
  "00110000001100"
];

const MAIL_GRID = [
  "111111111111111111111",
  "110000000000000000011",
  "101000000000000000101",
  "100100000000000001001",
  "100010000000000010001",
  "100001000000000100001",
  "100000100000001000001",
  "100000010000010000001",
  "100000001111100000001",
  "111111111111111111111"
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number | null;
  targetY: number | null;
  baseX: number; // Para el modo orgánico
  baseY: number; // Para el modo orgánico
  angle: number; // Para orbitar
  speed: number;
  size: number;
}

const DynamicNodesGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });

  // --- 1. DETECCIÓN DE SECCIONES ---
  useEffect(() => {
    const sections = ['hero', 'about', 'certifications', 'experience', 'projects', 'contact'];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Si estamos en 'about', tratamos como 'hero' para continuidad
          const id = entry.target.id === 'about' ? 'hero' : entry.target.id;
          console.log("Cambio de sección a:", id);
          setActiveSection(id);
        }
      });
    }, { threshold: 0.25 }); // 25% visible para cambiar

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // --- 2. CONFIGURACIÓN DEL CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Función para mapear grilla a puntos
    const mapGridToTargets = (grid: string[], offsetX: number, offsetY: number, scale: number) => {
      const targets: { x: number, y: number }[] = [];
      grid.forEach((row, rowIndex) => {
        for (let i = 0; i < row.length; i++) {
          if (row[i] === '1') {
            targets.push({
              x: offsetX + (i * scale),
              y: offsetY + (rowIndex * scale)
            });
          }
        }
      });
      return targets;
    };

    // Inicializar Partículas
    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // DENSIDAD: Más alta en desktop, ajustada en móvil
      const densityDivisor = window.innerWidth < 768 ? 4000 : 2500;
      const count = Math.floor((canvas.width * canvas.height) / densityDivisor);

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          targetX: null,
          targetY: null,
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          angle: Math.random() * Math.PI * 2,
          speed: 0.002 + Math.random() * 0.003,
          size: Math.random() * 1.5 + 0.5 // Burbujas pequeñas
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
      const isMobile = w < 768;

      // Calcular Targets según la sección
      let currentTargets: { x: number, y: number }[] = [];

      if (activeSection === 'experience') {
        // MODO GRILLA: SQL + CODE
        const scale = isMobile ? 8 : 12; // Tamaño de puntos
        // SQL a la izquierda (o centro en móvil)
        const sqlX = isMobile ? (w / 2 - (SQL_GRID[0].length * scale) / 2) : w * 0.15;
        const sqlY = h * 0.5 - (SQL_GRID.length * scale) / 2;
        currentTargets = mapGridToTargets(SQL_GRID, sqlX, sqlY, scale);

        // Code </> a la derecha (solo desktop)
        if (!isMobile) {
          const codeX = w * 0.75;
          const codeY = h * 0.5 - (CODE_GRID.length * scale) / 2;
          const codeTargets = mapGridToTargets(CODE_GRID, codeX, codeY, scale);
          currentTargets = [...currentTargets, ...codeTargets];
        }

      } else if (activeSection === 'projects') {
        // MODO GEOMETRÍA: Tarta Cortada
        const radius = Math.min(w, h) * 0.20;
        const centerX = w * 0.5;
        const centerY = h * 0.5;
        // Generamos un círculo denso
        const pointsInPie = 300;
        for (let i = 0; i < pointsInPie; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * radius; // Distribución uniforme

          let x = centerX + Math.cos(angle) * r;
          let y = centerY + Math.sin(angle) * r;

          // EL CORTE: Si está entre 0 y 60 grados, moverlo lejos
          if (angle > 0 && angle < Math.PI / 3) {
            x += 30;
            y += 30;
          }
          currentTargets.push({ x, y });
        }

      } else if (activeSection === 'contact') {
        // MODO GRILLA: Sobre
        const scale = isMobile ? 8 : 14;
        const mailX = w * 0.5 - (MAIL_GRID[0].length * scale) / 2;
        const mailY = h * 0.5 - (MAIL_GRID.length * scale) / 2;
        currentTargets = mapGridToTargets(MAIL_GRID, mailX, mailY, scale);
      }

      // Si estamos en Hero, currentTargets queda vacío (Modo Orgánico)

      // ACTUALIZAR PARTÍCULAS
      particles.current.forEach((p, i) => {

        // MODO HÉROE (Orgánico / Google Style)
        if (activeSection === 'hero' || activeSection === 'about') {
          // Movimiento orbital con ruido
          const orbitRadius = Math.min(w, h) * 0.35 + Math.cos(Date.now() * 0.001 + i) * 50;
          p.targetX = w / 2 + Math.cos(p.angle + Date.now() * p.speed) * orbitRadius;
          p.targetY = h / 2 + Math.sin(p.angle + Date.now() * p.speed) * orbitRadius * 0.8; // Un poco achatado

          // Repulsión del mouse fuerte en Hero
          const dx = p.x - mouse.current.x;
          const dy = p.y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const angle = Math.atan2(dy, dx);
            p.targetX += Math.cos(angle) * 100;
            p.targetY += Math.sin(angle) * 100;
          }
        }
        // MODO FORMAS (Structured)
        else {
          if (i < currentTargets.length) {
            // Asignar a un punto de la grilla
            p.targetX = currentTargets[i].x;
            p.targetY = currentTargets[i].y;
          } else {
            // ANTI-CLUMPING: Si sobran, flotan libres (Ambiente)
            // Usamos ruido Perlin simple para que no se queden quietos
            p.targetX = p.baseX + Math.cos(Date.now() * 0.0005 + i) * 50;
            p.targetY = p.baseY + Math.sin(Date.now() * 0.0005 + i) * 50;
          }
        }

        // FÍSICA DE MOVIMIENTO (LERP)
        if (p.targetX !== null && p.targetY !== null) {
          // Lerp factor: 0.05 para suavidad, 0.1 para rapidez
          p.x += (p.targetX - p.x) * 0.06;
          p.y += (p.targetY - p.y) * 0.06;
        }

        // DIBUJAR
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Color Azul/Violeta corporativo con opacidad
        ctx.fillStyle = `rgba(99, 102, 241, ${activeSection === 'hero' ? 0.6 : 0.8})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    // Event Listeners
    const handleResize = () => initParticles();
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeSection]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }} // Sutil
    />
  );
};

export default DynamicNodesGrid;
