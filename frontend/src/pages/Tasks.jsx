import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Plus, Loader2, CheckSquare, X, Calendar, CheckCircle2 } from 'lucide-react';

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const STATUS_OPTIONS = ['pending', 'in_progress', 'completed'];

function TaskModal({ projects, onClose, onSaved }) {
  const [form, setForm] = useState({
    project_id: projects[0]?.id || '',
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project_id) return setError('Please select a project.');
    setSaving(true);
    try {
      const res = await API.post('/api/tasks', {
        ...form,
        due_date: form.due_date || null,
      });
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="font-semibold text-white">New Task</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Project</label>
            <select
              required
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Task Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Set up CI/CD pipeline"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const priorityStyle = {
  high:   { dot: 'bg-red-500',    badge: 'bg-red-900/30 text-red-400 border-red-800' },
  medium: { dot: 'bg-yellow-500', badge: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
  low:    { dot: 'bg-green-500',  badge: 'bg-green-900/30 text-green-400 border-green-800' },
};

const statusStyle = {
  pending:     'bg-gray-800 text-gray-400 border-gray-700',
  in_progress: 'bg-blue-900/30 text-blue-400 border-blue-800',
  completed:   'bg-green-900/30 text-green-400 border-green-800',
};
const statusLabel = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const projRes = await API.get('/api/projects');
        setProjects(projRes.data);
        const allTasks = (
          await Promise.all(projRes.data.map((p) =>
            API.get(`/api/tasks/project/${p.id}`).then((r) => r.data).catch(() => [])
          ))
        ).flat();
        setTasks(allTasks);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleStatus = async (task) => {
    const next = task.status === 'completed' ? 'pending' : task.status === 'pending' ? 'in_progress' : 'completed';
    try {
      const res = await API.put(`/api/tasks/${task.id}/status`, { status: next });
      setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    } catch (_) {}
  };

  const filtered = filterStatus === 'all' ? tasks : tasks.filter((t) => t.status === filterStatus);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} total tasks</p>
        </div>
        {projects.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-900/40"
          >
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              filterStatus === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All' : statusLabel[s]}
            <span className="ml-1.5 text-xs opacity-70">
              {s === 'all' ? tasks.length : tasks.filter((t) => t.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse border border-gray-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <CheckSquare size={28} className="text-gray-700 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No tasks found</p>
          <p className="text-gray-600 text-sm">
            {projects.length === 0
              ? 'Create a project first, then add tasks.'
              : 'Add your first task using the button above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const p = priorityStyle[task.priority] || priorityStyle.medium;
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 bg-gray-900 border rounded-xl hover:border-gray-700 transition-all group ${
                  task.status === 'completed' ? 'border-gray-800 opacity-70' : 'border-gray-800'
                }`}
              >
                {/* Check button */}
                <button
                  onClick={() => toggleStatus(task)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.status === 'completed'
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-600 hover:border-indigo-500'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 size={12} className="text-white" />}
                </button>

                {/* Priority dot */}
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className={`text-xs flex items-center gap-1 mt-0.5 ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
                      <Calendar size={10} />
                      {isOverdue ? 'Overdue · ' : ''}
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${p.badge}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusStyle[task.status]}`}>
                    {statusLabel[task.status]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <TaskModal
          projects={projects}
          onClose={() => setShowModal(false)}
          onSaved={(t) => setTasks([t, ...tasks])}
        />
      )}
    </div>
  );
}
