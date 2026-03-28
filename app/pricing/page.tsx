'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { PRICING_PACKAGES, APP_ROUTES } from '@/lib/constants';
import { formatPrice, calculateServicePrice } from '@/lib/utils';
import { Check, User, LogOut, Star, ArrowRight, HelpCircle } from 'lucide-react';
import { SignInModal } from '@/components/auth/SignInModal';
import { CartButton } from '@/components/CartButton';
import { FadeIn } from '@/components/animations/FadeIn';
import { 
  DSButton, 
  DSCard, 
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

  const faqs = [
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <DSContainer size="xl">
          <div className="py-4 flex items-center justify-between">
            <Link 
              href={APP_ROUTES.HOME} 
              className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent"
            >
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
      <section className="py-20">
        <DSContainer size="lg">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <DSDisplay size="md" className="mb-6">
                Simple, Transparent Pricing
              </DSDisplay>
              <DSText size="xl" className="max-w-2xl mx-auto text-gray-600">
                Choose the package that best fits your needs. All packages include the same professional AI restoration quality.
              </DSText>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {PRICING_PACKAGES.map((pkg, index) => {
              const isPopular = pkg.popular;
              
              return (
                <FadeIn key={pkg.id} direction="up" delay={index * 0.1}>
                  <DSCard
                    variant={isPopular ? 'featured' : 'default'}
                    padding="none"
                    className={`relative ${isPopular ? 'scale-105 ring-2 ring-primary-200' : ''}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <DSBadge variant="primary" icon={<Star className="h-3.5 w-3.5 fill-current" />}>
                          Most Popular
                        </DSBadge>
                      </div>
                    )}

                    <div className="p-8 text-center">
                      <DSHeading size="lg" className="mb-3">
                        {pkg.name}
                      </DSHeading>
                      
                      <div className="mb-4">
                        <div className="text-5xl font-extrabold text-gray-900 mb-1">
                          {formatPrice(pkg.basePrice)}
                        </div>
                        <DSSupportingText size="sm">
                          starting price
                        </DSSupportingText>
                      </div>
                      
                      <DSText size="sm" className="text-gray-600 mb-4">
                        {pkg.photoCount} {pkg.photoCount === 1 ? 'Photo' : 'Photos'}
                      </DSText>
                      
                      {/* Service pricing breakdown */}
                      <div className="pt-4 border-t border-gray-100 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-medium">Restoration</span>
                          <span className="text-gray-700 font-semibold">{formatPrice(pkg.basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-medium">Colorization</span>
                          <span className="text-gray-700 font-semibold">
                            {formatPrice(calculateServicePrice(pkg.basePrice, 'colorization'))}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-medium">Both Services</span>
                          <span className="text-gray-700 font-semibold">
                            {formatPrice(calculateServicePrice(pkg.basePrice, 'restoration-colorization'))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 pb-8">
                      <ul className="space-y-3 mb-6">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5 text-success-600 stroke-[3]" />
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 leading-tight font-medium">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <DSButton
                        variant={isPopular ? 'primary' : 'secondary'}
                        size="lg"
                        onClick={() => handleChoosePackage(pkg.id)}
                        className="w-full"
                        rightIcon={<ArrowRight className="h-5 w-5" />}
                      >
                        Choose {pkg.name}
                      </DSButton>
                    </div>
                  </DSCard>
                </FadeIn>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <DSHeading size="xl" className="mb-4">
                  Frequently Asked Questions
                </DSHeading>
                <DSSupportingText className="text-base">
                  Everything you need to know about photo restoration
                </DSSupportingText>
              </div>
            </FadeIn>
            
            <DSContainer size="md">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <FadeIn key={index} direction="up" delay={index * 0.05}>
                    <DSCard variant="flat" padding="md" className="hover:bg-white transition-colors">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <HelpCircle className="h-4 w-4 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <DSHeading size="xs" className="mb-2">
                            {faq.q}
                          </DSHeading>
                          <DSText size="sm" className="text-gray-600">
                            {faq.a}
                          </DSText>
                        </div>
                      </div>
                    </DSCard>
                  </FadeIn>
                ))}
              </div>
            </DSContainer>
          </div>
        </DSContainer>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <DSContainer size="xl">
          <div className="text-center">
            <DSSupportingText className="text-gray-400">
              &copy; 2024 PhotoRestoreNow. All rights reserved.
            </DSSupportingText>
          </div>
        </DSContainer>
      </footer>
    </div>
  );
}
