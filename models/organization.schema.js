import mongoose from "mongoose";
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
      administrators: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      establishedYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear(),
      },
      logo: {
        type: String,
        required: false,
      },
    },
    { timestamps: true }
  );
  
  export const OrganizationModel = mongoose.model('Organization', organizationSchema);
  