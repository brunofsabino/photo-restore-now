'use client';

import { useEffect, useRef } from 'react';

export const MeshGradient = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Gradient colors (purple/blue theme)
    const colors = [
      { r: 99, g: 102, b: 241 },   // indigo
      { r: 168, g: 85, b: 247 },   // purple
      { r: 236, g: 72, b: 153 },   // pink
      { r: 59, g: 130, b: 246 },   // blue
    ];

    // Wave parameters
    let time = 0;
    const waves = Array.from({ length: 5 }, (_, i) => ({
      amplitude: 50 + Math.random() * 100,
      frequency: 0.002 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.002,
    }));

    const animate = () => {
      time += 0.5;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      // Animate gradient stops based on time
      const offset1 = (Math.sin(time * 0.001) + 1) * 0.5;
      const offset2 = (Math.cos(time * 0.0015) + 1) * 0.5;
      const offset3 = (Math.sin(time * 0.002 + 1) + 1) * 0.5;

      gradient.addColorStop(0, `rgba(${colors[0].r}, ${colors[0].g}, ${colors[0].b}, ${0.6 + offset1 * 0.4})`);
      gradient.addColorStop(0.33, `rgba(${colors[1].r}, ${colors[1].g}, ${colors[1].b}, ${0.5 + offset2 * 0.3})`);
      gradient.addColorStop(0.66, `rgba(${colors[2].r}, ${colors[2].g}, ${colors[2].b}, ${0.4 + offset3 * 0.3})`);
      gradient.addColorStop(1, `rgba(${colors[3].r}, ${colors[3].g}, ${colors[3].b}, ${0.5 + offset1 * 0.2})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x < canvas.width; x += 2) {
          const y = 
            canvas.height / 2 +
            Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const waveColor = colors[index % colors.length];
        ctx.fillStyle = `rgba(${waveColor.r}, ${waveColor.g}, ${waveColor.b}, ${0.1 - index * 0.015})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};
