'use client';

import { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  autoPlay?: boolean;
  autoPlaySpeed?: number;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  autoPlay = false,
  autoPlaySpeed = 3000,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const directionRef = useRef<number>(1); // 1 for right, -1 for left

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
    setIsAutoPlaying(false); // Stop autoplay when user interacts
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Auto-play animation
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const animate = () => {
      setSliderPosition((prevPosition) => {
        let newPosition = prevPosition + directionRef.current * 0.5;

        // Reverse direction at boundaries
        if (newPosition >= 95) {
          directionRef.current = -1;
          newPosition = 95;
        } else if (newPosition <= 5) {
          directionRef.current = 1;
          newPosition = 5;
        }

        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoPlaying]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-2xl cursor-col-resize select-none group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onMouseEnter={() => setIsAutoPlaying(false)}
    >
      {/* After Image (Full) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden transition-all duration-100"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Line with Glow Effect */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl transition-all duration-100"
        style={{ 
          left: `${sliderPosition}%`,
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)'
        }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-primary transition-transform group-hover:scale-110">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-primary"></div>
            <div className="w-0.5 h-4 bg-primary"></div>
          </div>
        </div>

        {/* Vertical Beam Effect */}
        <div 
          className="absolute inset-0 w-8 -left-4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            filter: 'blur(8px)',
          }}
        ></div>
      </div>

      {/* Hint Text */}
      {!isDragging && sliderPosition > 45 && sliderPosition < 55 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm animate-pulse">
          ← Drag to compare →
        </div>
      )}
    </div>
  );
}
