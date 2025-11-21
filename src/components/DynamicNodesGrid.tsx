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
}

type SectionState = 'hero' | 'about' | 'certifications' | 'experience' | 'projects' | 'contact';

export default function DynamicNodesGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [activeSection, setActiveSection] = useState<SectionState>('hero');
  const sectionRef = useRef<SectionState>('hero');
  const isExplodingRef = useRef(false);

  // Update ref when state changes
  useEffect(() => {
    if (sectionRef.current !== activeSection) {
      isExplodingRef.current = true;
      setTimeout(() => {
        isExplodingRef.current = false;
      }, 400);
    }
    sectionRef.current = activeSection;
  }, [activeSection]);

  // Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "-20% 0px -20% 0px"
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
    const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#10B981', '#60A5FA'];

    const initNodes = () => {
      const density = (window.innerWidth * window.innerHeight) / 4000;
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
          size: 0.5 + Math.random() * 1.5, // Micro-particles
          color: colors[Math.floor(Math.random() * colors.length)],
          baseColor: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.1 + Math.random() * 0.4,
          type: 'data'
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

    // --- Shape Generation ---
    const getShapePoints = (shape: string, width: number, height: number, count: number) => {
      const points = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const minDim = Math.min(width, height);

      if (shape === 'dodecahedron') { // Hero/About
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const r = minDim * 0.3 + Math.sin(angle * 6) * 20; // Star-like
          points.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r
          });
        }
      } else if (shape === 'frame') { // Certifications
        for (let i = 0; i < count; i++) {
          const perimeter = (width + height) * 2;
          const pos = (i / count) * perimeter;
          let x, y;
          if (pos < width) { x = pos; y = 0; }
          else if (pos < width + height) { x = width; y = pos - width; }
          else if (pos < width * 2 + height) { x = width - (pos - (width + height)); y = height; }
          else { x = 0; y = height - (pos - (width * 2 + height)); }

          // Organic offset
          const offset = Math.sin(i * 0.1) * 50;
          if (x === 0 || x === width) x += offset;
          else y += offset;

          points.push({ x, y });
        }
      } else if (shape === 'code') { // Experience
        const isMobile = width < 768;
        const offsetX = isMobile ? 0 : width * 0.25; // Shift right on desktop

        for (let i = 0; i < count; i++) {
          const t = i / count;
          let x, y;

          if (t < 0.33) { // <
            const localT = t / 0.33;
            x = centerX + offsetX - 100 + localT * 50;
            y = centerY - 50 + Math.abs(localT - 0.5) * 100;
          } else if (t < 0.66) { // /
            const localT = (t - 0.33) / 0.33;
            x = centerX + offsetX + (localT - 0.5) * 50;
            y = centerY + (0.5 - localT) * 100;
          } else { // >
            const localT = (t - 0.66) / 0.34;
            x = centerX + offsetX + 50 + localT * 50;
            y = centerY - 50 + Math.abs(localT - 0.5) * 100;
          }

          // Cloud effect
          x += (Math.random() - 0.5) * 30;
          y += (Math.random() - 0.5) * 30;
          points.push({ x, y });
        }
      } else if (shape === 'constellation') { // Projects
        // Random distributed points covering screen
        for (let i = 0; i < count; i++) {
          points.push({
            x: Math.random() * width,
            y: Math.random() * height
          });
        }
      } else if (shape === 'at-symbol') { // Contact
        for (let i = 0; i < count; i++) {
          const t = (i / count) * Math.PI * 4;
          const scale = minDim * 0.05;

          if (i < count * 0.3) { // Inner circle
            const angle = (i / (count * 0.3)) * Math.PI * 2;
            const r = scale * 3;
            points.push({
              x: centerX + Math.cos(angle) * r,
              y: centerY + Math.sin(angle) * r
            });
          } else { // Spiral
            const angle = ((i - count * 0.3) / (count * 0.7)) * Math.PI * 2.5 + Math.PI;
            const r = scale * 4 + (angle * scale * 0.8);
            points.push({
              x: centerX + Math.cos(angle) * r,
              y: centerY + Math.sin(angle) * r
            });
          }
        }
      }
      return points;
    };

    // --- Animation Loop ---
    let time = 0;
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const currentSection = sectionRef.current;
      const isExploding = isExplodingRef.current;
      let targetPoints: { x: number, y: number }[] = [];

      // Determine targets
      if (currentSection === 'hero' || currentSection === 'about') {
        targetPoints = getShapePoints('dodecahedron', canvas.width, canvas.height, nodes.length);
      } else if (currentSection === 'certifications') {
        targetPoints = getShapePoints('frame', canvas.width, canvas.height, nodes.length);
      } else if (currentSection === 'experience') {
        targetPoints = getShapePoints('code', canvas.width, canvas.height, nodes.length);
      } else if (currentSection === 'projects') {
        targetPoints = getShapePoints('constellation', canvas.width, canvas.height, nodes.length);
      } else if (currentSection === 'contact') {
        targetPoints = getShapePoints('at-symbol', canvas.width, canvas.height, nodes.length);
      }

      // Update Physics
      nodes.forEach((node, i) => {
        // Target assignment
        if (targetPoints[i]) {
          if (currentSection === 'hero' || currentSection === 'about') {
            // Rotate hero shape
            const x = targetPoints[i].x - canvas.width / 2;
            const y = targetPoints[i].y - canvas.height / 2;
            const angle = time * 0.2;
            node.targetX = canvas.width / 2 + x * Math.cos(angle) - y * Math.sin(angle);
            node.targetY = canvas.height / 2 + x * Math.sin(angle) + y * Math.cos(angle);
          } else {
            node.targetX = targetPoints[i].x;
            node.targetY = targetPoints[i].y;
          }
        }

        // Explosion effect
        if (isExploding) {
          node.targetX += (Math.random() - 0.5) * 500;
          node.targetY += (Math.random() - 0.5) * 500;
        }

        // Physics
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const speed = dist < 100 ? (dist / 100) * 2 : 2;
        const steerX = (dx / dist) * speed - node.vx;
        const steerY = (dy / dist) * speed - node.vy;

        node.vx += steerX * 0.05;
        node.vy += steerY * 0.05;

        // Mouse Repulsion
        const dxMouse = node.x - mouseRef.current.x;
        const dyMouse = node.y - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < 150) {
          const force = (150 - distMouse) / 150;
          node.vx += (dxMouse / distMouse) * force * 2;
          node.vy += (dyMouse / distMouse) * force * 2;
        }

        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.95;
        node.vy *= 0.95;

        // Draw
        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Minimal connections
        if (currentSection === 'projects') { // Only connect in constellation mode
          nodes.slice(i + 1, i + 5).forEach(other => { // Limit checks
            const dX = node.x - other.x;
            const dY = node.y - other.y;
            const d = Math.sqrt(dX * dX + dY * dY);
            if (d < 50) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = node.color;
              ctx.lineWidth = 0.2;
              ctx.globalAlpha = 0.1;
              ctx.stroke();
            }
          });
        }
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