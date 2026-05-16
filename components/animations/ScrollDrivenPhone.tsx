'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Sparkles, CreditCard, Mail } from 'lucide-react';

// Formal male portrait — desaturated + blurred simulates a vintage military/WWII photo
const BEFORE_IMAGE = 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=560&h=680&fit=crop&q=80&sat=-100&blur=2';
const AFTER_IMAGE  = 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=560&h=680&fit=crop&q=90';

const steps = [
  {
    id: 1,
    step: '01',
    title: 'Upload Your Photo',
    description: "Scan or photograph your damaged photo and upload it — any format works. It takes under a minute.",
    icon: <Check className="w-5 h-5" />,
    color: 'bg-blue-600',
  },
  {
    id: 2,
    step: '02',
    title: 'AI Gets to Work',
    description: 'Three specialized AI models run in sequence: face restoration, color reconstruction, and 4× sharpening.',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-violet-600',
  },
  {
    id: 3,
    step: '03',
    title: 'Pay Only After Previewing',
    description: 'Secure checkout via Stripe. Your card information never touches our servers.',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-emerald-600',
  },
  {
    id: 4,
    step: '04',
    title: 'Download & Print',
    description: 'Receive your restored photo by email within 24 hours — print-ready quality, HD resolution.',
    icon: <Mail className="w-5 h-5" />,
    color: 'bg-amber-600',
  },
];

export const ScrollDrivenPhone = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealPct, setRevealPct] = useState(8);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // progress: 0 when top of section enters viewport, 1 when bottom leaves
      const raw = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const progress = Math.max(0, Math.min(1, raw));

      // Reveal goes from 8% (barely nothing) to 92% (almost full)
      setRevealPct(8 + progress * 84);
      setActiveStep(Math.min(steps.length - 1, Math.floor(progress * steps.length)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* ── LEFT: sticky photo frame ── */}
          <div className="sticky top-24">
            <div className="relative max-w-sm mx-auto">

              {/* Outer dark frame */}
              <div className="bg-gray-900 rounded-sm p-2.5 shadow-2xl">
                {/* White mat board */}
                <div className="bg-stone-100 p-4 pb-3">
                  {/* Photo area */}
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: '4 / 5' }}
                  >
                    {/* Before (damaged) — always underneath */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={BEFORE_IMAGE}
                      alt="Original damaged photo"
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />

                    {/* After (restored) — clips from left based on scroll */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${revealPct}%` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={AFTER_IMAGE}
                        alt="Restored photo"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ width: `${10000 / revealPct}%`, maxWidth: 'none' }}
                        draggable={false}
                      />
                      {/* Divider line */}
                      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                      Before
                    </div>
                    {revealPct > 25 && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                        After
                      </div>
                    )}
                  </div>

                  {/* Caption under photo on mat board */}
                  <p className="text-center text-[11px] text-stone-500 mt-3 font-medium tracking-wide">
                    Restored by AI · Original undamaged
                  </p>
                </div>

                {/* Frame bottom bar */}
                <div className="text-center py-1.5">
                  <p className="text-white/40 text-[10px] tracking-widest uppercase">PhotoRestoreNow</p>
                </div>
              </div>

              {/* Subtle shadow under frame */}
              <div className="absolute -bottom-3 left-4 right-4 h-6 bg-black/20 blur-xl rounded-full -z-10" />
            </div>
          </div>

          {/* ── RIGHT: step cards ── */}
          <div className="space-y-80 pt-12">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              return (
                <div
                  key={step.id}
                  className={`transition-all duration-500 ${
                    isActive
                      ? 'opacity-100 translate-x-0'
                      : isPast
                      ? 'opacity-40 -translate-x-2'
                      : 'opacity-25 translate-x-4'
                  }`}
                >
                  <div className={`bg-white rounded-2xl p-8 shadow-lg border-l-4 ${
                    isActive ? `${step.color.replace('bg-', 'border-')} shadow-xl` : 'border-gray-100'
                  } transition-all duration-500`}>
                    <div className="flex items-start gap-5">
                      <div className={`${step.color} text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                        {isActive && (
                          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${step.color} transition-all duration-1000 w-full`} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
