/**
 * Inngest API Route
 * Serves the Inngest functions and handles webhook events
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { processRestorationJob, handleRestorationFailure } from '@/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processRestorationJob,
    handleRestorationFailure,
  ],
  // Serve the Inngest UI in development
  servePath: '/api/inngest',
});
