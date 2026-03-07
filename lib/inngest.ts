/**
 * Inngest Client Configuration
 * Handles background job processing with retries and monitoring
 */

import { Inngest, EventSchemas } from 'inngest';

// Define event schemas for type safety
type Events = {
  'photo/restoration.requested': {
    data: {
      jobId: string;
      orderId: string;
      email: string;
      fileKeys: string[];
      packageId: string;
      serviceType: string;
    };
  };
  'photo/restoration.progress': {
    data: {
      jobId: string;
      progress: number;
      currentImage: number;
      totalImages: number;
      message: string;
    };
  };
  'photo/restoration.completed': {
    data: {
      jobId: string;
      orderId: string;
      restoredUrls: string[];
    };
  };
  'photo/restoration.failed': {
    data: {
      jobId: string;
      orderId: string;
      error: string;
    };
  };
};

// Create Inngest client
export const inngest = new Inngest({
  id: 'photo-restore-now',
  name: 'PhotoRestoreNow',
  schemas: new EventSchemas().fromRecord<Events>(),
  // Event key for authentication (only needed in production)
  eventKey: process.env.INNGEST_EVENT_KEY,
});
