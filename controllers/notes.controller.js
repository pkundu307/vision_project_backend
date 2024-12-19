import { uploadNotes } from '../utils/s3.js'; // Assuming your uploadNotes function is in this file
import { NoteModel } from '../models/course.schema.js';
import { CourseModel } from '../models/course.schema.js';

// Upload Notes by Course ID
export const uploadNote = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { fileType, title, textContent } = req.body;

    

    // Validate Course
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let content = '';

    if (fileType !== 'text') {
      // Check file in request
      if (!req.files) {
     
        
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = req.files;
      console.log(file.files.name);

      

      // Upload file to S3
      const uploadResult = await uploadNotes(file.files.data, file.files.name);
      content = uploadResult; // S3 file URL
    } else {
      // For text notes
      if (!textContent) {
        return res.status(400).json({ message: 'Text content is required for text notes' });
      }
      content = textContent;
    }

    // Create note entry in database
    const note = new NoteModel({
      type: fileType,
      content, // Either S3 URL or plain text
      title: title || (fileType !== 'text' ? req.files.file.name : 'Untitled'),
      course: courseId,
    });

    await note.save();
    course.notes.push(note._id)
    await course.save();
    res.status(201).json({ message: 'Note uploaded successfully', note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading note', error: error.message });
  }
};


// Get Notes by Course ID
export const getNotesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate Course
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Fetch notes
    const notes = await NoteModel.find({ course: courseId });

    if (notes.length === 0) {
      return res.status(404).json({ message: 'No notes found for this course' });
    }

    res.status(200).json({ notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};
