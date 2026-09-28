import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/todos');
      setTodos(res.data.data || []);
    } catch (err) {
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (todoData) => {
    try {
      const res = await api.post('/todos', todoData);
      if (res.data.success) {
        setTodos([res.data.data, ...todos]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/todos/${id}/toggle`);
      if (res.data.success) {
        setTodos(todos.map(t => t._id === id ? res.data.data : t));
      }
    } catch (err) {
      console.error('Error toggling todo:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>My Task Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {completedCount} of {todos.length} tasks completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('active')}
          >
            Active ({todos.length - completedCount})
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      <TodoForm onAddTodo={handleAddTodo} />

      <div className="todo-list">
        {loading ? (
          <div className="empty-state">Loading tasks...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found under this filter.</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
