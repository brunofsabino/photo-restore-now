'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/contexts/CartContext';
import { PRICING_PACKAGES, APP_ROUTES } from '@/lib/constants';
import { calculateServicePrice, getServiceOption } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import { WatermarkedCanvas } from '@/components/checkout/WatermarkedCanvas';
import { X, ArrowLeft, User, LogOut, ArrowRight, Shield, Sparkles, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type Step = 'cart' | 'uploading' | 'preview' | 'paying';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart: cartState, clearCart, getTotalAmount, removeFromCart } = useCart();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('cart');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string[]>>(new Map());
  const [uploadedFileKeys, setUploadedFileKeys] = useState<string[]>([]);

  const stripeConfigured =
    !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_stripe_publishable_key';

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (session?.user?.email) {
      setEmail(session.user.email);
    } else {
      try {
        const guest = sessionStorage.getItem('guestCheckout');
        if (guest) setEmail(JSON.parse(guest).email || '');
      } catch {}
    }
  }, [session]);

  // Build object URLs from cart File objects for local canvas rendering
  useEffect(() => {
    const urlMap = new Map<string, string[]>();
    cartState.items.forEach(item => {
      urlMap.set(item.id, item.images.map(f => URL.createObjectURL(f)));
    });
    setImageUrls(urlMap);
    return () => urlMap.forEach(urls => urls.forEach(u => URL.revokeObjectURL(u)));
  }, [cartState.items]);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && cartState.items.length === 0) router.push('/pricing');
  }, [cartState.items, mounted, router]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const allObjectUrls = (): string[] =>
    cartState.items.flatMap(item => imageUrls.get(item.id) ?? []);

  const allFiles = (): File[] =>
    cartState.items.flatMap(item => item.images);

  // ── Step: cart → preview ───────────────────────────────────────────────────

  const handlePreview = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setStep('uploading');

    try {
      const files = allFiles();
      if (files.length === 0) throw new Error('No photos in cart.');

      const formData = new FormData();
      files.forEach(f => formData.append('files', f));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const result = await res.json();
      setUploadedFileKeys(result.files.map((f: { key: string }) => f.key));
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos.');
      setStep('cart');
    }
  };

  // ── Step: preview → paying ─────────────────────────────────────────────────

  const handleProceedToPayment = async () => {
    setStep('paying');
    setError('');
    try {
      const total = getTotalAmount();
      const firstItem = cartState.items[0];
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email,
          packageId: firstItem?.packageId || '1-photo',
          imageCount: cartState.totalImages,
          fileKeys: uploadedFileKeys,
          serviceType: firstItem?.serviceType || 'restoration',
        }),
      });
      if (!res.ok) throw new Error('Failed to initialize payment.');
      const data = await res.json();
      setClientSecret(data.data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment.');
      setStep('preview');
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push('/payment/success');
  };

  // ── Shared Nav ─────────────────────────────────────────────────────────────

  const Nav = () => (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <Link href={APP_ROUTES.HOME} className="text-2xl font-extrabold text-gray-900">
          PhotoRestoreNow
        </Link>
        <div className="flex items-center gap-3">
          {step !== 'paying' && (
            <button
              onClick={() => step === 'preview' ? setStep('cart') : router.push('/pricing')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          {session?.user && (
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
          )}
        </div>
      </div>
    </nav>
  );

  // ── Loading guard ──────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const total = getTotalAmount();

  // ══════════════════════════════════════════════════════════════════════════
  // STEP: uploading
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'uploading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex flex-col items-center justify-center min-h-[75vh] gap-6 px-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 mb-1">Preparing your preview…</p>
            <p className="text-gray-500 text-sm">Uploading your photos securely. This takes just a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP: preview
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'preview') {
    const photoUrls = allObjectUrls();
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />

        {/* Green guarantee strip */}
        <div className="bg-emerald-700 text-white text-sm font-medium py-2.5 text-center">
          100% Money-Back Guarantee &nbsp;·&nbsp; 7-Day Download Access &nbsp;·&nbsp; Secure Payment via Stripe
        </div>

        <div className="container mx-auto px-4 py-10 max-w-5xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4" /> AI Preview Ready
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              See What Your Photos Will Look Like
            </h1>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
              Below is a preview of the AI enhancement quality.
              Your restored photos will be delivered in full resolution — no watermark.
            </p>
          </div>

          {/* Photo previews */}
          <div className={`grid gap-6 mb-10 ${photoUrls.length === 1 ? 'max-w-md mx-auto' : 'sm:grid-cols-2'}`}>
            {photoUrls.map((url, i) => (
              <div key={i} className="space-y-2">
                <div className="grid grid-cols-2 gap-2 items-end">
                  {/* Before */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 text-center">
                      Before
                    </p>
                    <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Photo ${i + 1} original`}
                        className="w-full h-full object-cover"
                        draggable={false}
                        onContextMenu={e => e.preventDefault()}
                        style={{ filter: 'grayscale(0.25) contrast(0.9)', userSelect: 'none' }}
                      />
                    </div>
                  </div>
                  {/* After (watermarked canvas) */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5 text-center">
                      After (preview)
                    </p>
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-emerald-400 shadow-md">
                      <WatermarkedCanvas objectUrl={url} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400">Photo {i + 1}</p>
              </div>
            ))}
          </div>

          {/* CTA block */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-lg mx-auto text-center">
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              Happy with the quality?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Pay once and receive your full-resolution, watermark-free photos by email within 24 hours.
            </p>

            <div className="bg-gray-50 rounded-xl px-6 py-4 mb-6 flex justify-between items-center">
              <span className="text-gray-600 text-sm font-medium">
                {cartState.totalImages} photo{cartState.totalImages > 1 ? 's' : ''} — full restoration
              </span>
              <span className="text-2xl font-extrabold text-gray-900">
                ${(total / 100).toFixed(2)}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <Button
              onClick={handleProceedToPayment}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base h-13 gap-2 mb-4"
            >
              <Lock className="h-4 w-4" />
              Pay Securely — ${(total / 100).toFixed(2)}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
              <span>🔒 Stripe-secured payment</span>
              <span>🛡️ 100% money-back guarantee</span>
              <span>📧 Delivered within 24 hours</span>
            </div>
          </div>

          {/* Go back link */}
          <p className="text-center mt-6">
            <button
              onClick={() => setStep('cart')}
              className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
            >
              ← Go back and change my photos
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP: paying
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'paying') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-10 max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <Lock className="h-4 w-4" /> Secure Checkout
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Complete Your Payment</h1>
            <p className="text-gray-500 text-sm">
              {cartState.totalImages} photo{cartState.totalImages > 1 ? 's' : ''} · ${(total / 100).toFixed(2)} total
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: 'en',
                  appearance: { theme: 'stripe', variables: { colorPrimary: '#2563eb' } },
                }}
              >
                <StripePaymentForm amount={total} onSuccess={handlePaymentSuccess} />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Setting up secure payment…</p>
                {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
            <span>🔒 256-bit SSL encryption</span>
            <span>🛡️ 100% money-back guarantee</span>
            <span>💳 Visa, Mastercard, Amex, Apple Pay</span>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP: cart (default)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Review Your Order</h1>
          <p className="text-gray-500 text-sm">Preview your restoration before paying — no surprises</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* ── Order Summary ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base">Order Summary</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              {cartState.items.filter(item => item.images.length > 0).map(item => {
                const pkg = PRICING_PACKAGES.find(p => p.id === item.packageId);
                const svc = getServiceOption(item.serviceType);
                const price = calculateServicePrice(pkg?.basePrice || 0, item.serviceType);
                const urls = imageUrls.get(item.id) ?? [];

                return (
                  <div key={item.id} className="pb-5 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{pkg?.name || item.packageId}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {svc?.icon} {svc?.name} · {item.images.length} photo{item.images.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">${(price / 100).toFixed(2)}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="grid grid-cols-4 gap-2">
                      {urls.map((url, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 flex justify-between items-center">
                <span className="text-gray-500 text-sm">{cartState.totalImages} photos total</span>
                <span className="text-xl font-extrabold text-gray-900">${(total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Contact + Preview CTA ─────────────────────────────────── */}
          <div className="space-y-5">
            {/* Email field */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Your Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!!session?.user?.email}
                className={`h-11 ${session?.user?.email ? 'bg-gray-50' : ''}`}
              />
              <p className="text-xs text-gray-400 mt-2">
                {session?.user?.email
                  ? 'Restored photos will be sent to your account email.'
                  : "We'll send your restored photos to this address within 24 hours."}
              </p>
            </div>

            {/* Preview CTA */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm px-6 py-6 text-center">
              <Sparkles className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-extrabold text-gray-900 text-lg mb-1">
                Preview Before You Pay
              </h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                See a preview of your restored photos with our AI enhancement
                before completing your purchase.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <Button
                onClick={handlePreview}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-13 text-base gap-2 mb-3"
              >
                <Sparkles className="h-4 w-4" />
                Preview My Restoration
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-gray-400">
                Free preview · No charge yet · Pay only if you're satisfied
              </p>
            </div>

            {/* Trust signals */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
              <div className="space-y-3">
                {[
                  { icon: <Shield className="h-4 w-4 text-emerald-600" />, text: '100% money-back guarantee — not satisfied? Full refund, no questions.' },
                  { icon: <Lock className="h-4 w-4 text-blue-600" />, text: 'Payment processed by Stripe — your card data never touches our servers.' },
                  { icon: <Sparkles className="h-4 w-4 text-amber-500" />, text: 'Full-resolution photos delivered by email within 24 hours.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
