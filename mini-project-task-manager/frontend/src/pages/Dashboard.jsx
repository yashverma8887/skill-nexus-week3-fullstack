import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, pending: 0, urgent: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Engineering');
  const [dueDate, setDueDate] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', {
        params: { status: statusFilter, priority: priorityFilter, category: categoryFilter, search }
      });
      setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.stats || { total: 0, completed: 0, inProgress: 0, pending: 0, urgent: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [statusFilter, priorityFilter, categoryFilter, search]);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
    setCategory('Engineering');
    setDueDate('');
    setAttachment(null);
    setAttachmentPreview(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setCategory(task.category || 'General');
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setAttachment(null);
    setAttachmentPreview(task.attachmentUrl || null);
    setModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('priority', priority);
    formData.append('category', category);
    if (dueDate) formData.append('dueDate', dueDate);
    if (attachment) formData.append('attachment', attachment);

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModalOpen(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await updateProfile(formData);
      alert('Avatar updated successfully!');
    } catch (err) {
      alert('Failed to update avatar');
    }
  };

  return (
    <div className="main-content">
      <header className="topbar">
        <div className="brand-logo">
          <span>⚡ TaskMaster Pro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
              alt="Avatar"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</span>
          </label>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
        {/* Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>📊</div>
            <div>
              <div className="stat-val">{stats.total}</div>
              <div className="stat-lbl">TOTAL TASKS</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✅</div>
            <div>
              <div className="stat-val">{stats.completed}</div>
              <div className="stat-lbl">COMPLETED</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>⚡</div>
            <div>
              <div className="stat-val">{stats.inProgress}</div>
              <div className="stat-lbl">IN PROGRESS</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}>🔥</div>
            <div>
              <div className="stat-val">{stats.urgent}</div>
              <div className="stat-lbl">URGENT</div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search tasks by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Personal">Personal</option>
              <option value="General">General</option>
            </select>

            <button className="btn btn-primary" onClick={openCreateModal}>
              + New Task
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="task-grid">
          {tasks.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', color: '#64748b' }}>
              No tasks found. Click "+ New Task" to create one!
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>{task.title}</h3>
                {task.description && <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', flex: 1 }}>{task.description}</p>}

                {task.attachmentUrl && (
                  <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={task.attachmentUrl} alt="Attachment" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>📂 {task.category || 'General'}</span>
                  {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '0.45rem' }} onClick={() => openEditModal(task)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.45rem 0.75rem' }} onClick={() => handleDeleteTask(task._id)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSaveTask}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Title</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Description</label>
                <textarea
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional task notes..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Status</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Priority</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Category</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Personal">Personal</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Due Date</label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Image Attachment (Multer Upload)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      setAttachment(f);
                      setAttachmentPreview(URL.createObjectURL(f));
                    }
                  }}
                />
                {attachmentPreview && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img src={attachmentPreview} alt="Preview" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
