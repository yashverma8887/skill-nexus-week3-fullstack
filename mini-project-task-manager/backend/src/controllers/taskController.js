const Task = require('../models/Task');

global.mpTasks = global.mpTasks || [
  {
    _id: 'task_demo_1',
    user: 'demo_user',
    title: 'Implement React Frontend with Context API',
    description: 'Set up global auth and task state providers with axios interceptors',
    status: 'completed',
    priority: 'high',
    category: 'Engineering',
    dueDate: '2026-10-05',
    attachmentUrl: '',
    attachmentName: '',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'task_demo_2',
    user: 'demo_user',
    title: 'Configure Multer file upload endpoint',
    description: 'Support image uploading, storage destination and diskStorage',
    status: 'in-progress',
    priority: 'urgent',
    category: 'Engineering',
    dueDate: '2026-10-06',
    attachmentUrl: '',
    attachmentName: '',
    createdAt: new Date().toISOString()
  }
];

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { status, priority, category, search, sort } = req.query;

    try {
      const query = { user: userId };
      if (status && status !== 'all') query.status = status;
      if (priority && priority !== 'all') query.priority = priority;
      if (category && category !== 'all') query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'dueDate') sortOptions = { dueDate: 1 };
      if (sort === 'priority') sortOptions = { priority: 1 };

      const tasks = await Task.find(query).sort(sortOptions);
      return res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (e) {
      let filtered = global.mpTasks.filter(t => t.user === userId || t.user === 'demo_user');
      if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
      if (priority && priority !== 'all') filtered = filtered.filter(t => t.priority === priority);
      if (category && category !== 'all') filtered = filtered.filter(t => t.category === category);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
      }
      return res.status(200).json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let tasks = [];
    try {
      tasks = await Task.find({ user: userId });
    } catch (e) {
      tasks = global.mpTasks.filter(t => t.user === userId || t.user === 'demo_user');
    }

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

    res.status(200).json({
      success: true,
      stats: { total, completed, inProgress, pending, urgent }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const userId = req.user._id.toString();
    let attachmentUrl = '';
    let attachmentName = '';

    if (req.file) {
      attachmentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      attachmentName = req.file.originalname;
    }

    try {
      const task = await Task.create({
        user: userId,
        title: title.trim(),
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        category: category || 'General',
        dueDate: dueDate || null,
        attachmentUrl,
        attachmentName
      });
      return res.status(201).json({ success: true, data: task });
    } catch (e) {
      const newTask = {
        _id: 'task_' + Date.now(),
        user: userId,
        title: title.trim(),
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        category: category || 'General',
        dueDate: dueDate || null,
        attachmentUrl,
        attachmentName,
        createdAt: new Date().toISOString()
      };
      global.mpTasks.unshift(newTask);
      return res.status(201).json({ success: true, data: newTask });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const updateData = { ...req.body };
    if (req.file) {
      updateData.attachmentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      updateData.attachmentName = req.file.originalname;
    }

    try {
      const task = await Task.findOneAndUpdate(
        { _id: id, user: userId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      return res.status(200).json({ success: true, data: task });
    } catch (e) {
      const idx = global.mpTasks.findIndex(t => t._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });
      global.mpTasks[idx] = { ...global.mpTasks[idx], ...updateData, updatedAt: new Date().toISOString() };
      return res.status(200).json({ success: true, data: global.mpTasks[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    try {
      const task = await Task.findOneAndDelete({ _id: id, user: userId });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      return res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (e) {
      const initLen = global.mpTasks.length;
      global.mpTasks = global.mpTasks.filter(t => t._id !== id);
      if (global.mpTasks.length === initLen) return res.status(404).json({ success: false, message: 'Task not found' });
      return res.status(200).json({ success: true, message: 'Task deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
