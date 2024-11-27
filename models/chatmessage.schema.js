import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    sender: {
      type: String,
      // ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
  },
  { timestamps: true }
);

export const ChatMessageModel = mongoose.model('ChatMessage', chatMessageSchema);
