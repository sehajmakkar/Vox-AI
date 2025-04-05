import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Create absolute path to uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
console.log('Uploads directory path:', uploadsDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory at:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Saving file to:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname); // e.g. '.mp3'
    const base = path.basename(file.originalname, ext); // remove extension
    const uniqueName = `${base}-${fileId}${ext}`;
    console.log('Generated unique filename:', uniqueName);
    cb(null, uniqueName);
  }
});

// Only allow audio files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error('Rejected file with MIME type:', file.mimetype);
    cb(new Error('Unsupported file type. Only audio files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export default upload;
