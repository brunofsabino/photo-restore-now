'use client';

import { Suspense, useState, useEffect } from 'react';
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
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  // Check for guest checkout on mount
  useEffect(() => {
    const guestCheckout = sessionStorage.getItem('guestCheckout');
    if (guestCheckout) {
      console.log('[Select Service] Found guest checkout', guestCheckout);
      setIsGuestCheckout(true);
    }
  }, []);

  // Redirect to signin if not authenticated AND not guest checkout
  if (status === 'unauthenticated' && !isGuestCheckout) {
    // Check sessionStorage one more time before redirecting
    if (typeof window !== 'undefined') {
      const guestCheckout = sessionStorage.getItem('guestCheckout');
      if (!guestCheckout) {
        router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent('/select-service?package=' + packageId));
        return null;
      } else {
        setIsGuestCheckout(true);
      }
    }
  }

  // Show loading while checking authentication
  if (status === 'loading' && !isGuestCheckout) {
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
                  onClick={() => signOut({ callbackUrl: '/' })}
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
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Which describes your photo?</h1>
          <p className="text-lg text-gray-500">
            {packageInfo.name} · {packageInfo.photoCount} {packageInfo.photoCount === 1 ? 'Photo' : 'Photos'} · Not sure? Pick <span className="text-primary font-semibold">Restore & Add Color</span> — it works for most old family photos.
          </p>
        </div>

        {/* Service Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          {SERVICE_OPTIONS.map((service) => {
            const price = calculateServicePrice(packageInfo.basePrice, service.id);
            const pricePerPhoto = Math.round(price / packageInfo.photoCount);
            const isSelected = selectedService === service.id;

            return (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all hover:shadow-xl relative ${
                  isSelected ? 'ring-2 ring-primary shadow-xl scale-105' : ''
                } ${service.popular ? 'border-primary border-2' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Best Choice
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="text-5xl mb-3">{service.icon}</div>
                  <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                  <CardDescription className="text-sm min-h-[56px] leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pt-2">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(price)}
                    </div>
                    {packageInfo.photoCount > 1 && (
                      <div className="text-sm text-gray-500">
                        {formatPrice(pricePerPhoto)} per photo
                      </div>
                    )}
                  </div>

                  {isSelected ? (
                    <div className="flex items-center justify-center gap-2 text-primary font-semibold bg-blue-50 rounded-lg py-2">
                      <Check className="h-5 w-5" />
                      <span>Selected</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 py-2">Click to select</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Simple reassurance strip */}
        <div className="max-w-4xl mx-auto mb-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
          <div className="flex flex-col items-center gap-1">
            <Check className="h-5 w-5 text-green-500" />
            <span>Face enhancement included in every order</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Check className="h-5 w-5 text-green-500" />
            <span>HD quality download, no watermark</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Check className="h-5 w-5 text-green-500" />
            <span>7-day money-back guarantee</span>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedService}
            className="gap-2 px-10 text-lg h-14"
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
