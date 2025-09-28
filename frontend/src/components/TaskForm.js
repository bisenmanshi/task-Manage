import React, { useEffect, useState } from 'react';
import api from '../api';

export default function TaskForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [err, setErr] = useState('');

  useEffect(()=> {
    // Load users to assign tasks - optional endpoint not implemented in backend earlier
    // If no users endpoint, set assignedTo to current user
    const user = JSON.parse(localStorage.getItem('user'));
    if(user) setAssignedTo(user.id || user._id || '');
    // OPTIONAL: fetch /api/users if you add endpoint
  },[]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, description, dueDate, priority, assignedTo };
      await api.post('/tasks', payload);
      setTitle(''); setDescription(''); setDueDate(''); setPriority('Medium');
      if(onCreated) onCreated();
    } catch (err) {
      setErr(err.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Create Task</h3>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <form onSubmit={submit}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border mb-2" required />
        <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border mb-2" />
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full p-2 border mb-2" />
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="w-full p-2 border mb-2">
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        {/* assignedTo is current user by default */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Task</button>
      </form>
    </div>
  );
}
