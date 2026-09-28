import React from 'react';

export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-left">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo._id)}
        />
        <div>
          <div className="todo-title">{todo.title}</div>
          {todo.description && <div className="todo-desc">{todo.description}</div>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', alignItems: 'center' }}>
            <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
            {todo.dueDate && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                📅 {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <button onClick={() => onDelete(todo._id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
        Delete
      </button>
    </div>
  );
}
