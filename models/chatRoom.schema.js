import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: false,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['student', 'teacher', 'admin'] },
      },
    ]    
  },
  { timestamps: true }
);

export const ChatRoomModel = mongoose.model('ChatRoom', chatRoomSchema);
