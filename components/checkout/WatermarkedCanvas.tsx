'use client';

import { useEffect, useRef } from 'react';

interface WatermarkedCanvasProps {
  objectUrl: string;
  label?: string;
}

export function WatermarkedCanvas({ objectUrl, label }: WatermarkedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      canvas.width = W;
      canvas.height = H;

      // Draw image with simulated enhancement filters
      ctx.filter = 'brightness(1.09) contrast(1.14) saturate(1.12)';
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      // Subtle vignette
      const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.38, W / 2, H / 2, W * 0.78);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // Diagonal tiled watermark
      const fontSize = Math.max(14, Math.round(W * 0.052));
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      const textW = ctx.measureText('PhotoRestoreNow').width;
      const rowH = fontSize * 3.6;

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-Math.PI / 5.5);
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#ffffff';
      for (let row = -H * 2; row < H * 2; row += rowH) {
        for (let col = -W * 2; col < W * 2; col += textW + fontSize * 3) {
          ctx.fillText('PhotoRestoreNow', col, row);
        }
      }
      ctx.restore();

      // Bottom blue banner
      const bannerH = Math.round(H * 0.085);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.93)';
      ctx.fillRect(0, H - bannerH, W, bannerH);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1;
      ctx.font = `bold ${Math.round(bannerH * 0.44)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨ Preview  ·  Pay to download full quality', W / 2, H - bannerH / 2);
    };

    img.src = objectUrl;
  }, [objectUrl]);

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-md"
      onContextMenu={e => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        draggable={false}
      />
      {label && (
        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-md">
          {label}
        </div>
      )}
    </div>
  );
}
