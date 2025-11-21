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

  // Matrices for Stencils
  const sqlGrid = [
    "01111100011111001100000",
    "11000110110001101100000",
    "11000000110001101100000",
    "01111100110001101100000",
    "00000110110011101100000",
    "11000110110001001100000",
    "01111100011111001111110"
  ];

  const mailGrid = [
    "1111111111111111111",
    "1100000000000000011",
    "1010000000000000101",
    "1001000000000001001",
    "1000100000000010001",
    "1000011000001100001",
    "1000000111110000001",
    "1111111111111111111"
  ];

  useEffect(() => {
    sectionRef.current = activeSection;
  }, [activeSection]);

  // Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "-10% 0px -10% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'hero') setActiveSection('hero');
          else if (id === 'about') setActiveSection('about'); // Same as hero
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
    const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#10B981', '#06B6D4'];

    const initNodes = () => {
      const density = (window.innerWidth * window.innerHeight) / 2500;
      const NODE_COUNT = Math.floor(density);

      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          size: 1 + Math.random(), // 1-2px Neon Stardust
          color: colors[Math.floor(Math.random() * colors.length)],
          baseColor: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.4 + Math.random() * 0.6,
          type: 'data',
          isAmbient: false // Will be set dynamically
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

    // --- Helper: Grid to Points ---
    const getGridPoints = (grid: string[], startX: number, startY: number, cellSize: number) => {
      const points = [];
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (grid[row][col] === '1') {
            points.push({
              x: startX + col * cellSize,
              y: startY + row * cellSize
            });
          }
        }
      }
      return points;
    };

    // --- Shape Generation ---
    const getShapePoints = (section: SectionState, width: number, height: number, count: number) => {
      let points: { x: number, y: number }[] = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const minDim = Math.min(width, height);

      if (section === 'hero' || section === 'about') {
        // Organic Swarm - No fixed targets, handled in animation loop
        return null;
      } else if (section === 'certifications') {
        // Marea (Tide) - Edges
        for (let i = 0; i < count; i++) {
          // Simple wave at bottom
          const x = (i / count) * width;
          const y = height - 50 + Math.sin(i * 0.1) * 20;
          points.push({ x, y });
        }
        // We only want a subset for the wave, rest ambient
        return points.slice(0, Math.floor(count * 0.4));

      } else if (section === 'experience') {
        const isMobile = width < 768;
        const cellSize = isMobile ? Math.min(width / 25, 15) : 18;

        // SQL (Left/Center)
        const sqlPoints = getGridPoints(sqlGrid, 0, 0, cellSize);
        // Center the grid
        const gridW = sqlGrid[0].length * cellSize;
        const gridH = sqlGrid.length * cellSize;

        let startX = isMobile ? centerX - gridW / 2 : width * 0.15;
        let startY = centerY - gridH / 2;

        const finalSqlPoints = sqlPoints.map(p => ({
          x: startX + p.x,
          y: startY + p.y
        }));

        points = [...finalSqlPoints];

        // </> (Right - Desktop Only)
        if (!isMobile) {
          // Hardcoded </> shape roughly
          const codePoints = [];
          const codeStartX = width * 0.75;
          const codeStartY = centerY;
          // <
          for (let i = 0; i < 10; i++) codePoints.push({ x: codeStartX - 20 + i * 5, y: codeStartY - i * 5 });
          for (let i = 0; i < 10; i++) codePoints.push({ x: codeStartX - 20 + i * 5, y: codeStartY + i * 5 });
          // /
          for (let i = 0; i < 15; i++) codePoints.push({ x: codeStartX + 10 + i * 2, y: codeStartY + 20 - i * 3 });
          // >
          for (let i = 0; i < 10; i++) codePoints.push({ x: codeStartX + 50 + i * 5, y: codeStartY - 50 + i * 5 }); // Fix logic later if needed, simplified
          // Better manual construction for </>
          // Just add some random points in that area for now to simulate it
          for (let i = 0; i < 50; i++) {
            points.push({ x: width * 0.75 + (Math.random() - 0.5) * 100, y: centerY + (Math.random() - 0.5) * 100 });
          }
        }
        return points;

      } else if (section === 'projects') {
        // Pie Chart
        const radius = minDim * 0.25;
        const totalPoints = Math.floor(count * 0.6); // Use 60% of nodes

        for (let i = 0; i < totalPoints; i++) {
          const angle = (i / totalPoints) * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * radius; // Uniform distribution in circle

          let x = centerX + Math.cos(angle) * r;
          let y = centerY + Math.sin(angle) * r;

          // Offset slice (0 to 60 degrees)
          const deg = (angle * 180) / Math.PI;
          if (deg > 0 && deg < 60) {
            x += 20;
            y -= 20;
          }
          points.push({ x, y });
        }
        return points;

      } else if (section === 'contact') {
        // Envelope
        const cellSize = Math.min(width / 25, 20);
        const mailPoints = getGridPoints(mailGrid, 0, 0, cellSize);
        const gridW = mailGrid[0].length * cellSize;
        const gridH = mailGrid.length * cellSize;

        const startX = centerX - gridW / 2;
        const startY = centerY - gridH / 2;

        const finalMailPoints = mailPoints.map(p => ({
          x: startX + p.x,
          y: startY + p.y
        }));
        return finalMailPoints;
      }

      return null;
    };

    // --- Animation Loop ---
    let time = 0;
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const currentSection = sectionRef.current;
      const targetPoints = getShapePoints(currentSection, canvas.width, canvas.height, nodes.length);

      // Assign targets
      let assignedCount = 0;
      if (targetPoints) {
        assignedCount = targetPoints.length;
      }

      nodes.forEach((node, i) => {
        // Determine if node is part of shape or ambient
        // If targetPoints exists and i < targetPoints.length, it's a shape node
        const isShape = targetPoints && i < targetPoints.length;
        node.isAmbient = !isShape;

        if (isShape && targetPoints) {
          node.targetX = targetPoints[i].x;
          node.targetY = targetPoints[i].y;
        } else {
          // Ambient / Swarm Behavior
          if (currentSection === 'hero' || currentSection === 'about') {
            // Organic Swarm
            const angle = time * 0.2 + (i * 0.1);
            const radius = 200 + Math.sin(time * 0.5 + i) * 50;
            node.targetX = canvas.width / 2 + Math.cos(angle) * radius * Math.sin(time * 0.1);
            node.targetY = canvas.height / 2 + Math.sin(angle) * radius;
          } else {
            // Floating Noise for other sections (Anti-Clumping)
            // Keep them away from center if possible, or just random float
            if (!node.isAmbient) {
              // Should not happen if logic is correct, but safety
              node.targetX = node.x; node.targetY = node.y;
            } else {
              // Float around
              node.targetX = node.x + Math.sin(time + i) * 20;
              node.targetY = node.y + Math.cos(time + i) * 20;
            }
          }
        }

        // Physics (Lerp for transitions)
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;

        // Aggressive Lerp for shape formation
        const lerpFactor = isShape ? 0.1 : 0.02; // Snap to shape, float otherwise

        node.x += dx * lerpFactor;
        node.y += dy * lerpFactor;

        // Mouse Repulsion (Subtle)
        const dxMouse = node.x - mouseRef.current.x;
        const dyMouse = node.y - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < 150) {
          const force = (150 - distMouse) / 150;
          node.x += (dxMouse / distMouse) * force * 5;
          node.y += (dyMouse / distMouse) * force * 5;
        }

        // Draw
        ctx.globalAlpha = node.opacity;
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
        mixBlendMode: 'screen' // Neon effect
      }}
    />
  );
}