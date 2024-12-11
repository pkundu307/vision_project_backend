import mongoose from "mongoose";
import bcrypt from "bcrypt"

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    plan:{
      type: String,
      required: true,
      enum: ['starter','basic', 'pro','enterprise'],
    },
    contactEmail: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    contactPhone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, 'Please enter a valid phone number'],
    },
    website: {
      type: String,
      required: false,
    },
    coursesOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    todo: [
      {
        todoItem: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now, // Automatically set the creation time
        },
      },
    ],
    announcements: [
      {
        todoItem: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now, // Automatically set the creation time
        },
      },
    ],
    administrators: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    
    establishedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    logo: {
      type: String,
      required: false,
    },
    // Add admin name and password
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminPassword: {
      type: String,
      required: true,
      minlength: 6, // Ensure password meets a minimum length requirement
    },
  },
  { timestamps: true }
);


organizationSchema.pre("save", async function (next) {
  if (this.isModified("adminPassword")) {
    this.adminPassword = await bcrypt.hash(this.adminPassword, 10);
  }
  next();
});

// Add comparePassword method
organizationSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.adminPassword);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

export const OrganizationModel = mongoose.model("Organization", organizationSchema);