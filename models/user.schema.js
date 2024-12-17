import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export const UserTypeEnum = {
  TEACHER: 'teacher',
  SUBADMIN: 'subadmin',
  STUDENT: 'student',
  VOLENTEER: 'volunteer'
};

export const CurrentRoleEnum = {
  STUDENT: 'student',
  WORKING_PROFESSIONAL: 'working professional',
};

// Define the schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    collegeName: {
      type: String,
      required: false,
    },
    passoutYear: {
      type: Number,
      required: false,
      min: 1900,
      max: new Date().getFullYear() + 10,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
      },
    ], 
    enrolledCoursesRemoved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    cv: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      enum: Object.values(UserTypeEnum),
      default:'student',
      required: false,
    },
    currentRole: {
      type: String,
      enum: Object.values(CurrentRoleEnum),
      required: false,
    },
    otp_verified: {
      type: Boolean,
      default: false,
    },
    organization:{
      type: String,
      ref: 'Organization',
      required: true,
    },
    assignmentSubmissions: [
      {
        assignmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Assignment', 
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        answers: [
          {
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Question', 
            },
            answer: {
              type: String,
              required: true,
            },
            marksObtained: {
              type: Number,
              default: 0,
            },
          },
        ],
        totalMarksObtained: {
          type: Number, 
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to handle password hashing
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method to compare passwords (useful for authentication)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model('User', userSchema);


const assignmentResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment', 
    required: true,
  },
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', 
        required: true,
      },
      questionText: {
        type: String, // Added to store the question text
        required: true,
      },
      userAnswer: {
        type: mongoose.Schema.Types.Mixed, 
        required: true,
      },
      correctAnswer: {
        type: mongoose.Schema.Types.Mixed, 
        required: true,
      },
      marksObtained: {
        type: Number, 
        default: 0,
      },
      isCorrect: {
        type: Boolean, 
        default: false,
      },
    },
  ],
  totalMarksObtained: {
    type: Number,
    default: 0,
  },
  submissionDate: {
    type: Date,
    default: Date.now, 
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'pending'], 
    default: 'submitted',
  },
});

export const AssignmentResponseModel = mongoose.model('AssignmentResponse', assignmentResponseSchema);
