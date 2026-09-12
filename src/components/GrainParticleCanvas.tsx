import React, { useEffect, useRef } from 'react';

interface GrainParticleCanvasProps {
  density?: 'subtle' | 'medium' | 'rich';
  interactive?: boolean;
  className?: string;
}

interface Grain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  hue: number;
  lightness: number;
  alpha: number;
}

export const GrainParticleCanvas: React.FC<GrainParticleCanvasProps> = ({
  density = 'medium',
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({ x: -1, y: -1, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Handle resize
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Visibility observer to pause when scrolled out of view
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(canvas);

    const count = density === 'subtle' ? 22 : density === 'medium' ? 45 : 75;
    const grains: Grain[] = [];

    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      grains.push({
        x: Math.random() * (rect.width || 800),
        y: Math.random() * (rect.height || 600),
        vx: (Math.random() - 0.4) * 0.4,
        vy: 0.6 + Math.random() * 1.4, // Falling downwards like pouring grain
        size: 2.2 + Math.random() * 3.2,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.05,
        hue: 40 + Math.random() * 8, // Rich golden/amber hues (40-48)
        lightness: 52 + Math.random() * 26,
        alpha: 0.35 + Math.random() * 0.5,
      });
    }

    const drawGrain = (g: Grain) => {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rotation);

      // Draw maize kernel shape (slightly tapered teardrop/rounded rectangle)
      ctx.beginPath();
      ctx.ellipse(0, 0, g.size * 0.7, g.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${g.hue}, 92%, ${g.lightness}%, ${g.alpha})`;
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.arc(g.size * 0.15, -g.size * 0.25, g.size * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(48, 100%, 94%, ${g.alpha * 0.8})`;
      ctx.fill();

      ctx.restore();
    };

    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      if (!isVisible) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      const mx = mousePos.current.x;
      const my = mousePos.current.y;
      const mouseActive = interactive && mousePos.current.active;

      for (const g of grains) {
        // Fall down
        g.y += g.vy * 60 * dt;
        g.x += g.vx * 60 * dt;
        g.rotation += g.vRot * 60 * dt;

        // Interactive mouse repulsion/swirl
        if (mouseActive) {
          const dx = g.x - mx;
          const dy = g.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120;
            g.x += (dx / dist) * force * 3;
            g.y += (dy / dist) * force * 3;
          }
        }

        // Wrap around when reaching bottom
        if (g.y > height + 10) {
          g.y = -10;
          g.x = Math.random() * width;
        }
        if (g.x < -10) g.x = width + 10;
        if (g.x > width + 10) g.x = -10;

        drawGrain(g);
      }
    };

    animId = requestAnimationFrame(loop);

    const handleMouseMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - b.left,
        y: e.clientY - b.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mousePos.current.active = false;
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
};
