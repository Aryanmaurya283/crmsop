import { WebhookEvent } from '@clerk/clerk-react';
import { syncUserWithSupabase } from '../auth';

export const handleClerkWebhook = async (event: WebhookEvent) => {
  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        // Sync user data with Supabase when user is created or updated
        if (event.data) {
          await syncUserWithSupabase(event.data);
          console.log(`User ${event.type} webhook processed successfully`);
        }
        break;
      
      case 'user.deleted':
        // Handle user deletion - mark as inactive in Supabase
        if (event.data?.id) {
          // Note: In a real application, you might want to soft delete
          // rather than hard delete to maintain data integrity
          console.log(`User deletion webhook received for user: ${event.data.id}`);
          // Implementation would depend on your business requirements
        }
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    throw error;
  }
};

// Webhook endpoint configuration for Express.js (if using a backend)
export const clerkWebhookConfig = {
  endpoint: '/api/webhooks/clerk',
  events: ['user.created', 'user.updated', 'user.deleted'],
  // In production, you would verify the webhook signature
  // using Clerk's webhook secret
};