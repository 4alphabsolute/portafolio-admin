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
  isAmbient: boolean; // New property for 70/30 split
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
      }, 200); // Reduced to 200ms for instant reaction
    }
    sectionRef.current = activeSection;
  }, [activeSection]);

  // Intersection Observer - Tuned for earlier detection
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Trigger even earlier
      rootMargin: "-10% 0px -10% 0px" // Tighter margin
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
      // Density Formula: (W * H) / 2000
      const density = (window.innerWidth * window.innerHeight) / 2000;
      const NODE_COUNT = Math.floor(density);

      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        // 70/30 Rule: 30% are ambient
        const isAmbient = Math.random() < 0.3;

        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          size: 1 + Math.random() * 0.5, // 1px - 1.5px
          color: colors[Math.floor(Math.random() * colors.length)],
          baseColor: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.6, // Fixed alpha 0.6
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

    // --- Shape Generation (Math Pure) ---
    const getShapePoints = (shape: string, width: number, height: number, count: number) => {
      const points = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const minDim = Math.min(width, height);

      if (shape === 'dodecahedron') { // Hero
        const radius = minDim * 0.45; // 45% of min dimension (Almost half screen)
        for (let i = 0; i < count; i++) {
          // Two rings to simulate 3D-ish structure
          const ring = i % 2 === 0 ? 1 : 0.6;
          const angle = (i / count) * Math.PI * 4; // 2 full circles distributed
          points.push({
            x: centerX + Math.cos(angle) * radius * ring,
            y: centerY + Math.sin(angle) * radius * ring
          });
        }
      } else if (shape === 'py-symbol') { // Experience
        const isMobile = width < 768;
        const startX = isMobile ? centerX - 50 : width * 0.15; // Left aligned on desktop
        const startY = centerY;
        const scale = 4; // Scale for points

        for (let i = 0; i < count; i++) {
          // Draw "Py" roughly
          // P: Vertical line + Loop
          // y: Diagonal + Vertical
          const t = i / count;
          let x, y;

          if (t < 0.5) { // P
            const pt = t / 0.5;
            if (pt < 0.4) { // Vertical
              x = 0;
              y = (pt / 0.4) * 40 - 20;
            } else { // Loop
              const angle = ((pt - 0.4) / 0.6) * Math.PI * 2 - Math.PI / 2;
              x = 10 + Math.cos(angle) * 10;
              y = -10 + Math.sin(angle) * 10;
              if (x < 0) x = 0; // Clamp to vertical
            }
          } else { // y
            const yt = (t - 0.5) / 0.5;
            if (yt < 0.5) { // Left diagonal
              x = 30 + (yt / 0.5) * 10;
              y = -20 + (yt / 0.5) * 20;
            } else { // Right diagonal (long)
              x = 50 - ((yt - 0.5) / 0.5) * 20;
              y = -20 + ((yt - 0.5) / 0.5) * 60;
            }
          }

          points.push({
            x: startX + x * scale,
            y: startY + y * scale
          });
        }

      } else if (shape === 'neural-net') { // Projects
        // Random distributed but clustered
        for (let i = 0; i < count; i++) {
          points.push({
            x: Math.random() * width,
            y: Math.random() * height
          });
        }
      } else if (shape === 'at-symbol') { // Contact
        for (let i = 0; i < count; i++) {
          const scale = minDim * 0.15;

          if (i < count * 0.4) { // Dense Center Circle
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * scale * 0.8;
            points.push({
              x: centerX + Math.cos(angle) * r,
              y: centerY + Math.sin(angle) * r
            });
          } else { // Outer Arc (270 deg)
            const t = (i - count * 0.4) / (count * 0.6); // 0 to 1
            const angle = t * Math.PI * 1.5 + Math.PI; // Start at 180, go 270 deg
            const r = scale * 1.5;
            points.push({
              x: centerX + Math.cos(angle) * r,
              y: centerY + Math.sin(angle) * r
            });
          }
        }
      } else {
        // Default circle
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * minDim * 0.4;
          points.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r
          });
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

      // Filter nodes for shape (70%) vs ambient (30%)
      const shapeNodes = nodes.filter(n => !n.isAmbient);
      const ambientNodes = nodes.filter(n => n.isAmbient);

      let targetPoints: { x: number, y: number }[] = [];

      // Determine targets for SHAPE nodes only
      if (currentSection === 'hero' || currentSection === 'about') {
        targetPoints = getShapePoints('dodecahedron', canvas.width, canvas.height, shapeNodes.length);
      } else if (currentSection === 'certifications') {
        targetPoints = getShapePoints('dodecahedron', canvas.width, canvas.height, shapeNodes.length); // Reuse or simple
      } else if (currentSection === 'experience') {
        targetPoints = getShapePoints('py-symbol', canvas.width, canvas.height, shapeNodes.length);
      } else if (currentSection === 'projects') {
        targetPoints = getShapePoints('neural-net', canvas.width, canvas.height, shapeNodes.length);
      } else if (currentSection === 'contact') {
        targetPoints = getShapePoints('at-symbol', canvas.width, canvas.height, shapeNodes.length);
      }

      // Update Shape Nodes
      shapeNodes.forEach((node, i) => {
        if (targetPoints[i]) {
          if (currentSection === 'hero' || currentSection === 'about') {
            // Rotate hero shape
            const x = targetPoints[i].x - canvas.width / 2;
            const y = targetPoints[i].y - canvas.height / 2;
            const angle = time * 0.1; // Slow rotation
            node.targetX = canvas.width / 2 + x * Math.cos(angle) - y * Math.sin(angle);
            node.targetY = canvas.height / 2 + x * Math.sin(angle) + y * Math.cos(angle);
          } else {
            node.targetX = targetPoints[i].x;
            node.targetY = targetPoints[i].y;
          }
        }

        // Explosion (High Speed)
        if (isExploding) {
          node.targetX += (Math.random() - 0.5) * 800; // Faster explosion
          node.targetY += (Math.random() - 0.5) * 800;
        }

        // Physics - Snappier
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Increased speed factor for responsiveness
        const speed = dist < 100 ? (dist / 100) * 8 : 8;
        const steerX = (dx / dist) * speed - node.vx;
        const steerY = (dy / dist) * speed - node.vy;

        node.vx += steerX * 0.1; // Higher force
        node.vy += steerY * 0.1;

        // Mouse Repulsion
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
        node.vx *= 0.90; // Less friction for speed
        node.vy *= 0.90;

        // Draw
        ctx.globalAlpha = node.opacity;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Connections for Neural Net
        if (currentSection === 'projects') {
          // ... (Simplified connection logic if needed, or skip for performance)
          shapeNodes.slice(i + 1, i + 3).forEach(other => {
            const dX = node.x - other.x;
            const dY = node.y - other.y;
            if (Math.abs(dX) < 50 && Math.abs(dY) < 50) { // Fast check
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

      // Update Ambient Nodes (Floating freely)
      ambientNodes.forEach(node => {
        // Gentle float
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

        // Wrap around screen
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        ctx.globalAlpha = node.opacity * 0.5; // Fainter
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