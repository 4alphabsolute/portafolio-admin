import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  type: 'data' | 'finance' | 'tech' | 'innovation';
  pulse: number;
}

export default function DynamicNodesGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Detectar zonas de exclusión (halos invisibles)
    const getExclusionZones = () => {
      const zones = [];
      const heroImg = document.querySelector('img[alt*="Andrés"], img[alt*="profile"], .hero img, img');
      const heroTitle = document.querySelector('h1, .hero h1, [class*="hero"] h1');

      if (heroImg) {
        const rect = heroImg.getBoundingClientRect();
        zones.push({
          x: rect.left - 80,
          y: rect.top - 80,
          width: rect.width + 160,
          height: rect.height + 160
        });
      }

      if (heroTitle) {
        const rect = heroTitle.getBoundingClientRect();
        zones.push({
          x: rect.left - 60,
          y: rect.top - 30,
          width: rect.width + 120,
          height: rect.height + 60
        });
      }
      return zones;
    };

    // Configuración de Flocking
    const FLOCK_CONFIG = {
      perceptionRadius: 100,
      separationDistance: 40,
      maxSpeed: 2,
      maxForce: 0.05,
      separationWeight: 1.5,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      mouseRepulsionRadius: 200,
      mouseRepulsionStrength: 2.0,
      boundaryMargin: 100,
      boundaryTurnFactor: 0.5
    };

    // Configuración visual por sección
    const getConfigForPosition = (scrollProgress: number) => {
      if (scrollProgress < 0.2) { // Hero
        return {
          nodeCount: 60,
          colors: ['#3B82F6', '#60A5FA', '#93C5FD'], // Azules claros
          baseSize: 3,
          opacity: 0.6
        };
      } else if (scrollProgress < 0.5) { // About/Exp
        return {
          nodeCount: 50,
          colors: ['#6366F1', '#8B5CF6', '#A78BFA'], // Violetas
          baseSize: 3,
          opacity: 0.5
        };
      } else { // Projects/Contact
        return {
          nodeCount: 40,
          colors: ['#10B981', '#34D399', '#6EE7B7'], // Verdes/Teal
          baseSize: 3,
          opacity: 0.5
        };
      }
    };

    const getScrollProgress = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      return Math.min(scrollY / documentHeight, 1);
    };

    // Inicializar nodos
    const nodes: Node[] = [];
    const initNodes = (config: any) => {
      // Ajustar cantidad de nodos suavemente
      if (nodes.length < config.nodeCount) {
        for (let i = nodes.length; i < config.nodeCount; i++) {
          nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * FLOCK_CONFIG.maxSpeed,
            vy: (Math.random() - 0.5) * FLOCK_CONFIG.maxSpeed,
            size: config.baseSize + Math.random() * 2,
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            opacity: 0, // Aparecen gradualmente
            type: 'data',
            pulse: Math.random() * Math.PI * 2
          });
        }
      } else if (nodes.length > config.nodeCount) {
        nodes.splice(config.nodeCount);
      }

      // Actualizar propiedades visuales gradualmente
      nodes.forEach(node => {
        if (node.opacity < config.opacity) node.opacity += 0.01;
        // Mezclar colores suavemente sería complejo, simplificamos reasignando ocasionalmente
        if (Math.random() < 0.01) {
          node.color = config.colors[Math.floor(Math.random() * config.colors.length)];
        }
      });
    };

    // --- Algoritmo de Boids (Flocking) ---

    const applyFlocking = (node: Node, index: number, exclusionZones: any[]) => {
      let separationX = 0, separationY = 0;
      let alignmentX = 0, alignmentY = 0;
      let cohesionX = 0, cohesionY = 0;
      let totalNeighbors = 0;

      nodes.forEach((other, otherIndex) => {
        if (index === otherIndex) return;

        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < FLOCK_CONFIG.perceptionRadius) {
          // Separation
          if (distance < FLOCK_CONFIG.separationDistance) {
            separationX -= dx / distance;
            separationY -= dy / distance;
          }

          // Alignment
          alignmentX += other.vx;
          alignmentY += other.vy;

          // Cohesion
          cohesionX += other.x;
          cohesionY += other.y;

          totalNeighbors++;
        }
      });

      if (totalNeighbors > 0) {
        // Normalizar y aplicar pesos
        alignmentX /= totalNeighbors;
        alignmentY /= totalNeighbors;
        cohesionX = (cohesionX / totalNeighbors) - node.x;
        cohesionY = (cohesionY / totalNeighbors) - node.y;

        // Limitar fuerzas
        const limitForce = (x: number, y: number, max: number) => {
          const mag = Math.sqrt(x * x + y * y);
          if (mag > max) {
            return { x: (x / mag) * max, y: (y / mag) * max };
          }
          return { x, y };
        };

        // Aplicar fuerzas
        node.vx += separationX * FLOCK_CONFIG.separationWeight * 0.05;
        node.vy += separationY * FLOCK_CONFIG.separationWeight * 0.05;

        node.vx += alignmentX * FLOCK_CONFIG.alignmentWeight * 0.05;
        node.vy += alignmentY * FLOCK_CONFIG.alignmentWeight * 0.05;

        const cohesionForce = limitForce(cohesionX, cohesionY, FLOCK_CONFIG.maxForce);
        node.vx += cohesionForce.x * FLOCK_CONFIG.cohesionWeight * 0.01;
        node.vy += cohesionForce.y * FLOCK_CONFIG.cohesionWeight * 0.01;
      }

      // Interacción con Mouse (Repulsión)
      const dxMouse = node.x - mouseRef.current.x;
      const dyMouse = node.y - mouseRef.current.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (distMouse < FLOCK_CONFIG.mouseRepulsionRadius) {
        const force = (FLOCK_CONFIG.mouseRepulsionRadius - distMouse) / FLOCK_CONFIG.mouseRepulsionRadius;
        node.vx += (dxMouse / distMouse) * force * FLOCK_CONFIG.mouseRepulsionStrength;
        node.vy += (dyMouse / distMouse) * force * FLOCK_CONFIG.mouseRepulsionStrength;
      }

      // Evitar zonas de exclusión (Halos)
      exclusionZones.forEach(zone => {
        const centerX = zone.x + zone.width / 2;
        const centerY = zone.y + zone.height / 2;
        const dxZone = node.x - centerX;
        const dyZone = node.y - centerY;
        const distZone = Math.sqrt(dxZone * dxZone + dyZone * dyZone);
        const maxDim = Math.max(zone.width, zone.height) / 1.5; // Radio aproximado

        if (distZone < maxDim) {
          const force = (maxDim - distZone) / maxDim;
          node.vx += (dxZone / distZone) * force * 1.5;
          node.vy += (dyZone / distZone) * force * 1.5;
        }
      });

      // Mantener dentro de los límites (Soft boundaries)
      const margin = FLOCK_CONFIG.boundaryMargin;
      if (node.x < margin) node.vx += FLOCK_CONFIG.boundaryTurnFactor;
      if (node.x > canvas.width - margin) node.vx -= FLOCK_CONFIG.boundaryTurnFactor;
      if (node.y < margin) node.vy += FLOCK_CONFIG.boundaryTurnFactor;
      if (node.y > canvas.height - margin) node.vy -= FLOCK_CONFIG.boundaryTurnFactor;

      // Limitar velocidad máxima
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > FLOCK_CONFIG.maxSpeed) {
        node.vx = (node.vx / speed) * FLOCK_CONFIG.maxSpeed;
        node.vy = (node.vy / speed) * FLOCK_CONFIG.maxSpeed;
      }

      // Actualizar posición
      node.x += node.vx;
      node.y += node.vy;
    };

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollProgress = getScrollProgress();
      const currentConfig = getConfigForPosition(scrollProgress);
      const exclusionZones = getExclusionZones();

      initNodes(currentConfig);

      nodes.forEach((node, index) => {
        applyFlocking(node, index, exclusionZones);

        // Dibujar nodo
        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar conexiones cercanas (Cardumen visual)
        nodes.slice(index + 1).forEach(other => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) { // Conexiones cortas para efecto de grupo
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = (1 - dist / 60) * node.opacity * 0.5;
            ctx.stroke();
          }
        });
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