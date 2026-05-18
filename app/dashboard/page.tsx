'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { APP_ROUTES, PRICING_PACKAGES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import {
  Download, Image as ImageIcon, Clock, CheckCircle,
  XCircle, User, LogOut, ArrowRight, Sparkles,
} from 'lucide-react';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    completed: {
      label: 'Completed',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    processing: {
      label: 'Processing',
      className: 'bg-amber-50 text-amber-700 border border-amber-200',
      icon: <Clock className="h-3.5 w-3.5 animate-pulse" />,
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-50 text-red-700 border border-red-200',
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
  };
  const s = map[status] ?? map.processing;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.className}`}>
      {s.icon} {s.label}
    </span>
  );
}

function downloadAll(urls: string[]) {
  urls.forEach((url, i) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `restored-photo-${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, i * 400);
  });
}

function getPackageName(packageId: string) {
  return PRICING_PACKAGES.find(p => p.id === packageId)?.name || packageId;
}

// ─── Photo pair card ──────────────────────────────────────────────────────────

function PhotoPair({
  original,
  restored,
  index,
}: {
  original?: string;
  restored?: string;
  index: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Before */}
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5 text-center">
          Before
        </p>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          {original ? (
            <img src={original} alt={`Original ${index + 1}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center sm:pt-6">
        <div className="bg-blue-100 rounded-full p-1.5">
          <ArrowRight className="h-4 w-4 text-blue-600" />
        </div>
      </div>

      {/* After */}
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 mb-1.5 text-center">
          Restored ✨
        </p>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-emerald-400 group">
          {restored ? (
            <>
              <img src={restored} alt={`Restored ${index + 1}`} className="w-full h-full object-cover" />
              <a
                href={restored}
                download={`restored-photo-${index + 1}.jpg`}
                onClick={e => e.stopPropagation()}
                className="absolute inset-0 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="bg-white text-gray-800 text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg shadow-md">
                  <Download className="h-3.5 w-3.5" /> Save
                </span>
              </a>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-4">
              <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
              <p className="text-xs text-gray-500">Processing…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationMode, setVerificationMode] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.email) {
      fetchOrders();
    } else if (status === 'unauthenticated') {
      // If the signed guest cookie is present, fetch orders directly — no need
      // to ask for email again (user just went through checkout this session).
      const guestData = sessionStorage.getItem('guestCheckout');
      if (guestData) {
        try {
          const { email: guestEmail } = JSON.parse(guestData);
          if (guestEmail) setVerifiedEmail(guestEmail);
        } catch {}
        fetchOrders(); // API will authenticate via the guestCheckout cookie
      } else {
        setVerificationMode(true);
        setLoading(false);
      }
    }
  }, [status, session]);

  const fetchOrders = async (guestEmail?: string, code?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (guestEmail && code) { params.set('email', guestEmail); params.set('code', code); }
      const response = await fetch(`/api/orders?${params.toString()}`);
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    try {
      setSendingCode(true);
      const response = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to send code');
      toast({ title: 'Code sent!', description: `Check ${email} for your 6-digit code.` });
      setCodeSent(true);
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send code', variant: 'destructive' });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyAndFetchOrders = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ title: 'Invalid Code', description: 'Please enter the 6-digit code', variant: 'destructive' });
      return;
    }
    await fetchOrders(email, verificationCode);
    setVerifiedEmail(email);
    setVerificationMode(false);
  };

  // ── Nav ────────────────────────────────────────────────────────────────────

  const Nav = () => (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <Link href={APP_ROUTES.HOME} className="text-2xl font-extrabold text-gray-900">
          PhotoRestoreNow
        </Link>
        <div className="flex items-center gap-3">
          {session?.user && (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                <User className="h-3.5 w-3.5" />
                {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
          <Link href={APP_ROUTES.PRICING}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
              Restore More Photos
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading your orders…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Verification ───────────────────────────────────────────────────────────

  if (verificationMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Nav />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 px-8 py-6 text-center">
                <ImageIcon className="h-8 w-8 text-white/80 mx-auto mb-2" />
                <h1 className="text-xl font-bold text-white">Access Your Orders</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Enter the email you used at checkout
                </p>
              </div>

              <div className="p-8 space-y-4">
                {!codeSent ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendVerificationCode()}
                        className="h-11"
                      />
                    </div>
                    <Button
                      onClick={sendVerificationCode}
                      disabled={sendingCode}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {sendingCode ? 'Sending…' : 'Send Verification Code'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 text-center">
                      📧 A 6-digit code was sent to <strong>{email}</strong>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                        Verification Code
                      </Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={e => e.key === 'Enter' && verifyAndFetchOrders()}
                        className="h-14 text-center text-3xl tracking-[0.5em] font-bold"
                      />
                    </div>
                    <Button
                      onClick={verifyAndFetchOrders}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View My Restored Photos
                    </Button>
                    <Button
                      onClick={() => { setCodeSent(false); setVerificationCode(''); }}
                      variant="ghost"
                      className="w-full"
                    >
                      Use a Different Email
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  const displayEmail = session?.user?.email || verifiedEmail;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">My Restored Photos</h1>
          <p className="text-gray-500 text-sm">
            {displayEmail}
            {orders.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            )}
          </p>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 px-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Start bringing your precious memories back to life today.
            </p>
            <Link href={APP_ROUTES.PRICING}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                See Packages <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const maxPairs = Math.max(order.originalFiles?.length ?? 0, order.restoredFiles?.length ?? 0);

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

                  {/* Order header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="font-bold text-gray-900 text-sm">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric',
                        })}
                        &nbsp;·&nbsp;
                        {getPackageName(order.packageId)}
                        &nbsp;·&nbsp;
                        {order.photoCount} {order.photoCount === 1 ? 'photo' : 'photos'}
                      </p>
                    </div>
                    <span className="font-extrabold text-gray-900 text-lg">
                      {formatPrice(order.amount)}
                    </span>
                  </div>

                  {/* Photo pairs */}
                  <div className="px-6 py-6 space-y-6">
                    {maxPairs > 0 ? (
                      Array.from({ length: maxPairs }).map((_, i) => (
                        <PhotoPair
                          key={i}
                          index={i}
                          original={order.originalFiles?.[i]}
                          restored={order.restoredFiles?.[i]}
                        />
                      ))
                    ) : (
                      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <Sparkles className="h-5 w-5 flex-shrink-0 animate-pulse" />
                        <span>
                          Your photos are being restored by AI. You'll receive an email when
                          they're ready — usually within 24 hours.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  {order.status === 'completed' && order.restoredFiles?.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        🗑️ Files available for download for 7 days after delivery
                      </p>
                      <Button
                        size="sm"
                        onClick={() => downloadAll(order.restoredFiles)}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download All
                      </Button>
                    </div>
                  )}

                  {order.status === 'failed' && (
                    <div className="px-6 py-4 bg-red-50 border-t border-red-100">
                      <p className="text-sm text-red-700">
                        There was an issue with this order. Our team has been notified and will
                        reach out within 24 hours. If you don't hear back, email{' '}
                        <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@photorestorenow.com'}`} className="underline font-semibold">
                          {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@photorestorenow.com'}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
