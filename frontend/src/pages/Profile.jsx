import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Zap, Loader2, CheckCircle2 } from 'lucide-react';

const EXPERIENCE_LEVELS = ['Junior', 'Intermediate', 'Senior', 'Expert'];

export default function Profile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || '',
    experience_level: user?.experience_level || 'Intermediate',
  });

  // Profile update would call the backend – for demo we just simulate
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const skillsList = form.skills
    ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information and skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="md:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-white font-semibold">{user?.name}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-900/40 border border-indigo-800 rounded-full">
              <Zap size={12} className="text-indigo-400" />
              <span className="text-xs text-indigo-300 font-medium">{form.experience_level}</span>
            </div>

            {/* Skills preview */}
            {skillsList.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                {skillsList.slice(0, 6).map((s) => (
                  <span key={s} className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
                {skillsList.length > 6 && (
                  <span className="text-xs bg-gray-800 text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">
                    +{skillsList.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit form */}
        <div className="md:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-5">Edit Information</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Skills <span className="text-gray-600">(comma-separated)</span>
                </label>
                <input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Node.js, Docker, Python"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Experience Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setForm({ ...form, experience_level: lvl })}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        form.experience_level === lvl
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium transition-all mt-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saved && <CheckCircle2 size={14} className="text-green-400" />}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
