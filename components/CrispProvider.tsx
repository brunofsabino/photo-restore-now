/**
 * Crisp Chat Widget Provider
 * Provides customer support chat across the application
 */

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}

export function CrispProvider() {
  const { data: session } = useSession();

  useEffect(() => {
    // Only load in browser
    if (typeof window === 'undefined') return;

    const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!CRISP_WEBSITE_ID) return;

    // Load Crisp script
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.getElementsByTagName('head')[0].appendChild(script);

    // Set user data when authenticated
    if (session?.user) {
      script.onload = () => {
        if (window.$crisp) {
          window.$crisp.push(['set', 'user:email', session.user.email]);
          if (session.user.name) {
            window.$crisp.push(['set', 'user:nickname', session.user.name]);
          }
        }
      };
    }

    return () => {
      // Cleanup
      if (window.$crisp) {
        window.$crisp = [];
      }
    };
  }, [session]);

  return null;
}
