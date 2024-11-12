import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Enums for user type and current role
export const UserTypeEnum = {
  TEACHER: 'teacher',
  ADMIN: 'admin',
  STUDENT: 'student',
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
    collegeName: {
      type: String,
      required: true,
    },
    passoutYear: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 10, // Allows for future passout years up to 10 years ahead
    },
    cv: {
      type: String, // Assuming this is a URL to the CV file
      required: false,
    },
    userType: {
      type: String,
      enum: Object.values(UserTypeEnum),
      required: true,
    },
    currentRole: {
      type: String,
      enum: Object.values(CurrentRoleEnum),
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);


// Pre-save hook to handle password hashing
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
  next();
});

// Method to compare passwords (useful for authentication)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the model and enums
export const UserModel = mongoose.model('User', userSchema);
