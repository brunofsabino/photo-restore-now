'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, TrendingUp, CreditCard, Mail } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: 'check' | 'chart' | 'card' | 'mail';
  color: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Upload Your Photos',
    description: 'Securely upload old, damaged photos',
    icon: 'check',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 2,
    title: 'AI Processing',
    description: 'Advanced AI removes damage and enhances',
    icon: 'chart',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 3,
    title: 'Secure Payment',
    description: 'Protected by Stripe payment processing',
    icon: 'card',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 4,
    title: 'Receive Results',
    description: 'Download restored photos in 24 hours',
    icon: 'mail',
    color: 'from-orange-500 to-red-600',
  },
];

export const ScrollDrivenPhone = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{left: string, top: string, delay: string, duration: string}>>([]);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    const generatedParticles = [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 3}s`,
    }));
    setParticles(generatedParticles);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress (0 to 1)
      // When container enters viewport (top touches bottom of screen)
      const viewportMiddle = windowHeight / 2;
      const containerMiddle = rect.top + (rect.height / 2);
      
      // Progress from 0 (top of container) to 1 (bottom of container)
      const progress = Math.max(0, Math.min(1, 
        (windowHeight - rect.top) / (windowHeight + rect.height)
      ));

      // Update active step based on progress (0 to 3)
      const stepIndex = Math.max(0, Math.min(
        Math.floor(progress * steps.length),
        steps.length - 1
      ));
      
      setActiveStep(stepIndex);
      setLineProgress(progress * 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'check':
        return <Check className="w-8 h-8" />;
      case 'chart':
        return <TrendingUp className="w-8 h-8" />;
      case 'card':
        return <CreditCard className="w-8 h-8" />;
      case 'mail':
        return <Mail className="w-8 h-8" />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-[300vh] py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16">
          
          {/* Photo Album - Scrolls with page */}
          <div className="relative">
            <div className="w-full max-w-lg mx-auto">
              {/* Vintage Photo Album */}
              <div className="relative">
                {/* Album Cover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-2xl shadow-2xl transform rotate-1" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 rounded-2xl shadow-2xl transform -rotate-1" />
                
                {/* Album Page */}
                <div className="relative bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50 rounded-2xl shadow-2xl p-8 border-4 border-amber-900">
                  {/* Paper texture overlay */}
                  <div className="absolute inset-0 opacity-30 rounded-2xl" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.4\' /%3E%3C/svg%3E")'
                  }} />
                  
                  {/* Photo Frame inside album */}
                  <div className="relative bg-white rounded-lg shadow-xl p-4 h-[550px] flex items-center justify-center overflow-hidden">
                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-amber-400" />
                    <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-amber-400" />
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-amber-400" />
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-amber-400" />
                    
                    {/* Animated background particles */}
                    <div className="absolute inset-0 opacity-10">
                      {particles.map((particle, i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 bg-blue-500 rounded-full animate-pulse"
                          style={{
                            left: particle.left,
                            top: particle.top,
                            animationDelay: particle.delay,
                            animationDuration: particle.duration,
                          }}
                        />
                      ))}
                    </div>

                    {/* Step content inside photo - animated transitions */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      {steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 p-6 ${
                            index === activeStep
                              ? 'opacity-100 scale-100 z-10'
                              : index < activeStep
                              ? 'opacity-0 scale-90 -translate-y-20 z-0'
                              : 'opacity-0 scale-90 translate-y-20 z-0'
                          }`}
                        >
                          <div
                            className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-5 shadow-2xl transform transition-transform duration-700 ${
                              index === activeStep ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
                            }`}
                          >
                            {getIcon(step.icon)}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-center text-sm md:text-base px-2 leading-relaxed max-w-xs">
                            {step.description}
                          </p>
                          
                          {/* Progress indicator */}
                          <div className="flex gap-2 mt-6">
                            {steps.map((_, i) => (
                              <div
                                key={i}
                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                  i === activeStep
                                    ? 'bg-blue-600 w-10'
                                    : i < activeStep
                                    ? 'bg-blue-400 w-2.5'
                                    : 'bg-gray-300 w-2.5'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Album binding detail */}
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-950 rounded-full shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          {/* Steps descriptions - on the right side */}
          <div className="w-full space-y-96">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`transform transition-all duration-700 ${
                  index === activeStep ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-10'
                }`}
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} text-white mb-4`}>
                    {getIcon(step.icon)}
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${step.color} transition-all duration-700`}
                        style={{
                          width: index <= activeStep ? '100%' : '0%',
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-400">
                      {index + 1}/{steps.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
