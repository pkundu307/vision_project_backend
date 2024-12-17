import mongoose from 'mongoose';
const testSchema = new mongoose.Schema(
    {
      type: {
        type: String,
        enum: ['entrance test', 'regular test'], // Defines the type of test
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      timeLimit: {
        type: Number, // Time limit in minutes
        required: true,
      },
      deadline: {
        type: Date, // Submission deadline for the test
        required: true,
      },
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true, // Test must be associated with a course
      },
      questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question', // Reference the Question schema
          required: true,
        },
      ],
      totalMarks: {
        type: Number, // Sum of marks of all questions
        required: true,
        default: 0, // Will be updated when questions are added
      },
    },
    { timestamps: true }
  );
  
  export const TestModel = mongoose.model('Test', testSchema);

  const questionSchema = new mongoose.Schema(
    {
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: false, // Change from required: true to required: false
      },
      type: {
        type: String,
        enum: ['mcq', 'short-answer'], // Defines question type
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
        type: Number, // Marks allocated to the question
        required: true,
      },
    },
    { timestamps: true }
  );
  
  export const QuestionModel = mongoose.model('Question', questionSchema);