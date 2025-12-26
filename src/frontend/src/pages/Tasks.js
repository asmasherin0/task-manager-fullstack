import React, { useEffect, useState } from 'react';
import API from '../services/api';
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilter(filter);
  }, [tasks, filter]);

  // FETCH TASKS
  const fetchTasks = async () => {
    try {
      const response = await API.get('tasks/');
      const data = response.data.results || response.data;
      setTasks(data);
      setLoading(false);
    } catch {
      setError('Failed to load tasks');
    }
  };

  // FILTER
  const applyFilter = (type) => {
    setFilter(type);

    if (type === 'completed') {
      setFilteredTasks(tasks.filter(t => t.completed));
    } else if (type === 'pending') {
      setFilteredTasks(tasks.filter(t => !t.completed));
    } else {
      setFilteredTasks(tasks);
    }
  };

  // ADD TASK
  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      await API.post('tasks/', { title, description });
      setTitle('');
      setDescription('');
      setError('');
      fetchTasks();
    } catch {
      setError('Failed to add task');
    }
  };

  // COMPLETE TASK
  const markCompleted = async (id) => {
    try {
      await API.patch(`tasks/${id}/`, { completed: true });
      fetchTasks();
    } catch {
      setError('Failed to update task');
    }
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await API.delete(`tasks/${id}/`);
      fetchTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // PROGRESS
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      {/* HEADER */}
      <div className="header">
        <h2>My Tasks</h2>
        <div>
          <button className="dark-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* ADD TASK */}
      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
        />

        <input
          type="text"
          placeholder="Task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Add Task</button>
      </form>

      {/* FILTERS */}
      <div className="filters">
        <button onClick={() => applyFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => applyFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
        <button onClick={() => applyFilter('pending')} className={filter === 'pending' ? 'active' : ''}>Pending</button>
      </div>

      {/* PROGRESS BAR */}
      <div className="progress-container">
        <div className="progress-info">
          Completed: {completedCount} / {totalCount}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* TASK LIST */}
      {filteredTasks.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>No tasks found</p>
      ) : (
        <ul>
          {filteredTasks.map(task => (
            <li key={task.id} className={task.completed ? 'completed-task' : ''}>
              <div>
                <strong>{task.title}</strong>
                <span className={`badge ${task.completed ? 'completed' : 'pending'}`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
              </div>

              <div className="task-buttons">
                {!task.completed && (
                  <button className="complete-btn" onClick={() => markCompleted(task.id)}>
                    Complete
                  </button>
                )}
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tasks;
