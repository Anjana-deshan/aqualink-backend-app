// Upload image endpoint
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // The file is already uploaded to Cloudinary by multer-storage-cloudinary
    // req.file.path contains the Cloudinary URL
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path, // This is the Cloudinary URL
      publicId: req.file.filename, // This is the public ID
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
};