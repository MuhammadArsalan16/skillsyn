import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Plus, Loader2, FolderKanban, X, Trash2, Calendar } from 'lucide-react';

function Modal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post('/api/projects', form);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="font-semibold text-white">New Project</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Project Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My Awesome Project"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this project about?"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    API.get('/api/projects')
      .then((r) => setProjects(r.data))
      .finally(() => setLoading(false));
  }, []);

  const colors = [
    'from-indigo-600 to-purple-700',
    'from-blue-600 to-indigo-700',
    'from-purple-600 to-pink-700',
    'from-emerald-600 to-teal-700',
    'from-orange-600 to-red-700',
    'from-rose-600 to-pink-700',
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} active workspace{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-900/40"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-gray-900 rounded-2xl animate-pulse border border-gray-800" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
            <FolderKanban size={28} className="text-gray-700" />
          </div>
          <h3 className="text-white font-semibold mb-1">No projects yet</h3>
          <p className="text-gray-600 text-sm mb-6">Create your first project to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all hover:-translate-y-0.5 group">
              {/* Card Header Gradient */}
              <div className={`h-2 bg-gradient-to-r ${colors[i % colors.length]}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{p.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-xs bg-green-900/30 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <h3 className="text-white font-semibold mt-3 mb-1 group-hover:text-indigo-300 transition-colors">{p.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {p.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors">View tasks →</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add new project card */}
          <button
            onClick={() => setShowModal(true)}
            className="border-2 border-dashed border-gray-800 rounded-2xl h-44 flex flex-col items-center justify-center gap-2 text-gray-600 hover:border-indigo-700 hover:text-indigo-400 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <span className="text-sm font-medium">New Project</span>
          </button>
        </div>
      )}

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onSaved={(p) => setProjects([p, ...projects])}
        />
      )}
    </div>
  );
}
