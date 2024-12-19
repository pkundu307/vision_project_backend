import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Configure AWS S3
const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIA6D6JBV5PE6W5JDWF',
    secretAccessKey: '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',
  },
});

// Function to upload image to S3

export const uploadNotes = async (fileContent, fileName) => {

  const fileExtension = fileName.split('.').pop().toLowerCase();
  let contentType;

  if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
    contentType = 'image/jpeg';
  } else if (fileExtension === 'png') {
    contentType = 'image/png';
  } else if (fileExtension === 'pdf') {
    contentType = 'application/pdf';
  } else {
    throw new Error('Unsupported file type');
  }

  const params = {
    Bucket: "zauvijekimages",
    Key: `notes/${fileName}`,
    Body: fileContent, // Buffer or ReadableStream
    ACL: 'public-read',
    ContentType: contentType,
  };

  try {
    const upload = new Upload({
      client: s3,
      params,
    });

    const result = await upload.done();
    const url = `https://zauvijekimages.s3.ap-south-1.amazonaws.com/${params.Key}`;
  

    return url;
  } catch (error) {
    console.error('Error uploading to S3', error);
    throw error;
  }
};
