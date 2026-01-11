'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Download, Home } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);

  useEffect(() => {
    const payment_intent = searchParams.get('payment_intent');
    if (payment_intent) {
      setPaymentIntent(payment_intent);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4 border border-blue-100">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              What Happens Next?
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-gray-600">You'll receive a confirmation email at <span className="font-medium">{session?.user?.email}</span> with your order details.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">AI Processing</p>
                  <p className="text-gray-600">Our advanced AI will restore and enhance your photos with professional quality.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Download Ready</p>
                  <p className="text-gray-600">Within 24 hours, you'll receive another email with download links for your restored photos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Reference */}
          {paymentIntent && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Payment Reference</p>
              <p className="text-sm font-mono text-gray-700 break-all">{paymentIntent}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              asChild
              className="flex-1"
              size="lg"
            >
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                View Orders
              </Link>
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a href="mailto:support@photorestorenow.com" className="text-blue-600 hover:underline font-medium">
                support@photorestorenow.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
