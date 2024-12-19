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
    volunteers: [
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
      index: true,
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
    enrolledStudentsRemoved: [
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
    announcements: [{
      title: String,
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
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
    sessions: [
      {
        googleMeetLink: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now, 
        },
      },
    ],
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note', // Reference the Note schema
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment', // Reference the Assignment schema
      },
    ],
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test', // Reference the Test schema
      },
    ],
  },
  { timestamps: true }
);

export const CourseModel = mongoose.model('Course', courseSchema);




const noteSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['pdf', 'image', 'text'], // Defines the type of note
      required: true,
    },
    content: {
      type: String, // URL for PDFs or images, plain text for text notes
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now, // Automatically stores the upload timestamp
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  { timestamps: true }
);

export const NoteModel = mongoose.model('Note', noteSchema);
