import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  createNotification,
  notificationStream
} from '../controller/notificationController.js';

const router = express.Router();

// Get all notifications for a user
router.get('/:userId', getUserNotifications);

// Mark a notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// Create a new notification
router.post('/', createNotification);

// SSE endpoint for real-time notifications
router.get('/stream/:userId', notificationStream);

export default router;
