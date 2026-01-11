'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/contexts/CartContext';
import { PRICING_PACKAGES, APP_ROUTES } from '@/lib/constants';
import { calculateServicePrice, getServiceOption } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, ArrowLeft, User, LogOut } from 'lucide-react';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import { CartButton } from '@/components/CartButton';
import { signOut } from 'next-auth/react';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart: cartState, clearCart, getTotalAmount, removeFromCart } = useCart();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [imageUrls, setImageUrls] = useState<Map<string, string[]>>(new Map());
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

  const handleSignOut = async () => {
    // Clear cart before signing out
    await clearCart();
    // Sign out and redirect to home
    await signOut({ redirect: false });
    router.push('/');
  };

  useEffect(() => {
    setMounted(true);
    
    // Check if Stripe is configured
    setStripeConfigured(!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
                        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_stripe_publishable_key');
    
    // Auto-fill email if user is authenticated
    if (session?.user?.email) {
      setEmail(session.user.email);
      setWasAuthenticated(true);
    } else {
      // Check if user is coming as guest from sessionStorage
      const guestCheckout = sessionStorage.getItem('guestCheckout');
      if (guestCheckout) {
        try {
          const guestData = JSON.parse(guestCheckout);
          setEmail(guestData.email || '');
        } catch (e) {
          console.error('Failed to parse guest data:', e);
        }
      }
    }
  }, [session]);

  // Detect logout and redirect to home
  useEffect(() => {
    if (status === 'loading') return;
    
    // User was authenticated but now is not (logged out)
    if (wasAuthenticated && !session?.user) {
      console.log('User logged out from checkout - redirecting to home');
      router.push('/');
    }
  }, [session, status, wasAuthenticated, router]);

  // Create object URLs for images and cleanup
  useEffect(() => {
    const urlMap = new Map<string, string[]>();
    
    cartState.items.forEach(item => {
      const urls = item.images.map(file => URL.createObjectURL(file));
      urlMap.set(item.id, urls);
    });
    
    setImageUrls(urlMap);
    
    // Cleanup function to revoke object URLs
    return () => {
      urlMap.forEach(urls => {
        urls.forEach(url => URL.revokeObjectURL(url));
      });
    };
  }, [cartState.items]);

  useEffect(() => {
    if (mounted && cartState.items.length === 0) {
      router.push('/pricing');
      return;
    }
    
    // Check if all items are orphaned (no images)
    if (mounted && cartState.items.length > 0) {
      const validItems = cartState.items.filter(item => item.images.length > 0);
      if (validItems.length === 0) {
        // All items are orphaned, redirect to pricing
        clearCart();
        router.push('/pricing');
      }
    }
  }, [cartState.items, router, mounted, clearCart]);

  // Create payment intent when email is set and Stripe is configured
  useEffect(() => {
    if (!email || !email.includes('@') || !stripeConfigured || clientSecret || cartState.items.length === 0) {
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const total = getTotalAmount();
        const totalPhotos = cartState.totalImages;
        const firstItem = cartState.items[0];
        const packageId = firstItem?.packageId || '1-photo';

        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            email,
            packageId: packageId,
            imageCount: totalPhotos,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setClientSecret(result.data.clientSecret);
        } else {
          console.error('Failed to create payment intent:', await response.text());
          setError('Failed to initialize payment. Please try again.');
        }
      } catch (err) {
        console.error('Failed to create payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [email, stripeConfigured, clientSecret, cartState, getTotalAmount]);

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!stripeConfigured) {
      // Fallback for when Stripe is not configured
      setLoading(true);
      setTimeout(() => {
        alert('🎉 Order simulated! Configure Stripe to accept real payments.');
        clearCart();
        router.push('/');
        setLoading(false);
      }, 1000);
      return;
    }

    // With Stripe configured, the form submission is handled by StripePaymentForm
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push('/payment/success');
  };

  if (!mounted || cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const total = getTotalAmount();
  const totalPhotos = cartState.totalImages;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-bold text-primary">
            PhotoRestoreNow
          </Link>
          <div className="flex items-center gap-3">
            <Link href={APP_ROUTES.PRICING}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
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
                  onClick={handleSignOut}
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

      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>

          <div className="grid md:grid-cols-2 gap-8">{/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your items before checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartState.items.filter(item => item.images.length > 0).map((item) => {
                const pkg = PRICING_PACKAGES.find(p => p.id === item.packageId);
                const serviceInfo = getServiceOption(item.serviceType);
                const itemPrice = calculateServicePrice(pkg?.basePrice || 0, item.serviceType);
                
                return (
                  <div key={item.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-medium">{pkg?.name || item.packageId}</p>
                        <p className="text-sm text-gray-600">
                          {item.images.length} photo{item.images.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {serviceInfo?.icon} {serviceInfo?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">
                          ${(itemPrice / 100).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Photo thumbnails */}
                    <div className="grid grid-cols-4 gap-2">
                      {imageUrls.get(item.id)?.map((url, index) => (
                        <div 
                          key={index} 
                          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-primary transition-colors"
                        >
                          <img
                            src={url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-1 text-center">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Add More Photos Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      💡 Want to restore more photos?
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Add more packages to your order
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/pricing')}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Add More Photos
                  </Button>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Total photos:</span>
                  <span>{totalPhotos}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Complete your order securely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  readOnly={!!session?.user?.email}
                  className={session?.user?.email ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {session?.user?.email 
                    ? 'Using your authenticated account email'
                    : 'Receipt and download links will be sent here'
                  }
                </p>
              </div>

              {/* Stripe Payment Section */}
              {stripeConfigured ? (
                email && email.includes('@') ? (
                  clientSecret ? (
                    <div className="border rounded-lg p-4 bg-white">
                      <Elements 
                        stripe={stripePromise} 
                        options={{
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#3b82f6',
                            },
                          },
                        }}
                      >
                        <StripePaymentForm 
                          amount={total}
                          onSuccess={handlePaymentSuccess}
                        />
                      </Elements>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-8 bg-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Preparing payment...</p>
                      <p className="text-sm text-gray-500 mt-2">Please wait while we set up secure payment</p>
                    </div>
                  )
                ) : (
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 text-center">
                    <div className="text-blue-600 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-blue-900 mb-1">Enter your email above</p>
                    <p className="text-sm text-blue-700">Payment options will appear once you provide a valid email address</p>
                  </div>
                )
              ) : (
                <>
                  {/* Placeholder when Stripe is not configured */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    <div className="text-center text-gray-500 space-y-2">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3v-8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-semibold text-lg text-gray-700">Credit Card Payment</span>
                      </div>
                      <p className="text-sm">
                        💳 <strong>Stripe payment form would appear here</strong>
                      </p>
                      <p className="text-xs text-gray-400">
                        (Credit/Debit Card, Apple Pay, Google Pay)
                      </p>
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-left">
                        <p className="font-semibold text-yellow-800 mb-1">ℹ️ Development Mode:</p>
                        <p className="text-yellow-700">
                          To enable Stripe payments, configure STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env.local
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <h4 className="font-semibold mb-2">✨ What you'll receive:</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>✓ High-resolution restored photos</li>
                      <li>✓ Email delivery within 24h</li>
                      <li>✓ Unlimited downloads for 30 days</li>
                      <li>✓ 100% satisfaction guarantee</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
            {!stripeConfigured && (
              <CardFooter className="flex-col gap-2">
                <Button 
                  onClick={handleCheckout} 
                  disabled={loading || !email}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : `Simulate Order - $${(total / 100).toFixed(2)}`}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  🔒 Secure payment powered by Stripe
                </p>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Guarantees */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold mb-1">Secure Payment</h3>
            <p className="text-sm text-gray-600">Processed via Stripe</p>
          </div>
          <div>
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Fast Delivery</h3>
            <p className="text-sm text-gray-600">24 hours or less</p>
          </div>
          <div>
            <div className="text-3xl mb-2">💯</div>
            <h3 className="font-semibold mb-1">Satisfaction Guaranteed</h3>
            <p className="text-sm text-gray-600">100% refund</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
