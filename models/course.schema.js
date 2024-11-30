import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          required: true,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: {
          type: String, // e.g., "09:00"
          required: true,
        },
        endTime: {
          type: String, // e.g., "12:00"
          required: true,
        },
      },
    ],
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    is_active:{
      type: Boolean,
      default: true, 
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true, // Add index
    },
    enrollmentLimit: {
      type: Number,
      required: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    materials: [
      {
        title: String,
        url: String,
      },
    ],
    prerequisites: {
      type: String, 
      required: false,
    },
    category: {
      type: String,
      required: true,
      enum: ['Math', 'Science', 'Technology', 'Arts'],
    },
    status: {
      type: String,
      required: true,
      enum: ['ongoing', 'ended', 'upcoming'],
      default: 'upcoming',
    },
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
  },
  { timestamps: true }
);

export const CourseModel = mongoose.model('Course', courseSchema);
