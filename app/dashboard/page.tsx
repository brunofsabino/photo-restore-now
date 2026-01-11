'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { APP_ROUTES, PRICING_PACKAGES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { Download, Image as ImageIcon, Clock, CheckCircle, XCircle, User, LogOut } from 'lucide-react';

interface Order {
  id: string;
  email: string;
  packageId: string;
  amount: number;
  status: string;
  photoCount: number;
  originalFiles: string[];
  restoredFiles: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationMode, setVerificationMode] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    // If OAuth authenticated, fetch orders directly
    if (status === 'authenticated' && session?.user?.email) {
      fetchOrders();
    } else if (status === 'unauthenticated') {
      // Not authenticated, show verification form
      setVerificationMode(true);
      setLoading(false);
    }
  }, [status, session]);

  const fetchOrders = async (guestEmail?: string, code?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (guestEmail && code) {
        params.set('email', guestEmail);
        params.set('code', code);
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingCode(true);
      const response = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      toast({
        title: 'Code Sent!',
        description: `Verification code sent to ${email}. Check your email.`,
      });

      setCodeSent(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send code',
        variant: 'destructive',
      });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyAndFetchOrders = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    await fetchOrders(email, verificationCode);
    setVerificationMode(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPackageName = (packageId: string) => {
    const pkg = PRICING_PACKAGES.find(p => p.id === packageId);
    return pkg?.name || packageId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (verificationMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href={APP_ROUTES.HOME} className="text-2xl font-bold text-primary">
              PhotoRestoreNow
            </Link>
            <Link href={APP_ROUTES.HOME}>
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Access Your Orders</CardTitle>
              <CardDescription>
                Enter your email to receive a verification code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!codeSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendVerificationCode()}
                    />
                  </div>
                  <Button
                    onClick={sendVerificationCode}
                    disabled={sendingCode}
                    className="w-full"
                  >
                    {sendingCode ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    📧 Check your email for the 6-digit verification code
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      onKeyPress={(e) => e.key === 'Enter' && verifyAndFetchOrders()}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button
                    onClick={verifyAndFetchOrders}
                    className="w-full"
                  >
                    Verify & View Orders
                  </Button>
                  <Button
                    onClick={() => setCodeSent(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    Use Different Email
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-bold text-primary">
            PhotoRestoreNow
          </Link>
          <div className="flex items-center gap-3">
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
            <Link href={APP_ROUTES.PRICING}>
              <Button variant="outline" size="sm">Restore More Photos</Button>
            </Link>
            <Link href={APP_ROUTES.HOME}>
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Restored Photos</h1>
          <p className="text-gray-600">
            {session?.user?.email || email} • {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">
                Start restoring your precious memories today!
              </p>
              <Link href={APP_ROUTES.PRICING}>
                <Button size="lg">Browse Packages</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatPrice(order.amount)}</div>
                      <div className="text-sm text-gray-600">{getPackageName(order.packageId)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Original Photos Section */}
                  {order.originalFiles && order.originalFiles.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm mb-3 text-gray-700">Original Photos</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {order.originalFiles.map((fileUrl, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors group">
                            <img 
                              src={fileUrl} 
                              alt={`Original photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Original {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restored Photos Section */}
                  {order.status === 'completed' && order.restoredFiles && order.restoredFiles.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Restored Photos
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {order.restoredFiles.map((fileUrl, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-500 hover:border-green-600 transition-colors group">
                            <img 
                              src={fileUrl} 
                              alt={`Restored photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                              ✨ Restored {index + 1}
                            </div>
                            <a
                              href={fileUrl}
                              download
                              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-4 w-4 text-gray-700" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Info */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ImageIcon className="h-4 w-4" />
                      <span>{order.photoCount} {order.photoCount === 1 ? 'photo' : 'photos'}</span>
                      <span className="ml-4 capitalize flex items-center gap-2">
                        {order.status === 'completed' && '✅'}
                        {order.status === 'processing' && '⏳'}
                        {order.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'completed' && order.restoredFiles.length > 0 && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download All
                          </Button>
                          <Button size="sm">
                            View Photos
                          </Button>
                        </>
                      )}
                      {order.status === 'processing' && (
                        <div className="text-sm text-gray-600 py-2">
                          Your photos are being restored...
                        </div>
                      )}
                    </div>
                  </div>

                  {order.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-gray-500">
                        💡 Photos available for download for 12 months
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
