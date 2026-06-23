import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    return res.status(500).json({ error: 'Webhook secret missing' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const payload = req.body;
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    logger.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  logger.info(`Webhook received: ${eventType} for user ${id}`);

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const email = evt.data.email_addresses?.[0]?.email_address;
      if (email) {
        await User.findOneAndUpdate(
          { clerkId: id },
          { clerkId: id, email },
          { upsert: true, new: true }
        );
      }
    } else if (eventType === 'user.deleted') {
      await User.findOneAndUpdate(
        { clerkId: id },
        { isDeleted: true, deletedAt: new Date() }
      );
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('Error processing webhook event:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};
