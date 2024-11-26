import express from 'express';
import {
  getMessages,
  addUserToChatRoom,
  removeUserFromChatRoom,
} from '../controllers/chat.controller.js';

const router = express.Router();

// Get all messages for a chat room
router.get('/:chatRoomId/messages', getMessages);

// Add a user to a chat room
router.post('/add-user', addUserToChatRoom);

// Remove a user from a chat room
router.post('/remove-user', removeUserFromChatRoom);

export default router;
