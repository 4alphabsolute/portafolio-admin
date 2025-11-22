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
  behavior?: string;
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

    const getExclusionZones = () => {
      const zones = [];

      const heroImg = document.querySelector('img[alt*="Andrés"], img[alt*="profile"], .hero img, img');
      const heroTitle = document.querySelector('h1, .hero h1, [class*="hero"] h1');

      if (heroImg) {
        const rect = heroImg.getBoundingClientRect();
        zones.push({
          x: rect.left - 100,
          y: rect.top - 100,
          width: rect.width + 200,
          height: rect.height + 200,
          isHero: true
        });
      }

      if (heroTitle) {
        const rect = heroTitle.getBoundingClientRect();
        zones.push({
          x: rect.left - 80,
          y: rect.top - 40,
          width: rect.width + 160,
          height: rect.height + 80,
          isHero: true
        });
      }

      const textBlocks = document.querySelectorAll('h2, h3, .text-xl, .text-2xl, .text-3xl, .text-4xl');
      textBlocks.forEach(block => {
        const rect = block.getBoundingClientRect();
        if (rect.height > 20) {
          zones.push({
            x: rect.left - 40,
            y: rect.top - 15,
            width: rect.width + 80,
            height: rect.height + 30,
            isHero: false
          });
        }
      });

      const paragraphs = document.querySelectorAll('p');
      paragraphs.forEach(p => {
        const rect = p.getBoundingClientRect();
        if (rect.height > 40 && rect.width > 200) {
          zones.push({
            x: rect.left - 20,
            y: rect.top - 10,
            width: rect.width + 40,
            height: rect.height + 20,
            isHero: false
          });
        }
      });

      return zones;
    };

    const detectContentDensity = () => {
      const projects = document.querySelectorAll('.project-card, [class*="project"]').length;
      const certifications = document.querySelectorAll('.cert-card, [class*="cert"]').length;
      const experience = document.querySelectorAll('.experience-item, [class*="experience"]').length;

      return { projects, certifications, experience };
    };

    const getConfigForPosition = (scrollProgress: number) => {
      const density = detectContentDensity();
      if (scrollProgress < 0.2) {
        return {
          nodeCount: 14,
          colors: ['#0A66C2', '#3B82F6', '#60A5FA'],
          baseSize: 6,
          speed: 0.15,
          connectionDistance: 180,
          opacity: 0.7,
          respectZones: true,
          behavior: 'cybernetic'
        };
      }
      else if (scrollProgress < 0.4) {
        const t = (scrollProgress - 0.2) / 0.2;
        const certDensity = Math.max(density.certifications, 3);
        const nodeReduction = Math.min(certDensity / 2, 4);

        return {
          nodeCount: Math.floor(14 - nodeReduction - t * 4),
          colors: t < 0.5 ?
            ['#3B82F6', '#6B7280', '#9CA3AF'] :
            ['#6B7280', '#9CA3AF', '#D1D5DB'],
          baseSize: 6 - t * 2,
          speed: 0.15 - t * 0.08,
          connectionDistance: 180 - t * 60,
          opacity: 0.7 - t * 0.3,
          respectZones: true,
          behavior: 'transitioning'
        };
      }
      else if (scrollProgress < 0.6) {
        const expDensity = Math.max(density.experience, 2);
        const nodeCount = Math.max(8 - expDensity, 3);

        return {
          nodeCount,
          colors: ['#9CA3AF', '#D1D5DB', '#E5E7EB'],
          baseSize: Math.max(4 - expDensity * 0.2, 3),
          speed: 0.04,
          connectionDistance: 120,
          opacity: 0.4,
          respectZones: true,
          behavior: 'respectful'
        };
      }
      else if (scrollProgress < 0.8) {
        const t = (scrollProgress - 0.6) / 0.2;
        const projDensity = Math.max(density.projects, 2);

        const baseNodes = projDensity < 4 ? 10 : Math.max(12 - projDensity, 6);

        return {
          nodeCount: Math.floor(baseNodes + t * 2),
          colors: t < 0.5 ?
            ['#9CA3AF', '#8B5CF6', '#6366F1'] :
            ['#6366F1', '#8B5CF6', '#A78BFA'],
          baseSize: projDensity < 4 ? 4 + t * 1.5 : 3.5 + t * 1,
          speed: 0.04 + t * 0.06,
          connectionDistance: 120 + t * 40,
          opacity: 0.4 + t * 0.3,
          respectZones: true,
          behavior: 'awakening'
        };
      }
      else {
        return {
          nodeCount: 8,
          colors: ['#FFFFFF', '#FEF3C7', '#FDE68A', '#F3E8FF'],
          baseSize: 5,
          speed: 0.03,
          connectionDistance: 140,
          opacity: 0.8,
          respectZones: false,
          behavior: 'settled'
        };
      }
    };

    const getScrollProgress = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      return Math.min(scrollY / documentHeight, 1);
    };

    const isInExclusionZone = (x: number, y: number, zones: any[]) => {
      return zones.some(zone =>
        x >= zone.x && x <= zone.x + zone.width &&
        y >= zone.y && y <= zone.y + zone.height
      );
    };

    const nodes: Node[] = [];
    const createNodes = (config: any) => {
      const exclusionZones = config.respectZones ? getExclusionZones() : [];

      while (nodes.length > config.nodeCount) {
        nodes.pop();
      }

      while (nodes.length < config.nodeCount) {
        let x, y, attempts = 0;

        do {
          x = Math.random() * canvas.width;
          y = Math.random() * canvas.height;
          attempts++;
        } while (isInExclusionZone(x, y, exclusionZones) && attempts < 50);

        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          size: config.baseSize + Math.random() * 2,
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
          opacity: config.opacity + Math.random() * 0.1,
          type: 'data',
          pulse: Math.random() * Math.PI * 2,
          behavior: config.behavior || 'normal'
        });
      }
    };

    let currentConfig = getConfigForPosition(0);
    createNodes(currentConfig);

    const drawNeuralNode = (node: Node, breathe: number) => {
      const radius = node.size * breathe;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 1, 0, Math.PI * 2);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const scrollProgress = getScrollProgress();
      const currentConfig = getConfigForPosition(scrollProgress);

      if (Math.random() < 0.1) {
        createNodes(currentConfig);
      }

      const exclusionZones = currentConfig.respectZones ? getExclusionZones() : [];

      nodes.forEach((node, index) => {
        if (node.behavior === 'cybernetic') {
          node.pulse += 0.01;
          const variation = Math.sin(node.pulse) * 0.1;
          node.vx += variation * 0.005;
          node.vy += variation * 0.005;
        } else if (node.behavior === 'transitioning') {
          node.pulse += 0.008;
          const transition = Math.sin(node.pulse) * 0.05;
          node.vx += transition * 0.003;
          node.vy += transition * 0.003;
        } else if (node.behavior === 'respectful') {
          const futureX = node.x + node.vx * 10;
          const futureY = node.y + node.vy * 10;

          if (isInExclusionZone(futureX, futureY, exclusionZones)) {
            node.vx *= -0.8;
            node.vy *= -0.8;
            node.vx += (Math.random() - 0.5) * 0.02;
            node.vy += (Math.random() - 0.5) * 0.02;
          }
          node.pulse += 0.005;
        } else if (node.behavior === 'awakening') {
          node.pulse += 0.01;
          const awakening = Math.sin(node.pulse) * 0.08;
          node.vx += awakening * 0.004;
          node.vy += awakening * 0.004;
        } else if (node.behavior === 'settled') {
          node.pulse += 0.003;
          const settled = Math.sin(node.pulse) * 0.02;
          node.vx += settled * 0.001;
          node.vy += settled * 0.001;
        }

        // PERTURBACIÓN MUY SUTIL DEL MOUSE (casi imperceptible)
        const dxMouse = node.x - mouseRef.current.x;
        const dyMouse = node.y - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < 180) { // Radio más amplio pero fuerza mínima
          const force = (180 - distMouse) / 180;
          // Perturbación MÍNIMA - solo para sentir interactividad sin distracción
          node.vx += (dxMouse / distMouse) * force * 0.3;
          node.vy += (dyMouse / distMouse) * force * 0.3;
        }

        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // REPULSIÓN SUAVE PERO FIRME EN ZONAS HERO
        exclusionZones.forEach((zone: any) => {
          if (zone.isHero) {
            const zoneCenterX = zone.x + zone.width / 2;
            const zoneCenterY = zone.y + zone.height / 2;
            const dxZone = node.x - zoneCenterX;
            const dyZone = node.y - zoneCenterY;
            const distZone = Math.sqrt(dxZone * dxZone + dyZone * dyZone);
            const repelRadius = Math.max(zone.width, zone.height) / 2;

            if (distZone < repelRadius) {
              const repelForce = (repelRadius - distZone) / repelRadius;
              node.vx += (dxZone / distZone) * repelForce * 2;
              node.vy += (dyZone / distZone) * repelForce * 2;
            }
          }
        });

        const breathe = 1;

        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;
        drawNeuralNode(node, breathe);

        nodes.slice(index + 1).forEach(otherNode => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < currentConfig.connectionDistance) {
            const opacity = (currentConfig.connectionDistance - distance) / currentConfig.connectionDistance;
            let connectionOpacity = opacity * currentConfig.opacity * 0.6;

            const midX = (node.x + otherNode.x) / 2;
            const midY = (node.y + otherNode.y) / 2;

            if (!isInExclusionZone(midX, midY, exclusionZones)) {
              ctx.globalAlpha = connectionOpacity;
              ctx.strokeStyle = node.color;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      // La transición se maneja automáticamente en animate()
    };
    window.addEventListener('scroll', handleScroll);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
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