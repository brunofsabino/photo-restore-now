'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { PRICING_PACKAGES, SERVICE_OPTIONS, APP_ROUTES } from '@/lib/constants';
import { formatPrice, calculateServicePrice } from '@/lib/utils';
import { Check, ArrowRight, Shield, HelpCircle, LogOut, User } from 'lucide-react';
import { SignInModal } from '@/components/auth/SignInModal';
import { CartButton } from '@/components/CartButton';
import { FadeIn } from '@/components/animations/FadeIn';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const guestCheckout = sessionStorage.getItem('guestCheckout');
    setIsAuthenticated(!!session || !!guestCheckout);
  }, [session]);

  const handleChoosePackage = (packageId: string) => {
    setSelectedPackage(packageId);
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
      a: 'Yes. We use Stripe for payment processing — the same system used by Amazon and Apple. We never see or store your card number.',
    },
    {
      q: 'What if I\'m not satisfied with the results?',
      a: 'We offer a 100% money-back guarantee. If you\'re not happy with the restoration, contact us within 7 days for a full refund, no questions asked.',
    },
    {
      q: 'Are my photos kept private?',
      a: 'Absolutely. Your photos are processed securely and automatically deleted from our servers 7 days after delivery. We never share your photos with anyone.',
    },
    {
      q: 'Can I choose different services for each photo?',
      a: 'Yes. After purchasing a package, you can select a different service type for each individual photo — restoration, colorization, or both.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Guarantee strip */}
      <div className="bg-emerald-700 text-white text-sm font-medium py-2.5 text-center">
        100% Money-Back Guarantee &nbsp;·&nbsp; Results in 24 Hours &nbsp;·&nbsp; Secure Payment via Stripe
      </div>

      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-extrabold text-gray-900">
            PhotoRestoreNow
          </Link>
          <div className="flex items-center gap-3">
            <CartButton />
            {session?.user ? (
              <>
                <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                  <User className="h-3.5 w-3.5" />
                  {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link href={APP_ROUTES.HOME}>
                <Button variant="ghost" size="sm">← Back to Home</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        callbackUrl={callbackUrl}
        packageId={selectedPackage || undefined}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-12 text-center">
        <FadeIn direction="up">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Simple Pricing</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Choose Your Package
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Every package includes the same professional AI quality.<br />
            <span className="font-semibold text-gray-800">The more photos, the more you save.</span>
          </p>
        </FadeIn>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Service type key */}
          <FadeIn direction="up">
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {SERVICE_OPTIONS.map(svc => (
                <div key={svc.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
                  <span>{svc.icon}</span>
                  <span className="font-medium">{svc.name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">
                    {svc.priceMultiplier === 1 ? 'base price' : `${Math.round(svc.priceMultiplier * 100)}% of base`}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PACKAGES.map((pkg, index) => {
              const isPopular = pkg.popular;
              return (
                <FadeIn key={pkg.id} direction="up" delay={index * 0.08}>
                  <div className={`relative flex flex-col rounded-2xl border-2 overflow-hidden h-full transition-shadow hover:shadow-xl ${
                    isPopular
                      ? 'border-blue-600 shadow-lg shadow-blue-100'
                      : 'border-gray-200'
                  }`}>
                    {isPopular && (
                      <div className="bg-blue-600 text-white text-xs font-bold uppercase tracking-widest text-center py-2">
                        Most Popular
                      </div>
                    )}

                    <div className={`p-6 flex flex-col flex-1 ${isPopular ? 'bg-blue-50' : 'bg-white'}`}>
                      {/* Package name + photo count */}
                      <div className="mb-5">
                        <h2 className="text-lg font-bold text-gray-900">{pkg.name}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {pkg.photoCount} {pkg.photoCount === 1 ? 'photo' : 'photos'}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-5">
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-extrabold text-gray-900">
                            {formatPrice(pkg.basePrice)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          for restoration · {formatPrice(Math.round(pkg.basePrice / pkg.photoCount))}/photo
                        </p>
                      </div>

                      {/* Service breakdown */}
                      <div className="bg-white/70 rounded-xl p-3 mb-5 space-y-1.5 border border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Service prices</p>
                        {SERVICE_OPTIONS.map(svc => (
                          <div key={svc.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 flex items-center gap-1.5">
                              <span>{svc.icon}</span> {svc.name.split(' ')[0]}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(calculateServicePrice(pkg.basePrice, svc.id))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6 flex-1">
                        {pkg.features.map((feature, fi) => (
                          <li key={fi} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0 stroke-[2.5]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        size="lg"
                        onClick={() => handleChoosePackage(pkg.id)}
                        className={`w-full gap-2 ${
                          isPopular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Trust row */}
          <FadeIn direction="up" delay={0.3}>
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              {[
                { icon: '🔒', text: 'Secured by Stripe' },
                { icon: '🛡️', text: '100% money-back guarantee' },
                { icon: '⚡', text: 'Results within 24 hours' },
                { icon: '🗑️', text: 'Photos deleted after 7 days' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Guarantee block */}
      <section className="bg-stone-50 border-y border-stone-200 py-14 px-4 text-center">
        <FadeIn direction="up">
          <Shield className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
            Not happy? Get a full refund.
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto text-base leading-relaxed">
            If for any reason you are not satisfied with your restored photo, email us within 7 days and we will refund you completely — no questions, no hassle.
          </p>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeIn direction="up">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FadeIn key={index} direction="up" delay={index * 0.05}>
                <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
                  <div className="flex gap-4">
                    <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1.5">{faq.q}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-4 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} PhotoRestoreNow. All rights reserved.
          &nbsp;·&nbsp;
          <Link href={APP_ROUTES.PRIVACY} className="hover:text-white transition-colors">Privacy</Link>
          &nbsp;·&nbsp;
          <Link href={APP_ROUTES.TERMS} className="hover:text-white transition-colors">Terms</Link>
        </p>
      </footer>
    </div>
  );
}
