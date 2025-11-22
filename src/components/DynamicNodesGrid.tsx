import { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  shape: 'circle' | 'rect';
  color: string;
  opacity: number;
}

type SectionState = 'hero' | 'certifications' | 'experience' | 'projects' | 'contact';

export default function DynamicNodesGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [activeSection, setActiveSection] = useState<SectionState>('hero');
  const sectionRef = useRef<SectionState>('hero');

  // Intersection Observer para detectar sección activa
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id as SectionState;
          if (['hero', 'about', 'certifications', 'experience', 'projects', 'contact'].includes(id)) {
            setActiveSection(id === 'about' ? 'hero' : id);
          }
        }
      });
    }, { threshold: 0.3 });

    ['hero', 'about', 'certifications', 'experience', 'projects', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    sectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes: Node[] = [];
    const NODE_COUNT = 80;

    const initNodes = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          targetX: canvas.width / 2,
          targetY: canvas.height / 2,
          size: Math.random() > 0.7 ? 3 : 2,
          shape: Math.random() > 0.8 ? 'rect' : 'circle',
          color: '#3B82F6',
          opacity: 0.6
        });
      }
    };

    initNodes();
    window.addEventListener('resize', initNodes);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Funciones para generar puntos objetivo según la sección
    const getTargetPoints = (section: SectionState, w: number, h: number): { x: number, y: number }[] => {
      const centerX = w / 2;
      const centerY = h / 2;
      const targets: { x: number, y: number }[] = [];

      if (section === 'hero') {
        // THE HALO - Órbita circular
        for (let i = 0; i < NODE_COUNT; i++) {
          const angle = (i / NODE_COUNT) * Math.PI * 2;
          const radius = Math.min(w, h) * 0.35;
          targets.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          });
        }
      } else if (section === 'certifications') {
        // THE FRAME - Marco en los bordes
        const margin = 50;
        const perSide = Math.floor(NODE_COUNT / 4);

        for (let i = 0; i < perSide; i++) {
          targets.push({ x: (i / perSide) * w, y: margin }); // Top
          targets.push({ x: (i / perSide) * w, y: h - margin }); // Bottom
          targets.push({ x: margin, y: (i / perSide) * h }); // Left
          targets.push({ x: w - margin, y: (i / perSide) * h }); // Right
        }
      } else if (section === 'experience') {
        // THE SHAPES - Símbolos R, BI, </>
        const scale = 15;
        const leftX = w * 0.2;
        const rightX = w * 0.8;
        const midY = h * 0.5;

        // Símbolo "R" a la izquierda (simplificado)
        const rPoints = [
          [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
          [1, 0], [2, 0], [2, 1], [1, 2], [2, 3], [2, 4]
        ];
        rPoints.forEach(([dx, dy]) => {
          targets.push({ x: leftX + dx * scale, y: midY - 30 + dy * scale });
        });

        // Símbolo "</>" a la derecha
        const codePoints = [
          [-2, 0], [-1, -1], [0, -2], [1, -1], [2, 0], // <
          [4, -2], [4, 2], // /
          [6, 0], [7, -1], [8, -2], [7, 1], [6, 0] // >
        ];
        codePoints.forEach(([dx, dy]) => {
          targets.push({ x: rightX + dx * scale, y: midY + dy * scale });
        });

      } else if (section === 'projects') {
        // THE TECH CONSTELLATION - Red densa
        for (let i = 0; i < NODE_COUNT; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * Math.min(w, h) * 0.4;
          targets.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          });
        }
      } else if (section === 'contact') {
        // HARMONIC WAITING - Símbolo @
        const radius = Math.min(w, h) * 0.15;
        for (let i = 0; i < NODE_COUNT; i++) {
          const angle = (i / NODE_COUNT) * Math.PI * 2;
          const r = i < NODE_COUNT * 0.6 ? radius : radius * 1.5;
          targets.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r
          });
        }
      }

      // Rellenar si faltan puntos
      while (targets.length < NODE_COUNT) {
        targets.push({ x: centerX, y: centerY });
      }

      return targets.slice(0, NODE_COUNT);
    };

    let time = 0;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const currentSection = sectionRef.current;
      const targetPoints = getTargetPoints(currentSection, canvas.width, canvas.height);

      nodes.forEach((node, i) => {
        // Asignar objetivo
        if (targetPoints[i]) {
          node.targetX = targetPoints[i].x;
          node.targetY = targetPoints[i].y;
        }

        // Física fluida con lerp suave
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          const speed = Math.min(dist * 0.02, 5);
          const steerX = (dx / dist) * speed - node.vx;
          const steerY = (dy / dist) * speed - node.vy;

          node.vx += steerX * 0.05;
          node.vy += steerY * 0.05;
        }

        // Efecto halo del mouse (perturbación magnética suave)
        const dxMouse = node.x - mouseRef.current.x;
        const dyMouse = node.y - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < 150) {
          const force = (150 - distMouse) / 150;
          node.vx += (dxMouse / distMouse) * force * 2;
          node.vy += (dyMouse / distMouse) * force * 2;
        }

        // Aplicar velocidad con fricción (efecto agua)
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.92;
        node.vy *= 0.92;

        // Dibujar nodo
        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;

        if (node.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(node.x - node.size, node.y - node.size, node.size * 2, node.size * 2);
        }

        // Conexiones (solo en projects para constelación tech)
        if (currentSection === 'projects') {
          nodes.slice(i + 1, i + 3).forEach(other => {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = node.color;
              ctx.lineWidth = 0.5;
              ctx.globalAlpha = (1 - dist / 100) * 0.3;
              ctx.stroke();
            }
          });
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', initNodes);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ background: 'transparent' }}
    />
  );
}