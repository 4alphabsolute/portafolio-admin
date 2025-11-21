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
  const sectionRef = useRef<SectionState>('hero'); // Ref for animation loop access

  // Update ref when state changes
  useEffect(() => {
    sectionRef.current = activeSection;
  }, [activeSection]);

  // Intersection Observer to detect active section
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2, // Trigger when 20% visible
      rootMargin: "-20% 0px -20% 0px" // Focus on center of screen
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'home') setActiveSection('hero');
          else if (id === 'about') setActiveSection('about');
          else if (id === 'certifications') setActiveSection('certifications');
          else if (id === 'experience') setActiveSection('experience');
          else if (id === 'projects') setActiveSection('projects');
          else if (id === 'contact') setActiveSection('contact');
        }
      });
    }, observerOptions);

    const sections = ['home', 'about', 'certifications', 'experience', 'projects', 'contact'];
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

    // --- Configuration ---
    const NODE_COUNT = 60;
    const MAX_SPEED = 2;
    const MAX_FORCE = 0.05;
    const MOUSE_REPULSION_RADIUS = 150;
    const MOUSE_REPULSION_STRENGTH = 2.0;
    const DAMPING = 0.95; // Friction

    // --- Shape Generation Helpers ---
    const getShapePoints = (shape: string, width: number, height: number, count: number) => {
      const points = [];
      const centerX = width / 2;
      const centerY = height / 2;

      if (shape === 'circle') {
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const radius = Math.min(width, height) * 0.3;
          points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          });
        }
      } else if (shape === 'edges') {
        for (let i = 0; i < count; i++) {
          const side = i % 2 === 0 ? 'left' : 'right';
          const x = side === 'left' ? width * 0.1 : width * 0.9;
          const y = (i / count) * height;
          // Add sine wave offset
          const wave = Math.sin((y / height) * Math.PI * 4) * 50;
          points.push({ x: x + wave, y });
        }
      } else if (shape === 'tech-icons') {
        // Simplified "R" and "BI" or Code symbols
        // Distribute points into 3 groups: Left (Code), Center (Empty), Right (Data)
        for (let i = 0; i < count; i++) {
          if (i < count / 2) {
            // Left side: </> shape abstract
            const x = width * 0.15 + Math.random() * 100;
            const y = height * 0.3 + (i / (count / 2)) * height * 0.4;
            points.push({ x, y });
          } else {
            // Right side: Data clusters
            const x = width * 0.85 + (Math.random() - 0.5) * 100;
            const y = height * 0.3 + Math.random() * height * 0.4;
            points.push({ x, y });
          }
        }
      } else if (shape === 'grid') {
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const cellW = width / (cols + 1);
        const cellH = height / (rows + 1);
        for (let i = 0; i < count; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          points.push({
            x: (col + 1) * cellW,
            y: (row + 1) * cellH
          });
        }
      } else if (shape === 'infinity') {
        for (let i = 0; i < count; i++) {
          const t = (i / count) * Math.PI * 2;
          const scale = Math.min(width, height) * 0.25;
          const x = centerX + (scale * Math.sqrt(2) * Math.cos(t)) / (Math.sin(t) * Math.sin(t) + 1);
          const y = centerY + (scale * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) / (Math.sin(t) * Math.sin(t) + 1);
          points.push({ x, y });
        }
      }
      return points;
    };

    // --- Initialization ---
    const nodes: Node[] = [];
    const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#10B981'];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.5,
        type: 'data'
      });
    }

    // --- Animation Loop ---
    let time = 0;
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const currentSection = sectionRef.current;
      let targetPoints: { x: number, y: number }[] = [];

      // Determine targets based on section
      if (currentSection === 'hero') {
        // Orbiting center
        nodes.forEach((node, i) => {
          const angle = time * 0.2 + (i / NODE_COUNT) * Math.PI * 2;
          const radius = 200 + Math.sin(time * 0.5 + i) * 50;
          node.targetX = canvas.width / 2 + Math.cos(angle) * radius;
          node.targetY = canvas.height / 2 + Math.sin(angle) * radius;
        });
      } else if (currentSection === 'certifications') {
        // Edges with sine wave
        targetPoints = getShapePoints('edges', canvas.width, canvas.height, NODE_COUNT);
        nodes.forEach((node, i) => {
          // Add gentle floating to targets
          node.targetX = targetPoints[i].x + Math.sin(time + i) * 20;
          node.targetY = targetPoints[i].y;
        });
      } else if (currentSection === 'experience') {
        // Abstract shapes
        targetPoints = getShapePoints('tech-icons', canvas.width, canvas.height, NODE_COUNT);
        nodes.forEach((node, i) => {
          node.targetX = targetPoints[i].x;
          node.targetY = targetPoints[i].y;
        });
      } else if (currentSection === 'projects') {
        // Grid/Constellation
        targetPoints = getShapePoints('grid', canvas.width, canvas.height, NODE_COUNT);
        nodes.forEach((node, i) => {
          node.targetX = targetPoints[i].x;
          node.targetY = targetPoints[i].y;
        });
      } else if (currentSection === 'contact') {
        // Infinity symbol
        targetPoints = getShapePoints('infinity', canvas.width, canvas.height, NODE_COUNT);
        nodes.forEach((node, i) => {
          // Rotate the infinity symbol points
          const point = targetPoints[i];
          node.targetX = point.x;
          node.targetY = point.y;
        });
      } else {
        // Default random floating
        nodes.forEach(node => {
          node.targetX = node.x + Math.sin(time) * 50;
          node.targetY = node.y + Math.cos(time) * 50;
        });
      }

      // Update Physics
      nodes.forEach(node => {
        // Steering towards target
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Arrive behavior (slow down when close)
        let speed = MAX_SPEED;
        if (dist < 100) {
          speed = (dist / 100) * MAX_SPEED;
        }

        const steerX = (dx / dist) * speed - node.vx;
        const steerY = (dy / dist) * speed - node.vy;

        // Apply steering force
        node.vx += steerX * 0.05; // Low force for smooth movement
        node.vy += steerY * 0.05;

        // Mouse Repulsion (Halo effect)
        const dxMouse = node.x - mouseRef.current.x;
        const dyMouse = node.y - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < MOUSE_REPULSION_RADIUS) {
          const force = (MOUSE_REPULSION_RADIUS - distMouse) / MOUSE_REPULSION_RADIUS;
          node.vx += (dxMouse / distMouse) * force * MOUSE_REPULSION_STRENGTH;
          node.vy += (dyMouse / distMouse) * force * MOUSE_REPULSION_STRENGTH;
        }

        // Apply Velocity
        node.x += node.vx;
        node.y += node.vy;

        // Damping
        node.vx *= DAMPING;
        node.vy *= DAMPING;

        // Draw Node
        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw Connections (only if close)
        // Optimization: Only check a subset or use spatial hash if needed. 
        // For 60 nodes, O(N^2) is 3600 checks, which is fine.
        nodes.forEach(other => {
          const dX = node.x - other.x;
          const dY = node.y - other.y;
          const distance = Math.sqrt(dX * dX + dY * dY);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = (1 - distance / 100) * 0.2;
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