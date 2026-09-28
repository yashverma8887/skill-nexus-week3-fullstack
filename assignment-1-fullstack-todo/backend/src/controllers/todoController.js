const Todo = require('../models/Todo');

global.memoryTodos = global.memoryTodos || [];

exports.getTodos = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    try {
      const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: todos.length, data: todos });
    } catch (e) {
      const userTodos = global.memoryTodos.filter(t => t.user === userId);
      return res.status(200).json({ success: true, count: userTodos.length, data: userTodos });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Task title is required' });
    const userId = req.user._id.toString();

    try {
      const todo = await Todo.create({ user: userId, title: title.trim(), description: description || '', priority: priority || 'medium', dueDate: dueDate || null });
      return res.status(201).json({ success: true, data: todo });
    } catch (e) {
      const newTodo = { _id: 'todo_' + Date.now(), user: userId, title: title.trim(), description: description || '', completed: false, priority: priority || 'medium', dueDate: dueDate || null, createdAt: new Date().toISOString() };
      global.memoryTodos.unshift(newTodo);
      return res.status(201).json({ success: true, data: newTodo });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    try {
      const todo = await Todo.findOneAndUpdate({ _id: id, user: userId }, req.body, { new: true, runValidators: true });
      if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
      return res.status(200).json({ success: true, data: todo });
    } catch (e) {
      const idx = global.memoryTodos.findIndex(t => t._id === id && t.user === userId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Todo not found' });
      global.memoryTodos[idx] = { ...global.memoryTodos[idx], ...req.body, updatedAt: new Date().toISOString() };
      return res.status(200).json({ success: true, data: global.memoryTodos[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    try {
      const todo = await Todo.findOne({ _id: id, user: userId });
      if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
      todo.completed = !todo.completed;
      await todo.save();
      return res.status(200).json({ success: true, data: todo });
    } catch (e) {
      const item = global.memoryTodos.find(t => t._id === id && t.user === userId);
      if (!item) return res.status(404).json({ success: false, message: 'Todo not found' });
      item.completed = !item.completed;
      return res.status(200).json({ success: true, data: item });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    try {
      const todo = await Todo.findOneAndDelete({ _id: id, user: userId });
      if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
      return res.status(200).json({ success: true, message: 'Todo deleted successfully' });
    } catch (e) {
      const initLen = global.memoryTodos.length;
      global.memoryTodos = global.memoryTodos.filter(t => !(t._id === id && t.user === userId));
      if (global.memoryTodos.length === initLen) return res.status(404).json({ success: false, message: 'Todo not found' });
      return res.status(200).json({ success: true, message: 'Todo deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
