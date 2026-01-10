'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_ROUTES, SERVICE_OPTIONS, PRICING_PACKAGES } from '@/lib/constants';
import { formatPrice, calculateServicePrice } from '@/lib/utils';
import { PackageType, ServiceType } from '@/types';
import { Check, ArrowRight, User, LogOut } from 'lucide-react';
import { CartButton } from '@/components/CartButton';

function SelectServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const packageId = (searchParams.get('package') as PackageType) || '1-photo';
  const packageInfo = PRICING_PACKAGES.find(p => p.id === packageId);
  
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  // Redirect to signin if not authenticated
  if (status === 'unauthenticated') {
    router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent('/select-service?package=' + packageId));
    return null;
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!packageInfo) {
    return <div>Package not found</div>;
  }

  const handleContinue = () => {
    if (!selectedService) return;
    router.push(`${APP_ROUTES.UPLOAD}?package=${packageId}&service=${selectedService}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-bold text-primary">
            PhotoRestoreNow
          </Link>
          <div className="flex items-center gap-3">
            <CartButton />
            {session?.user && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-800">
                    {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Service</h1>
          <p className="text-xl text-gray-600 mb-2">
            {packageInfo.name} - {packageInfo.photoCount} {packageInfo.photoCount === 1 ? 'Photo' : 'Photos'}
          </p>
          <p className="text-gray-500">
            Select the type of enhancement you need for your photos
          </p>
        </div>

        {/* Service Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {SERVICE_OPTIONS.map((service) => {
            const price = calculateServicePrice(packageInfo.basePrice, service.id);
            const pricePerPhoto = Math.round(price / packageInfo.photoCount);
            const isSelected = selectedService === service.id;

            return (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all hover:shadow-xl relative ${
                  isSelected ? 'ring-2 ring-primary shadow-xl scale-105' : ''
                } ${service.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                  <CardDescription className="text-sm h-12">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(pricePerPhoto)} per photo
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <Check className="h-5 w-5" />
                      <span>Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">🔧 Restoration</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Remove scratches & tears</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Fix faded areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Enhance sharpness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Reduce noise</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">🎨 Colorization</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI-powered color detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Natural skin tones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Accurate object colors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Vibrant results</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">⭐ Combo Benefits</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Complete transformation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Best value pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Priority processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Highest quality</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedService}
            className="gap-2 px-8"
          >
            Continue to Upload
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SelectServicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">Loading...</div>}>
      <SelectServiceContent />
    </Suspense>
  );
}
