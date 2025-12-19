import multer from 'multer'
import path from 'path'

// Configure storage for uploaded files

const storage = multer.diskStorage({
  // Destination folder for uploads
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },

  // Custom filename
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-randomnumber-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    )
  }
})

// File filter - only accept images

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/

  // Check extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  )

  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype)

  if(mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp'))
  }
}

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: fileFilter,
})

export default upload