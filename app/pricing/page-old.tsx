'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { PRICING_PACKAGES, APP_ROUTES } from '@/lib/constants';
import { formatPrice, calculateServicePrice } from '@/lib/utils';
import { Check, User, LogOut, Star, ArrowRight } from 'lucide-react';
import { SignInModal } from '@/components/auth/SignInModal';
import { CartButton } from '@/components/CartButton';
import { FadeIn } from '@/components/animations/FadeIn';
import { 
  DSButton, 
  DSCard, 
  DSCardHeader, 
  DSCardTitle, 
  DSCardDescription, 
  DSCardContent, 
  DSCardFooter,
  DSContainer,
  DSDisplay,
  DSHeading,
  DSText,
  DSSupportingText,
  DSBadge
} from '@/components/ds';

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (OAuth) or guest
    const guestCheckout = sessionStorage.getItem('guestCheckout');
    const hasAuth = !!session || !!guestCheckout;
    setIsAuthenticated(hasAuth);
  }, [session]);

  const handleChoosePackage = (packageId: string) => {
    setSelectedPackage(packageId);
    
    // If user is already authenticated (guest, Google, or Facebook), go to service selection
    if (isAuthenticated) {
      router.push(`/select-service?package=${packageId}`);
    } else {
      setShowSignInModal(true);
    }
  };

  const callbackUrl = selectedPackage 
    ? `/select-service?package=${selectedPackage}` 
    : '/select-service';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <DSContainer size="xl">
          <div className="py-4 flex items-center justify-between">
            <Link href={APP_ROUTES.HOME} className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              PhotoRestoreNow
            </Link>
            <div className="flex items-center gap-3">
              <CartButton />
              {session?.user && (
                <>
                  <DSBadge variant="primary" icon={<User className="h-4 w-4" />}>
                    {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                  </DSBadge>
                  <DSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    leftIcon={<LogOut className="h-4 w-4" />}
                  >
                    <span className="hidden sm:inline">Logout</span>
                  </DSButton>
                </>
              )}
              <Link href={APP_ROUTES.HOME}>
                <DSButton variant="ghost" size="sm">Back to Home</DSButton>
              </Link>
            </div>
          </div>
        </DSContainer>
      </nav>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)}
        callbackUrl={callbackUrl}
        packageId={selectedPackage || undefined}
      />

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the package that best fits your needs. All packages include the same professional AI restoration quality.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PACKAGES.map((pkg, index) => (
            <FadeIn key={pkg.id} direction="up" delay={index * 0.1}>
              <Card
                className={`relative hover-lift ${
                  pkg.popular
                    ? 'border-primary shadow-xl scale-105'
                    : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{formatPrice(pkg.basePrice)}</span>
                    <span className="text-gray-500 text-sm ml-1">starting at</span>
                  </div>
                  <CardDescription className="text-base">
                    {pkg.photoCount} {pkg.photoCount === 1 ? 'Photo' : 'Photos'}
                  </CardDescription>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Restoration: {formatPrice(pkg.basePrice)}</div>
                      <div>Colorization: {formatPrice(calculateServicePrice(pkg.basePrice, 'colorization'))}</div>
                      <div>Both: {formatPrice(calculateServicePrice(pkg.basePrice, 'restoration-colorization'))}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleChoosePackage(pkg.id)}
                    className="w-full"
                    size="lg"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Choose {pkg.name}
                  </Button>
                </CardFooter>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <FadeIn direction="up">
            <h2 className="text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
          </FadeIn>
          <div className="space-y-6">
            {[
              {
                q: 'How long does the restoration take?',
                a: 'Most restorations are completed within 24 hours. You\'ll receive an email with download links as soon as your photos are ready.',
              },
              {
                q: 'What file formats do you accept?',
                a: 'We accept JPG, JPEG, PNG, and WEBP formats. Maximum file size is 10MB per photo.',
              },
              {
                q: 'Is my payment secure?',
                a: 'Yes! We use Stripe for payment processing, which is trusted by millions of businesses worldwide. We never store your payment information.',
              },
              {
                q: 'What if I\'m not satisfied with the results?',
                a: 'We offer a 100% satisfaction guarantee. If you\'re not happy with the restoration, contact us within 7 days for a full refund.',
              },
              {
                q: 'Are my photos kept private?',
                a: 'Absolutely. Your photos are automatically deleted from our servers 7 days after delivery. We never share your photos with anyone.',
              },
            ].map((faq, index) => (
              <FadeIn key={index} direction="up" delay={index * 0.1}>
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.a}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">&copy; 2024 PhotoRestoreNow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
