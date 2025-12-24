'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { PRICING_PACKAGES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: cartState, clearCart, getTotalAmount, removeFromCart } = useCart();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && cartState.items.length === 0) {
      router.push('/pricing');
    }
  }, [cartState.items.length, router, mounted]);

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const total = getTotalAmount();
      
      // Criar payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          email,
          cart: cartState.items,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const { clientSecret } = await response.json();
      
      alert('🎉 Payment simulated successfully! In production, this would redirect to Stripe.');
      clearCart();
      router.push('/');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing payment');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your items before checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartState.items.map((item) => {
                const pkg = PRICING_PACKAGES.find(p => p.id === item.packageId);
                const itemPrice = pkg?.price || 0;
                
                return (
                  <div key={item.id} className="flex justify-between items-center pb-3 border-b">
                    <div className="flex-1">
                      <p className="font-medium">{pkg?.name || item.packageId}</p>
                      <p className="text-sm text-gray-600">
                        {item.images.length} photo{item.images.length > 1 ? 's' : ''}
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
                );
              })}

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
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>We'll send your restored photos by email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCheckout} 
                disabled={loading || !email}
                className="w-full"
                size="lg"
              >
                {loading ? 'Processing...' : `Pay $${(total / 100).toFixed(2)}`}
              </Button>
            </CardFooter>
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
  );
}
