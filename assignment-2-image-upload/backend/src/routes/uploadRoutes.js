const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadSingleImage, uploadMultipleImages, getAllImages, deleteImage } = require('../controllers/uploadController');

router.get('/', getAllImages);
router.post('/single', upload.single('image'), uploadSingleImage);
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);
router.delete('/:filename', deleteImage);

module.exports = router;
