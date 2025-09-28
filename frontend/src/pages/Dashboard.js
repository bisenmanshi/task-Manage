import React, { useEffect, useState } from 'react';
import api from '../api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

export default function Dashboard(){
  const [refreshKey, setRefreshKey] = useState(0);

  // increment refreshKey to reload tasks after create/edit/delete
  const reload = () => setRefreshKey(k => k + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 bg-white p-4 rounded shadow">
        <TaskForm onCreated={reload} />
      </div>
      <div className="md:col-span-2 bg-white p-4 rounded shadow">
        <TaskList refreshKey={refreshKey} onEditOrDelete={reload} />
      </div>
    </div>
  );
}
