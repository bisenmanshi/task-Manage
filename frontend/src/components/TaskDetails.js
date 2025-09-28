import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function TaskDetails(){
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(()=> {
    load();
  }, [id]);

  const load = async () => {
    try{
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);
      setForm({
        title: res.data.title || '',
        description: res.data.description || '',
        dueDate: res.data.dueDate ? res.data.dueDate.split('T')[0] : '',
        priority: res.data.priority || 'Medium',
        status: res.data.status || 'Pending'
      });
    }catch(err){ console.error(err); }
  };

  const save = async () => {
    try{
      await api.put(`/tasks/${id}`, form);
      setEditing(false);
      load();
    }catch(err){ console.error(err); }
  };

  const del = async () => {
    if(!window.confirm('Delete task?')) return;
    try{
      await api.delete(`/tasks/${id}`);
      navigate('/');
    }catch(err){ console.error(err); }
  };

  if(!task) return <div>Loading...</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      {!editing ? (
        <>
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <div className="text-sm text-gray-600">Assigned to: {task.assignedTo?.name}</div>
          <div className="mt-2">{task.description}</div>
          <div className="mt-2">Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'}</div>
          <div className="mt-2">Priority: {task.priority}</div>
          <div className="mt-2">Status: {task.status}</div>

          <div className="mt-4 flex gap-2">
            <button onClick={()=>setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
            <button onClick={del} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg mb-2">Edit Task</h3>
          <input className="w-full p-2 border mb-2" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
          <textarea className="w-full p-2 border mb-2" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          <input type="date" className="w-full p-2 border mb-2" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} />
          <select className="w-full p-2 border mb-2" value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="w-full p-2 border mb-2" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option>Pending</option>
            <option>Completed</option>
          </select>
          <div className="flex gap-2">
            <button onClick={save} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
            <button onClick={()=>setEditing(false)} className="px-3 py-1 border rounded">Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}
