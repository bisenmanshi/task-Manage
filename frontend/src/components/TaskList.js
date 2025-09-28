import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function priorityColor(p){
  if(p==='High') return 'bg-red-200 text-red-800';
  if(p==='Medium') return 'bg-orange-200 text-orange-800';
  return 'bg-green-200 text-green-800';
}

export default function TaskList({ refreshKey, onEditOrDelete }){
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [q,setQ] = useState('');
  const [priorityFilter,setPriorityFilter]=useState('');

  useEffect(()=> {
    load();
    // eslint-disable-next-line
  }, [page, refreshKey, priorityFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', { params: { page, limit, q, priority: priorityFilter } });
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally{ setLoading(false); }
  };

  const toggleStatus = async (task) => {
    try{
      const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      load();
      if(onEditOrDelete) onEditOrDelete();
    }catch(err){ console.error(err); }
  };

  const remove = async (task) => {
    if(!window.confirm('Delete this task?')) return;
    try{
      await api.delete(`/tasks/${task._id}`);
      load();
      if(onEditOrDelete) onEditOrDelete();
    }catch(err){ console.error(err); }
  };

  return (
    <div>
      <div className="flex items-center mb-3 gap-2">
        <input placeholder="Search title..." value={q} onChange={e=>setQ(e.target.value)} className="p-2 border flex-1" />
        <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} className="p-2 border">
          <option value="">All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <button onClick={()=>{ setPage(1); load(); }} className="bg-gray-200 px-3 py-2 rounded">Search</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task._id} className="p-3 border rounded flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-sm ${priorityColor(task.priority)}`}>{task.priority}</div>
                  <Link to={`/tasks/${task._id}`} className="font-semibold">{task.title}</Link>
                  <span className="text-sm ml-2 text-gray-500">due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</span>
                </div>
                <div className="text-sm text-gray-700 mt-1">{task.description?.slice(0,150)}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={()=>toggleStatus(task)} className="px-3 py-1 border rounded">{task.status === 'Pending' ? 'Mark Completed' : 'Mark Pending'}</button>
                <Link to={`/tasks/${task._id}`} className="text-blue-600">View</Link>
                <button onClick={()=>remove(task)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2 items-center">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 border rounded">Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
