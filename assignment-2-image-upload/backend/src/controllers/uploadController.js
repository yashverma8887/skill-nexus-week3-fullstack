const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

exports.uploadSingleImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please select an image to upload' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl,
      uploadedAt: new Date()
    }
  });
};

exports.uploadMultipleImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one image to upload' });
  }

  const uploadedFiles = req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    uploadedAt: new Date()
  }));

  res.status(201).json({
    success: true,
    message: `${uploadedFiles.length} images uploaded successfully`,
    count: uploadedFiles.length,
    files: uploadedFiles
  });
};

exports.getAllImages = (req, res) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({ success: true, count: 0, images: [] });
    }

    const files = fs.readdirSync(uploadDir).filter(f => !f.startsWith('.'));
    const images = files.map(filename => {
      const stats = fs.statSync(path.join(uploadDir, filename));
      return {
        filename,
        url: `${req.protocol}://${req.get('host')}/uploads/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime || stats.mtime
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, count: images.length, images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteImage = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } else {
    return res.status(404).json({ success: false, message: 'Image not found' });
  }
};
