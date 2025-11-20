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

    // Detectar zonas de exclusión (halos invisibles) - MEJORADO
    const getExclusionZones = () => {
      const zones = [];

      // Hero: Foto y nombre con halos más grandes
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

      // Bloques de texto importantes con halos
      const textBlocks = document.querySelectorAll('h2, h3, .text-xl, .text-2xl, .text-3xl, .text-4xl');
      textBlocks.forEach(block => {
        const rect = block.getBoundingClientRect();
        if (rect.height > 20) {
          zones.push({
            x: rect.left - 40,
            y: rect.top - 15,
            width: rect.width + 80,
            height: rect.height + 30
          });
        }
      });

      // Contenido de párrafos largos
      const paragraphs = document.querySelectorAll('p');
      paragraphs.forEach(p => {
        const rect = p.getBoundingClientRect();
        if (rect.height > 40 && rect.width > 200) {
          zones.push({
            x: rect.left - 20,
            y: rect.top - 10,
            width: rect.width + 40,
            height: rect.height + 20
          });
        }
      });

      return zones;
    };

    // Detectar densidad de contenido por sección
    const detectContentDensity = () => {
      const projects = document.querySelectorAll('.project-card, [class*="project"]').length;
      const certifications = document.querySelectorAll('.cert-card, [class*="cert"]').length;
      const experience = document.querySelectorAll('.experience-item, [class*="experience"]').length;

      return { projects, certifications, experience };
    };

    // Configuración inteligente basada en contenido
    const getConfigForPosition = (scrollProgress: number) => {
      const density = detectContentDensity();
      // Hero (0-20%): Estilo cibernético/simulación IA
      if (scrollProgress < 0.2) {
        return {
          nodeCount: 14,
          colors: ['#0A66C2', '#3B82F6', '#60A5FA'],
          baseSize: 6,
          speed: 0.15, // Lento pero constante
          connectionDistance: 180, // Conexiones más largas
          opacity: 0.7,
          respectZones: true,
          behavior: 'cybernetic'
        };
      }
      // About/Certificaciones (20-40%): Transición suave
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
      // Experiencia (40-60%): Muy calmados y respetuosos
      else if (scrollProgress < 0.6) {
        const expDensity = Math.max(density.experience, 2);
        const nodeCount = Math.max(8 - expDensity, 3);

        return {
          nodeCount,
          colors: ['#9CA3AF', '#D1D5DB', '#E5E7EB'],
          baseSize: Math.max(4 - expDensity * 0.2, 3),
          speed: 0.04, // Muy lentos
          connectionDistance: 120, // Conexiones visibles
          opacity: 0.4,
          respectZones: true,
          behavior: 'respectful'
        };
      }
      // Proyectos (60-80%): Transición hacia violetas
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
      // Contacto (80-100%): Asentados y expectantes
      else {
        return {
          nodeCount: 8, // Pocos nodos asentados
          colors: ['#FFFFFF', '#FEF3C7', '#FDE68A', '#F3E8FF'],
          baseSize: 5, // Sin pulsaciones
          speed: 0.03, // Muy lentos, asentados
          connectionDistance: 140, // Conexiones más visibles
          opacity: 0.8,
          respectZones: false,
          behavior: 'settled' // Asentados
        };
      }
    };

    // Detectar progreso de scroll para transición fluida
    const getScrollProgress = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      return Math.min(scrollY / documentHeight, 1);
    };

    // Verificar si un punto está en zona de exclusión
    const isInExclusionZone = (x: number, y: number, zones: any[]) => {
      return zones.some(zone =>
        x >= zone.x && x <= zone.x + zone.width &&
        y >= zone.y && y <= zone.y + zone.height
      );
    };

    // Crear nodos inteligentes que respetan contenido
    const nodes: Node[] = [];
    const createNodes = (config: any) => {
      const exclusionZones = config.respectZones ? getExclusionZones() : [];

      // Ajustar cantidad gradualmente
      while (nodes.length > config.nodeCount) {
        nodes.pop();
      }

      while (nodes.length < config.nodeCount) {
        let x, y, attempts = 0;

        // Intentar encontrar posición que no interfiera con contenido
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

    // Inicializar con configuración por defecto
    let currentConfig = getConfigForPosition(0);
    createNodes(currentConfig);

    // Nodos circulares tipo red neuronal/base de datos
    const drawNeuralNode = (node: Node, breathe: number) => {
      const radius = node.size * breathe;

      // Núcleo del nodo
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Anillo exterior sutil
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

      // Transición fluida basada en scroll
      const scrollProgress = getScrollProgress();
      const currentConfig = getConfigForPosition(scrollProgress);

      // Actualizar nodos gradualmente
      if (Math.random() < 0.1) { // Solo actualizar ocasionalmente
        createNodes(currentConfig);
      }

      // Animar nodos con comportamientos especiales
      const exclusionZones = currentConfig.respectZones ? getExclusionZones() : [];

      nodes.forEach((node, index) => {
        // Comportamientos cibernéticos suaves
        if (node.behavior === 'cybernetic') {
          // Hero: Movimiento constante tipo simulación IA
          node.pulse += 0.01;
          // Movimiento lineal con pequeñas variaciones
          const variation = Math.sin(node.pulse) * 0.1;
          node.vx += variation * 0.005;
          node.vy += variation * 0.005;
        } else if (node.behavior === 'transitioning') {
          // Transición suave
          node.pulse += 0.008;
          const transition = Math.sin(node.pulse) * 0.05;
          node.vx += transition * 0.003;
          node.vy += transition * 0.003;
        } else if (node.behavior === 'respectful') {
          // RESPETO ESTRICTO de zonas de exclusión
          const futureX = node.x + node.vx * 10; // Predecir posición
          const futureY = node.y + node.vy * 10;

          if (isInExclusionZone(futureX, futureY, exclusionZones)) {
            // Cambiar dirección suavemente
            node.vx *= -0.8;
            node.vy *= -0.8;
            // Añadir desviación
            node.vx += (Math.random() - 0.5) * 0.02;
            node.vy += (Math.random() - 0.5) * 0.02;
          }
          node.pulse += 0.005;
        } else if (node.behavior === 'awakening') {
          // Despertar muy gradual
          node.pulse += 0.01;
          const awakening = Math.sin(node.pulse) * 0.08;
          node.vx += awakening * 0.004;
          node.vy += awakening * 0.004;
        } else if (node.behavior === 'settled') {
          // Asentados: movimiento mínimo
          node.pulse += 0.003;
          const settled = Math.sin(node.pulse) * 0.02;
          node.vx += settled * 0.001;
          node.vy += settled * 0.001;
        }

        // Movimiento básico
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        // Rebote en bordes
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Sin pulsaciones - estilo cibernético limpio
        const breathe = 1; // Sin efectos de respiración

        // Dibujar nodo neuronal
        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;
        drawNeuralNode(node, breathe);

        // Conexiones dinámicas
        nodes.slice(index + 1).forEach(otherNode => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < currentConfig.connectionDistance) {
            // Conexiones más visibles y harmónicas
            const opacity = (currentConfig.connectionDistance - distance) / currentConfig.connectionDistance;
            let connectionOpacity = opacity * currentConfig.opacity * 0.6; // Más visibles

            // Verificar que la conexión no pase por zonas de exclusión
            const midX = (node.x + otherNode.x) / 2;
            const midY = (node.y + otherNode.y) / 2;

            if (!isInExclusionZone(midX, midY, exclusionZones)) {
              ctx.globalAlpha = connectionOpacity;
              ctx.strokeStyle = node.color;
              ctx.lineWidth = 1.2; // Líneas más gruesas
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

    // Scroll listener para transición fluida
    const handleScroll = () => {
      // La transición se maneja automáticamente en animate()
    };
    window.addEventListener('scroll', handleScroll);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
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