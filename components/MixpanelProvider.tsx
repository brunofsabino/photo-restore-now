/**
 * Mixpanel Analytics Provider
 * Initializes analytics and provides tracking context
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { initMixpanel, trackPageView, identifyUser } from '@/lib/mixpanel';

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Initialize Mixpanel
  useEffect(() => {
    initMixpanel();
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname, {
        timestamp: new Date().toISOString(),
      });
    }
  }, [pathname]);

  // Identify user when logged in
  useEffect(() => {
    if (session?.user?.email) {
      identifyUser(session.user.email, {
        name: session.user.name,
        email: session.user.email,
        signInProvider: session.user.image ? 'oauth' : 'email',
      });
    }
  }, [session]);

  return <>{children}</>;
}
