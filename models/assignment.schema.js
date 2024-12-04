import mongoose from "mongoose";


const assignmentSchema = new mongoose.Schema(
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
        required: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: false,
      },
      deadline: {
        type: Date,
        required: true, 
      },
      questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question', 
        },
      ],
      totalMarks: {
        type: Number,
        required: true,
      },
    },
    { timestamps: true }
  );
  
  export const AssignmentModel = mongoose.model('Assignment', assignmentSchema);
  
  const questionSchema = new mongoose.Schema({
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: false, // Change from required: true to required: false
    },
    type: {
      type: String,
      enum: ['mcq', 'short-answer'],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String], // Only for MCQ questions
      required: function () {
        return this.type === 'mcq';
      },
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be a string or other types based on question type
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
  });

  export const QuestionModel = mongoose.model('Question', questionSchema);

