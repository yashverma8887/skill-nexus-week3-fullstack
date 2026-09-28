const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { getTasks, getStats, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.route('/')
  .get(getTasks)
  .post(upload.single('attachment'), createTask);

router.route('/:id')
  .put(upload.single('attachment'), updateTask)
  .delete(deleteTask);

module.exports = router;
