import { TestModel, TestQuestionModel } from "../models/test.schema.js";
import { CourseModel } from '../models/course.schema.js';



export const addTestToCourse = async (req, res) => {
    try {
      const { courseId, type, title, description, timeLimit, deadline, questions, totalMarks } = req.body;
      console.log(courseId, type, title, description, timeLimit, deadline);
      
      // Validate course existence
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
  
      // Create entries for each question
      const createdQuestions = await Promise.all(
        questions.map(async (question) => {
          const { type, questionText, options, correctAnswer, marks } = question;
  
          // Create a new question
          const newQuestion = new TestQuestionModel({
            type,
            questionText,
            options: type === 'mcq' ? options : undefined,
            correctAnswer,
            marks,
          });
  
          return await newQuestion.save();
        })
      );
  
      // Extract question IDs
      const questionIds = createdQuestions.map((q) => q._id);
  
      // Create a new test
      const newTest = new TestModel({
        type,
        title,
        description,
        timeLimit,
        deadline,
        course: courseId,
        questions: questionIds,
        totalMarks,
      });
  
      // Save the test
      const savedTest = await newTest.save();
  
      // Add the test ID to the course's tests array
      course.tests.push(savedTest._id);
      await course.save();
  
      return res.status(201).json({
        message: 'Test and questions added successfully',
        test: savedTest,
        questions: createdQuestions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while adding the test' });
    }
  };

  export const getTestsByCourseId = async (req, res) => {
    try {
      const { courseId } = req.params;
  
      // Find all tests linked to the courseId
      const tests = await TestModel.find({ course: courseId }).populate({ path: 'questions', select: '-correctAnswer -__v'});
  
      if (!tests || tests.length === 0) {
        return res.status(404).json({ message: 'No tests found for this course' });
      }
  
      return res.status(200).json({ message: 'Tests fetched successfully', tests });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while fetching the tests' });
    }
  };

  export const getTestByIdAndCourseId = async (req, res) => {
    try {
      const { courseId, testId } = req.params;
  
      // Find the test by testId and ensure it belongs to the courseId
      const test = await TestModel.findOne({ _id: testId, course: courseId }).populate({
        path: 'questions',
        select: '-correctAnswer' // Exclude the correctAnswer field
      });

      
        
      if (!test) {
        return res.status(404).json({ message: 'Test not found for the given course' });
      }
  
      return res.status(200).json({ message: 'Test fetched successfully', test });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while fetching the test' });
    }
  };

  export const submitTest = async (req, res) => {
    try {
      const { testId, userId, responses } = req.body;
  
      // Validate test existence
      const test = await TestModel.findById(testId).populate('questions');
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
  
      // Determine test type
      const testType = test.type;
  
      // Validate and process responses
      let totalMarksObtained = 0;
      const processedResponses = await Promise.all(
        responses.map(async (response) => {
          const { questionId, userAnswer } = response;
  
          // Find the question
          const question = await TestQuestionModel.findById(questionId);
          if (!question) {
            throw new Error(`Question with ID ${questionId} not found`);
          }
  
          // Check correctness and calculate marks
          const isCorrect = question.correctAnswer === userAnswer;
          const marksObtained = isCorrect ? question.marks : 0;
          totalMarksObtained += marksObtained;
  
          return {
            questionId: question._id,
            questionText: question.questionText,
            userAnswer,
            correctAnswer: question.correctAnswer,
            marksObtained,
            isCorrect,
          };
        })
      );
  
      // Store the test response
      const testResponse = new TestResponseModel({
        userId: testType === 'entrance test' ? null : userId, // Set userId only for regular tests
        testId,
        courseId: test.course,
        testType,
        responses: processedResponses,
        totalMarksObtained,
        submissionTime: new Date(),
        status: 'submitted',
      });
  
      const savedResponse = await testResponse.save();
  
      return res.status(201).json({
        message: 'Test submitted successfully',
        response: savedResponse,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while submitting the test' });
    }
  };
  export const getResponsesByCourseId = async (req, res) => {
    try {
      const { courseId } = req.params;
  
      // Fetch responses by courseId
      const responses = await TestResponseModel.find({ courseId })
        .populate('userId', 'name email') // Populate user details
        .populate('testId', 'title'); // Populate test details
  
      if (!responses || responses.length === 0) {
        return res.status(404).json({ message: 'No responses found for this course' });
      }
  
      return res.status(200).json({
        message: 'Responses fetched successfully',
        responses,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while fetching responses' });
    }
  };
  
  export const getResponsesByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Fetch responses by userId
      const responses = await TestResponseModel.find({ userId })
        .populate('testId', 'title') // Populate test details
        .populate('courseId', 'courseName'); // Populate course details
  
      if (!responses || responses.length === 0) {
        return res.status(404).json({ message: 'No responses found for this user' });
      }
  
      return res.status(200).json({
        message: 'Responses fetched successfully',
        responses,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while fetching responses' });
    }
  };

  export const deleteTestByIdAndCourseId = async (req, res) => {
    try {
      const { courseId, testId } = req.params;
  
      // Find the course to ensure it exists
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
  
      // Find the test to ensure it exists and belongs to the course
      const test = await TestModel.findOne({ _id: testId, course: courseId });
      if (!test) {
        return res.status(404).json({ error: 'Test not found for the given course' });
      }
  
      // Remove the test ID from the course's tests array
      course.tests = course.tests.filter(testIdInCourse => testIdInCourse.toString() !== testId);
      await course.save();
  
      // Delete the test from the database
      await TestModel.deleteOne({ _id: testId });
  
      // Delete the associated questions for the test
      await TestQuestionModel.deleteMany({ _id: { $in: test.questions } });
  
      return res.status(200).json({
        message: 'Test and associated questions deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while deleting the test' });
    }
  };
  