import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import {
  FolderKanban, CheckSquare, TrendingUp, Activity,
  Plus, ArrowRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-start gap-4 hover:border-gray-700 transition-colors">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function TaskStatusBadge({ status }) {
  const map = {
    pending:     'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    in_progress: 'bg-blue-900/40 text-blue-400 border-blue-800',
    completed:   'bg-green-900/40 text-green-400 border-green-800',
  };
  const labels = { pending: 'Pending', in_progress: 'In Progress', completed: 'Done' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] || map.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function PriorityDot({ priority }) {
  const colors = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[priority] || 'bg-gray-500'}`} />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await API.get('/api/projects');
        setProjects(projRes.data);

        // Fetch tasks from all projects
        const taskPromises = projRes.data.map((p) =>
          API.get(`/api/tasks/project/${p.id}`).then((r) => r.data).catch(() => [])
        );
        const allTasks = (await Promise.all(taskPromises)).flat();
        setTasks(allTasks);
      } catch (e) {
        // silently fail — no projects yet
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const recentTasks = [...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's an overview of your workspace today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderKanban} label="Projects" value={projects.length} color="bg-indigo-600" sub="Active workspaces" />
        <StatCard icon={CheckSquare} label="Total Tasks" value={tasks.length} color="bg-purple-600" sub={`${completed} completed`} />
        <StatCard icon={Clock} label="In Progress" value={inProgress} color="bg-blue-600" sub="Active tasks" />
        <StatCard icon={TrendingUp} label="Completion" value={`${completionRate}%`} color="bg-emerald-600" sub="Overall rate" />
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Overall Progress</h3>
            <span className="text-indigo-400 font-bold text-sm">{completionRate}%</span>
          </div>
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><CheckCircle2 size={12} className="text-green-500" />{completed} Done</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><Activity size={12} className="text-blue-500" />{inProgress} Active</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><AlertCircle size={12} className="text-yellow-500" />{pending} Pending</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Recent Tasks</h3>
            <Link to="/tasks" className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No tasks yet</p>
              <Link to="/tasks" className="text-indigo-400 text-sm hover:underline mt-1 inline-block">Create your first task</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
                  <PriorityDot priority={task.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Overview */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Projects</h3>
            <Link to="/projects" className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loadingData ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No projects yet</p>
              <Link to="/projects" className="text-indigo-400 text-sm hover:underline mt-1 inline-block">Create your first project</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{p.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-600 truncate">{p.description || 'No description'}</p>
                  </div>
                  <span className="text-xs bg-green-900/30 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">Active</span>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/projects"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-gray-700 rounded-xl text-gray-500 hover:text-indigo-400 hover:border-indigo-700 text-sm transition-all"
          >
            <Plus size={14} /> New Project
          </Link>
        </div>
      </div>
    </div>
  );
}
