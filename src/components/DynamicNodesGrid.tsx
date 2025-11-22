import { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  baseColor: string;
  opacity: number;
  type: 'data' | 'finance' | 'tech' | 'innovation';
  isAmbient: boolean;
}

type SectionState = 'hero' | 'about' | 'certifications' | 'experience' | 'projects' | 'contact';

export default function DynamicNodesGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [activeSection, setActiveSection] = useState<SectionState>('hero');
  const sectionRef = useRef<SectionState>('hero');
  const isExplodingRef = useRef(false);

  useEffect(() => {
    if (sectionRef.current !== activeSection) {
      isExplodingRef.current = true;
      setTimeout(() => {
        isExplodingRef.current = false;
      }, 200);
    }
    sectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "-10% 0px -10% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'hero') setActiveSection('hero');
          else if (id === 'about') setActiveSection('about');
          else if (id === 'certifications') setActiveSection('certifications');
          else if (id === 'experience') setActiveSection('experience');
          else if (id === 'projects') setActiveSection('projects');
          else if (id === 'contact') setActiveSection('contact');
        }
      });
    }, observerOptions);

    const sections = ['hero', 'about', 'certifications', 'experience', 'projects', 'contact'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes: Node[] = [];

    // Paleta de colores que cambia según la sección
    const heroColors = ['#3B82F6', '#6366F1', '#8B5CF6', '#60A5FA', '#94A3B8']; // Azul/Gris
    const bottomColors = ['#8B5CF6', '#A78BFA', '#C084FC', '#FBBF24', '#F59E0B']; // Morado/Amarillo
    const whiteAccent = '#F8FAFC'; // Blanco aislado

    const initNodes = () => {
      const density = (window.innerWidth * window.innerHeight) / 2000;
      const NODE_COUNT = Math.floor(density);

      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const isAmbient = Math.random() < 0.3;
        const isWhiteAccent = Math.random() < 0.1; // 10% blancos

        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          size: 1 + Math.random() * 0.5,
          color: isWhiteAccent ? whiteAccent : heroColors[Math.floor(Math.random() * heroColors.length)],
          baseColor: isWhiteAccent ? whiteAccent : heroColors[Math.floor(Math.random() * heroColors.length)],
          opacity: 0.6,
          type: 'data',
          isAmbient
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const currentSection = sectionRef.current;
      const isExploding = isExplodingRef.current;

      const shapeNodes = nodes.filter(n => !n.isAmbient);
      const ambientNodes = nodes.filter(n => n.isAmbient);

      // Transición de colores según sección
      let targetPalette = heroColors;
      if (currentSection === 'projects' || currentSection === 'contact') {
        targetPalette = bottomColors;
      }

      // Actualizar nodos de forma
      shapeNodes.forEach((node, i) => {
        // Transición suave de color
        if (Math.random() < 0.05 && node.baseColor !== whiteAccent) {
          node.color = targetPalette[Math.floor(Math.random() * targetPalette.length)];
        }

        // Movimiento orbital en hero
        if (currentSection === 'hero' || currentSection === 'about') {
          const angle = time * 0.2 + (i * 0.1);
          const radius = 200 + Math.sin(time * 0.5 + i) * 50;
          node.targetX = canvas.width / 2 + Math.cos(angle) * radius * Math.sin(time * 0.1);
          node.targetY = canvas.height / 2 + Math.sin(angle) * radius;
        } else {
          // Movimiento más libre en otras secciones
          node.targetX = canvas.width / 2 + Math.cos(time * 0.3 + i) * 300;
          node.targetY = canvas.height / 2 + Math.sin(time * 0.3 + i) * 300;
        }

        if (isExploding) {
          node.targetX += (Math.random() - 0.5) * 800;
          node.targetY += (Math.random() - 0.5) * 800;
        }

        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const speed = dist < 100 ? (dist / 100) * 8 : 8;
        const steerX = (dx / dist) * speed - node.vx;
        const steerY = (dy / dist) * speed - node.vy;

        node.vx += steerX * 0.1;
        node.vy += steerY * 0.1;

        const dxMouse = node.x - mouseRef.current.x;
        const dyMouse = node.y - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < 150) {
          const force = (150 - distMouse) / 150;
          node.vx += (dxMouse / distMouse) * force * 3;
          node.vy += (dyMouse / distMouse) * force * 3;
        }

        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.90;
        node.vy *= 0.90;

        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Conexiones de red neuronal
        shapeNodes.slice(i + 1, i + 3).forEach(other => {
          const dX = node.x - other.x;
          const dY = node.y - other.y;
          if (Math.abs(dX) < 50 && Math.abs(dY) < 50) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 0.2;
            ctx.globalAlpha = 0.1;
            ctx.stroke();
          }
        });
      });

      // Nodos ambientes flotando
      ambientNodes.forEach(node => {
        if (Math.random() < 0.05 && node.baseColor !== whiteAccent) {
          node.color = targetPalette[Math.floor(Math.random() * targetPalette.length)];
        }

        node.targetX = node.x + Math.sin(time + node.x) * 20;
        node.targetY = node.y + Math.cos(time + node.y) * 20;

        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;

        node.vx += dx * 0.001;
        node.vy += dy * 0.001;

        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.95;
        node.vy *= 0.95;

        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        ctx.globalAlpha = node.opacity * 0.5;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{
        background: 'transparent',
        mixBlendMode: 'multiply'
      }}
    />
  );
}