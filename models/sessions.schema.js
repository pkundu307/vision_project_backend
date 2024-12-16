import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization", // Reference to the Organization schema
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"], // Session status options
      default: "upcoming",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the creation time
    },
  },
  { timestamps: true }
);

export const SessionModel = mongoose.model("Session", sessionSchema);

sessionSchema.pre("find", async function (next) {
    const now = new Date();
    await SessionModel.updateMany(
      { status: { $ne: "completed" }, endDate: { $lte: now } },
      { $set: { status: "completed" } }
    );
    next();
  });
  