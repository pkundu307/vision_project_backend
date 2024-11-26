import { ChatRoomModel } from '../models/chatRoom.schema.js';
import {ChatMessageModel} from "../models/chatmessage.schema.js"
// import { UserModel } from '../models/user.model.js';

/**
 * Get all messages for a chat room
 */
export const getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const messages = await ChatMessageModel.find({ chatRoom: chatRoomId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'An error occurred while fetching messages.' });
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
