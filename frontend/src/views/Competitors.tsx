import { useEffect, useState, useCallback } from 'react';
import { PLATFORMS, type Business, type Competitor } from '@/lib/types';
import {
  Users,
  Plus,
  X,
  Edit2,
  Trash2,
  TrendingUp,
  Eye,
  Heart,
  Calendar,
  Sparkles,
  Lightbulb,
  ShieldAlert,
  Zap,
  Target,
  BarChart3,
  Loader2,
} from 'lucide-react';

export default function Competitors({ business }: { business: Business }) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Competitor | null>(null);
  const [activeTeardown, setActiveTeardown] = useState<Record<string, any>>({});
  const [teardownLoading, setTeardownLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    platform: business.platforms[0] || 'instagram',
    handle: '',
    follower_count: '',
    avg_engagement_rate: '',
    posting_frequency: 'daily',
    top_content_type: '',
    notes: '',
  });

  const load = useCallback(async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/competitors/business/${business.id}`);
      if (!response.ok) throw new Error('Failed to fetch competitors');
      const data = await response.json();

      const mappedCompetitors: Competitor[] = data.map((comp: any) => ({
        id: comp._id,
        business_id: comp.businessId,
        name: comp.name,
        platform: comp.platform,
        handle: comp.handle,
        follower_count: comp.followerCount,
        avg_engagement_rate: comp.avgEngagementRate,
        posting_frequency: comp.postingFrequency,
        top_content_type: comp.topContentType,
        notes: comp.notes,
        created_at: comp.createdAt
      }));

      setCompetitors(mappedCompetitors);
    } catch (err) {
      console.error('Error loading competitors:', err);
    } finally {
      setLoading(false);
    }
  }, [business.id]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({
      name: '',
      platform: business.platforms[0] || 'instagram',
      handle: '',
      follower_count: '',
      avg_engagement_rate: '',
      posting_frequency: 'daily',
      top_content_type: '',
      notes: '',
    });
    setEditing(null);
    setShowForm(false);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    const payload = {
      businessId: business.id,
      name: form.name,
      platform: form.platform,
      handle: form.handle,
      followerCount: form.follower_count ? parseInt(form.follower_count) : 0,
      avgEngagementRate: form.avg_engagement_rate ? parseFloat(form.avg_engagement_rate) : 0,
      postingFrequency: form.posting_frequency,
      topContentType: form.top_content_type,
      notes: form.notes,
    };

    try {
      const url = editing ? `${API_URL}/competitors/${editing.id}` : `${API_URL}/competitors`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save competitor');

      resetForm();
      load();
    } catch (err) {
      console.error('Error saving competitor:', err);
    }
  };

  const edit = (c: Competitor) => {
    setEditing(c);
    setForm({
      name: c.name,
      platform: c.platform,
      handle: c.handle,
      follower_count: c.follower_count?.toString() || '',
      avg_engagement_rate: c.avg_engagement_rate?.toString() || '',
      posting_frequency: c.posting_frequency,
      top_content_type: c.top_content_type,
      notes: c.notes,
    });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) return;
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    try {
      const res = await fetch(`${API_URL}/competitors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete competitor');
      load();
    } catch (err) {
      console.error('Error deleting competitor:', err);
    }
  };

  const runTeardown = async (comp: Competitor) => {
    setTeardownLoading(comp.id);
    // Simulate deep AI teardown analysis
    setTimeout(() => {
      setActiveTeardown((prev) => ({
        ...prev,
        [comp.id]: {
          sentiment: comp.avg_engagement_rate > 4 ? 'High Engagement' : 'Moderate',
          sentimentScore: comp.avg_engagement_rate > 4 ? 88 : 65,
          weakSpot: 'Inconsistent video posting & low comment response speed.',
          topHashtags: [`#${comp.name.replace(/\s+/g, '')}`, '#promo', '#bestdeals', '#trending'],
          aiCounterStrategy: `Focus on behind-the-scenes Short-form Reels showing authentic customer stories for ${business.name}. Post during peak hour (6:00 PM).`,
        },
      }));
      setTeardownLoading(null);
    }, 800);
  };

  // AI insights based on competitor data
  const insights: string[] = [];
  if (competitors.length > 0) {
    const avgEngagement =
      competitors.reduce((s, c) => s + (c.avg_engagement_rate || 0), 0) / competitors.length;
    const topCompetitor = competitors.reduce(
      (max, c) => (c.follower_count > max.follower_count ? c : max),
      competitors[0]
    );

    insights.push(
      `Your top competitor "${topCompetitor.name}" has ${topCompetitor.follower_count.toLocaleString()} followers — analyze their ${
        topCompetitor.top_content_type || 'top-performing'
      } content for inspiration.`
    );

    if (avgEngagement > 5) {
      insights.push(
        `The average engagement rate in your niche is ${avgEngagement.toFixed(
          1
        )}% — aim for content that sparks conversations to match this.`
      );
    } else if (avgEngagement > 0) {
      insights.push(
        `Competitor engagement rates average ${avgEngagement.toFixed(
          1
        )}% — there's room to stand out with more interactive content.`
      );
    }

    const frequentPosters = competitors.filter((c) => c.posting_frequency === 'daily');
    if (frequentPosters.length > 0) {
      insights.push(
        `${frequentPosters.length} of your competitors post daily — consider increasing your posting frequency to stay competitive.`
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-stone-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Competitor Intelligence & Teardowns</h1>
          <p className="text-stone-500 mt-1">Track rivals, analyze weaknesses, and deploy counter-strategies.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Competitor
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={resetForm}>
          <div className="card p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900">{editing ? 'Edit Competitor' : 'Add Competitor'}</h2>
              <button onClick={resetForm} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Competitor Name</label>
                  <input className="input-field" placeholder="e.g. Downtown Bakery" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
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
                  <label className="label">Handle</label>
                  <input className="input-field" placeholder="@username" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} />
                </div>
                <div>
                  <label className="label">Posting Frequency</label>
                  <select className="input-field" value={form.posting_frequency} onChange={(e) => setForm({ ...form, posting_frequency: e.target.value })}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="few times a week">Few times a week</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Follower Count</label>
                  <input type="number" className="input-field" placeholder="5000" value={form.follower_count} onChange={(e) => setForm({ ...form, follower_count: e.target.value })} />
                </div>
                <div>
                  <label className="label">Avg Engagement Rate (%)</label>
                  <input type="number" step="0.1" className="input-field" placeholder="3.5" value={form.avg_engagement_rate} onChange={(e) => setForm({ ...form, avg_engagement_rate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Top Content Type</label>
                <input className="input-field" placeholder="e.g. Behind-the-scenes videos" value={form.top_content_type} onChange={(e) => setForm({ ...form, top_content_type: e.target.value })} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field min-h-[80px] resize-none" placeholder="What are they doing well? What can you learn?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Competitor</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-stone-900 to-stone-700 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-lg">AI Competitive Intelligence Radar</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-stone-200 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {competitors.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-stone-300" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">No competitors tracked yet</h3>
          <p className="text-sm text-stone-400 mb-4">Add your competitors to run AI strategy teardowns.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Your First Competitor
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {competitors.map((c) => {
            const teardown = activeTeardown[c.id];
            const isAnalyzing = teardownLoading === c.id;

            return (
              <div key={c.id} className="card card-hover p-6 space-y-4 border border-stone-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">{c.name}</h3>
                      <p className="text-xs text-stone-400">{c.handle || '—'} · <span className="capitalize">{c.platform}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => edit(c)} className="btn-ghost p-2"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(c.id)} className="btn-ghost p-2 text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <Eye className="w-3.5 h-3.5 text-stone-400 mb-1" />
                    <p className="text-base font-bold text-stone-900">{c.follower_count.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-400 font-medium">Followers</p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <Heart className="w-3.5 h-3.5 text-stone-400 mb-1" />
                    <p className="text-base font-bold text-stone-900">{c.avg_engagement_rate.toFixed(1)}%</p>
                    <p className="text-[10px] text-stone-400 font-medium">Eng. Rate</p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 mb-1" />
                    <p className="text-xs font-bold text-stone-900 capitalize">{c.posting_frequency}</p>
                    <p className="text-[10px] text-stone-400 font-medium">Frequency</p>
                  </div>
                </div>

                {/* AI Teardown Section */}
                {teardown ? (
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                        <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" /> AI Strategy Teardown
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                        Score: {teardown.sentimentScore}/100
                      </span>
                    </div>

                    <div className="text-xs space-y-2 text-stone-700">
                      <div>
                        <span className="font-semibold text-purple-950 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-red-500" /> Competitor Vulnerability:
                        </span>
                        <p className="text-stone-600 mt-0.5 pl-4">{teardown.weakSpot}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-purple-950 flex items-center gap-1">
                          <Target className="w-3 h-3 text-emerald-600" /> Counter-Strategy Recommendation:
                        </span>
                        <p className="text-stone-600 mt-0.5 pl-4">{teardown.aiCounterStrategy}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => runTeardown(c)}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Analyzing strategy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-600" /> Run AI Strategy Teardown
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
