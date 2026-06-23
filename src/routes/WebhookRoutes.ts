import { Router } from 'express';
import express from 'express';
import { handleClerkWebhook } from '../controllers/WebhookController';

const router = Router();

// Clerk webhook needs raw body to verify signature
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
