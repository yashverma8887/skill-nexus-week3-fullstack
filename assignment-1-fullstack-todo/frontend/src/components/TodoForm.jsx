import React, { useState } from 'react';

export default function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onAddTodo({ title, description, priority, dueDate });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="todo-card">
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Task</h3>
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <textarea
          className="form-textarea"
          placeholder="Add description or notes (optional)"
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Priority</label>
          <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Due Date</label>
          <input
            type="date"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
          {loading ? 'Adding...' : '+ Add Task'}
        </button>
      </div>
    </form>
  );
}
