import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export const UserTypeEnum = {
  TEACHER: 'teacher',
  ADMIN: 'admin',
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
    enrolledCourses: {
      type: [String],
      required: false,
    },    
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
