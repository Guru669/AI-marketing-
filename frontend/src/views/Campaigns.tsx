import { useEffect, useState, useCallback } from 'react';
import { PLATFORMS, CAMPAIGN_GOALS, CAMPAIGN_STATUSES, type Business, type Campaign, type Post } from '@/lib/types';
import { Megaphone, Plus, Calendar, Target, X, TrendingUp, Edit2, Trash2, CheckSquare, ListTodo } from 'lucide-react';

const CAMPAIGN_TOOLS = [
  { id: 'planner', label: 'Campaign Planner', icon: Megaphone },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

export default function Campaigns({ business }: { business: Business }) {
  const [activeTool, setActiveTool] = useState('planner');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<{
    name: string;
    goal: string;
    platform: string;
    status: string;
    start_date: string;
    end_date: string;
    budget: string;
  }>({
    name: '',
    goal: CAMPAIGN_GOALS[0],
    platform: business.platforms[0] || 'instagram',
    status: 'draft',
    start_date: '',
    end_date: '',
    budget: '',
  });

  const load = useCallback(async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    setLoading(true);
    try {
      const [campaignsRes, postsRes] = await Promise.all([
        fetch(`${API_URL}/campaigns/business/${business.id}`),
        fetch(`${API_URL}/posts/business/${business.id}`),
      ]);
      const campaignsData = await campaignsRes.json();
      const postsData = await postsRes.json();

      const mappedCampaigns: Campaign[] = campaignsData.map((c: any) => ({
        id: c._id,
        business_id: c.businessId,
        name: c.name,
        goal: c.goal,
        platform: c.platform,
        status: c.status,
        start_date: c.startDate,
        end_date: c.endDate,
        budget: c.budget,
        created_at: c.createdAt
      }));

      const mappedPosts: Post[] = postsData.map((p: any) => ({
        id: p._id,
        business_id: p.businessId,
        campaign_id: p.campaignId,
        platform: p.platform,
        content_type: p.contentType,
        caption: p.caption,
        hashtags: p.hashtags,
        best_post_time: p.bestPostTime,
        status: p.status,
        scheduled_for: p.scheduledTime,
        ai_score: p.aiScore,
        media_url: p.mediaUrl,
        platform_post_url: p.platformPostUrl,
        created_at: p.createdAt
      }));

      setCampaigns(mappedCampaigns);
      setPosts(mappedPosts);
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [business.id]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: '', goal: CAMPAIGN_GOALS[0], platform: business.platforms[0] || 'instagram', status: 'draft', start_date: '', end_date: '', budget: '' });
    setEditing(null);
    setShowForm(false);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    const payload = {
      businessId: business.id,
      name: form.name,
      goal: form.goal,
      platform: form.platform,
      status: form.status,
      startDate: form.start_date || null,
      endDate: form.end_date || null,
      budget: form.budget ? parseFloat(form.budget) : 0,
    };

    try {
      const url = editing ? `${API_URL}/campaigns/${editing.id}` : `${API_URL}/campaigns`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save campaign');

      resetForm();
      load();
    } catch (err) {
      console.error('Error saving campaign:', err);
    }
  };

  const edit = (c: Campaign) => {
    setEditing(c);
    setForm({
      name: c.name,
      goal: c.goal || CAMPAIGN_GOALS[0],
      platform: c.platform,
      status: c.status,
      start_date: c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : '',
      end_date: c.end_date ? new Date(c.end_date).toISOString().split('T')[0] : '',
      budget: c.budget?.toString() || '',
    });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    try {
      const res = await fetch(`${API_URL}/campaigns/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete campaign');
      load();
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="badge-green">Active</span>;
      case 'paused': return <span className="badge-amber">Paused</span>;
      case 'completed': return <span className="badge-blue">Completed</span>;
      default: return <span className="badge-stone">Draft</span>;
    }
  };

  const campaignPosts = (id: string) => posts.filter((p) => p.campaign_id === id);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-stone-900 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Campaign Management</h1>
          <p className="text-stone-500 mt-2">Plan, organize, and track your marketing campaigns and tasks.</p>
        </div>
        {activeTool === 'planner' && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        )}
      </div>

      {/* Tool Selector */}
      <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
        {CAMPAIGN_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTool === tool.id
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTool === tool.id ? 'text-indigo-600' : 'text-stone-400'}`} />
              {tool.label}
            </button>
          );
        })}
      </div>

      {activeTool === 'planner' && (
        <>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={() => resetForm()}>
              <div className="card p-6 w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-stone-900">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
                  <button onClick={resetForm} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Campaign Name</label>
                    <input className="input-field" placeholder="e.g. Summer Launch 2024" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Goal</label>
                      <select className="input-field" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                        {CAMPAIGN_GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Platform</label>
                      <select className="input-field" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                        {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Start Date</label>
                      <input type="date" className="input-field" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">End Date</label>
                      <input type="date" className="input-field" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Budget ($)</label>
                      <input type="number" className="input-field" placeholder="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={save} className="btn-primary flex-1">{editing ? 'Update' : 'Create'} Campaign</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {campaigns.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-stone-300" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">No campaigns yet</h3>
              <p className="text-sm text-stone-400 mb-4">Create your first campaign to start organizing your marketing efforts.</p>
              <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Campaign
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {campaigns.map((c) => {
                const cp = campaignPosts(c.id);
                return (
                  <div key={c.id} className="card card-hover p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-stone-900 text-lg">{c.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          {statusBadge(c.status)}
                          <span className="badge-stone capitalize">{c.platform}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => edit(c)} className="btn-ghost p-2"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(c.id)} className="btn-ghost p-2 text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {c.goal && (
                        <div className="flex items-center gap-2 text-stone-500">
                          <Target className="w-3.5 h-3.5" /> {c.goal}
                        </div>
                      )}
                      {(c.start_date || c.end_date) && (
                        <div className="flex items-center gap-2 text-stone-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {c.start_date ? new Date(c.start_date).toLocaleDateString() : '—'} → {c.end_date ? new Date(c.end_date).toLocaleDateString() : '—'}
                        </div>
                      )}
                      {c.budget > 0 && (
                        <div className="flex items-center gap-2 text-stone-500">
                          <span className="font-semibold">${c.budget}</span> budget
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-stone-500">
                        <TrendingUp className="w-3.5 h-3.5" /> {cp.length} post{cp.length !== 1 ? 's' : ''} linked
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTool === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-600" />
              Campaign Tasks
            </h2>
            <button className="btn-secondary text-xs">Add Task</button>
          </div>
          <div className="card overflow-hidden">
            <div className="divide-y divide-stone-100">
              {[
                { title: 'Research hashtags for Summer Launch', campaign: 'Summer Launch', due: 'Tomorrow', status: 'pending' },
                { title: 'Record video for Reel', campaign: 'Brand Awareness', due: 'May 20', status: 'pending' },
                { title: 'Approve ad copy for Facebook', campaign: 'Seasonal Sale', due: 'Completed', status: 'done' },
                { title: 'Update bio links', campaign: 'General', due: 'Completed', status: 'done' },
              ].map((task, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300'}`}>
                      {task.status === 'done' && <X className="w-3 h-3 text-white rotate-45" /* Checkmark simulation */ />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${task.status === 'done' ? 'text-stone-400 line-through' : 'text-stone-900'}`}>{task.title}</p>
                      <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-0.5">{task.campaign} • Due {task.due}</p>
                    </div>
                  </div>
                  <button className="text-stone-400 hover:text-stone-600 p-1">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
