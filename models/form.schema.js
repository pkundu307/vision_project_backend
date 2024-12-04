import mongoose from 'mongoose';

const studentInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, 'Please enter a valid phone number'],
    },
    age: {
      type: Number,
      required: true,
      min: 10, // Minimum age requirement, can be adjusted
    },
    educationalQualification: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500, // Optional message from the student
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'enrolled', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const StudentInquiryModel = mongoose.model('StudentInquiry', studentInquirySchema);
