import { ChatRoomModel } from '../models/chatRoom.schema.js';
import {ChatMessageModel} from "../models/chatmessage.schema.js"
// import { UserModel } from '../models/user.model.js';

/**
 * Get all messages for a chat room
 */
export const getLastMessagesByChatRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { limit } = req.query;

    // Validate chatRoomId
    if (!chatRoomId) {
      return res.status(400).json({ error: 'Chat room ID is required.' });
    }

    // Validate limit (default to 10 if not provided)
    const messageLimit = parseInt(limit, 10) || 10;

    // Fetch the last N messages
    const messages = await ChatMessageModel.find({ chatRoom: chatRoomId })
      .sort({ createdAt: -1 }) // Sort by createdAt descending to get the latest messages
      .limit(messageLimit)    // Limit to the specified number of messages
      .exec();

    // Return the messages in chronological order
    const sortedMessages = messages.reverse(); // Reverse to maintain chronological order

    res.status(200).json({ success: true, messages: sortedMessages });
  } catch (error) {
    // Handle errors
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
/**
 * Add a user to a chat room
 */
export const addUserToChatRoom = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;

    const chatRoom = await ChatRoomModel.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found.' });
    }

    if (!chatRoom.participants.includes(userId)) {
      chatRoom.participants.push(userId);
      await chatRoom.save();
    }

    return res.status(200).json({ message: 'User added to chat room.' });
  } catch (error) {
    console.error('Error adding user to chat room:', error);
    return res.status(500).json({ message: 'An error occurred while adding the user to the chat room.' });
  }
};

/**
 * Remove a user from a chat room
 */
export const removeUserFromChatRoom = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;

    const chatRoom = await ChatRoomModel.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found.' });
    }

    chatRoom.participants = chatRoom.participants.filter(
      (participant) => participant.toString() !== userId
    );
    await chatRoom.save();

    return res.status(200).json({ message: 'User removed from chat room.' });
  } catch (error) {
    console.error('Error removing user from chat room:', error);
    return res.status(500).json({ message: 'An error occurred while removing the user from the chat room.' });
  }
};
