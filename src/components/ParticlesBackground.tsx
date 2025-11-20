import { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Partículas
    const particles: any[] = [];
    const particleCount = 80;
    const colorsByZone = {
      top: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
      middle: ['#93C5FD', '#DBEAFE', '#F1F5F9', '#E2E8F0'],
      bottom: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
    };

    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
      const y = Math.random() * canvas.height;
      particles.push({
        x: Math.random() * canvas.width,
        y: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 2,
        color: '#60A5FA', // Color inicial, se actualizará dinámicamente
        opacity: Math.random() * 0.5 + 0.4,
        angle: Math.random() * Math.PI * 2,
        baseX: 0,
        baseY: 0,
        zone: y < canvas.height * 0.3 ? 'top' : y < canvas.height * 0.7 ? 'middle' : 'bottom'
      });
    }

    // Mouse tracking
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Inicializar posiciones base
    particles.forEach(particle => {
      particle.baseX = particle.x;
      particle.baseY = particle.y;
    });

    let time = 0;

    // Animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      particles.forEach((particle, index) => {
        // Actualizar zona basada en posición Y
        const currentY = particle.baseY || particle.y;
        particle.zone = currentY < canvas.height * 0.3 ? 'top' : 
                       currentY < canvas.height * 0.7 ? 'middle' : 'bottom';
        
        // Comportamiento por zona
        if (particle.zone === 'top') {
          // Zona superior: movimiento activo
          particle.angle += 0.005;
          particle.baseX += particle.vx;
          particle.baseY += particle.vy;
          particle.x = particle.baseX + Math.sin(particle.angle + time) * 20;
          particle.y = particle.baseY + Math.cos(particle.angle * 0.7 + time) * 15;
        } else if (particle.zone === 'middle') {
          // Zona media: movimiento suave
          particle.angle += 0.003;
          particle.baseX += particle.vx * 0.5;
          particle.baseY += particle.vy * 0.5;
          particle.x = particle.baseX + Math.sin(particle.angle + time) * 10;
          particle.y = particle.baseY + Math.cos(particle.angle * 0.5 + time) * 8;
        } else {
          // Zona inferior: solo flotación vertical
          particle.angle += 0.002;
          particle.x = particle.baseX || particle.x;
          particle.y = (particle.baseY || particle.y) + Math.sin(particle.angle + time) * 5;
        }

        // Rebote suave en bordes
        if (particle.baseX <= 0 || particle.baseX >= canvas.width) {
          particle.vx *= -1;
          particle.baseX = Math.max(0, Math.min(canvas.width, particle.baseX));
        }
        if (particle.baseY <= 0 || particle.baseY >= canvas.height) {
          particle.vy *= -1;
          particle.baseY = Math.max(0, Math.min(canvas.height, particle.baseY));
        }

        // Interacción con mouse solo en zona superior
        if (particle.zone === 'top') {
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150 * 0.02;
            particle.baseX -= dx * force;
            particle.baseY -= dy * force;
          }
        }

        // Color dinámico por zona
        const zoneColors = colorsByZone[particle.zone as keyof typeof colorsByZone];
        particle.color = zoneColors[Math.floor(Math.random() * zoneColors.length)];

        // Dibujar partícula con respiración adaptativa
        const breatheIntensity = particle.zone === 'top' ? 0.2 : 
                                particle.zone === 'middle' ? 0.1 : 0.05;
        const breathe = Math.sin(time * 2 + particle.angle) * breatheIntensity + 1;
        const zoneOpacity = particle.zone === 'top' ? 1 : 
                           particle.zone === 'middle' ? 0.7 : 0.4;
        
        ctx.globalAlpha = particle.opacity * breathe * zoneOpacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * breathe, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar líneas más suaves entre partículas
        particles.slice(index + 1).forEach(otherParticle => {
          const dx2 = particle.x - otherParticle.x;
          const dy2 = particle.y - otherParticle.y;
          const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (distance2 < 120) {
            ctx.globalAlpha = (120 - distance2) / 120 * 0.3;
            ctx.strokeStyle = '#60A5FA';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'auto'
      }}
    />
  );
}