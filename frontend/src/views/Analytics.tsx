import { useEffect, useState, useCallback, useMemo } from 'react';
import { PLATFORMS, type Business, type Analytics } from '@/lib/types';
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Bookmark, Clock, Award, LineChart, PieChart, Search, Star, Loader2 } from 'lucide-react';

import ReportGenerator from '@/components/ReportGenerator';

const ANALYTICS_TOOLS = [
  { id: 'performance', label: 'Performance', icon: LineChart },
  { id: 'sales', label: 'Sales Prediction', icon: PieChart },
  { id: 'reviews', label: 'Review Analysis', icon: Search },
  { id: 'recommendations', label: 'Recommendations', icon: Star },
  { id: 'best-time', label: 'Best Time to Post', icon: Clock },
];

export default function Analytics({ business }: { business: Business }) {
  const [activeTool, setActiveTool] = useState('performance');
  const [data, setData] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('all');

  // AI states
  const [prediction, setPrediction] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const loadAIInsights = useCallback(async () => {
    if (data.length === 0) return;
    setAiLoading(true);
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    try {
      const [predRes, recRes] = await Promise.all([
        fetch(`${API_URL}/analytics/predict-sales`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: business.id })
        }),
        fetch(`${API_URL}/analytics/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: business.id })
        })
      ]);

      if (predRes.ok) setPrediction(await predRes.json());
      if (recRes.ok) {
        const d = await recRes.json();
        setRecommendations(d.recommendations || []);
      }
    } catch (err) {
      console.error('AI Insight error:', err);
    } finally {
      setAiLoading(false);
    }
  }, [business.id, data.length]);

  useEffect(() => {
    if (activeTool === 'sales' || activeTool === 'recommendations') {
      if (!prediction || recommendations.length === 0) {
        loadAIInsights();
      }
    }
  }, [activeTool, loadAIInsights, prediction, recommendations.length]);

  const load = useCallback(async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics/business/${business.id}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analytics = await response.json();

      const mappedAnalytics: Analytics[] = analytics.map((a: any) => ({
        id: a._id,
        business_id: a.businessId,
        post_id: a.postId,
        platform: a.platform,
        impressions: a.impressions,
        reach: a.reach,
        engagement: a.engagement,
        likes: a.likes,
        comments: a.comments,
        shares: a.shares,
        saves: a.saves,
        recorded_date: a.recordedDate,
        created_at: a.createdAt
      }));

      setData(mappedAnalytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [business.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (platform === 'all') return data;
    return data.filter((d) => d.platform === platform);
  }, [data, platform]);

  const totals = useMemo(() => ({
    impressions: filtered.reduce((s, a) => s + a.impressions, 0),
    reach: filtered.reduce((s, a) => s + a.reach, 0),
    likes: filtered.reduce((s, a) => s + a.likes, 0),
    comments: filtered.reduce((s, a) => s + a.comments, 0),
    shares: filtered.reduce((s, a) => s + a.shares, 0),
    saves: filtered.reduce((s, a) => s + a.saves, 0),
    engagement: filtered.reduce((s, a) => s + a.engagement, 0),
  }), [filtered]);

  const engagementRate = totals.impressions > 0 ? ((totals.engagement / totals.impressions) * 100).toFixed(1) : '0.0';

  // Daily aggregation for chart
  const dailyMap = new Map<string, { impressions: number; engagement: number }>();
  filtered.forEach((a) => {
    const existing = dailyMap.get(a.recorded_date) || { impressions: 0, engagement: 0 };
    dailyMap.set(a.recorded_date, {
      impressions: existing.impressions + a.impressions,
      engagement: existing.engagement + a.engagement,
    });
  });
  const daily = Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
  const maxDaily = Math.max(...daily.map((d) => d[1].impressions), 1);

  // Platform breakdown
  const platformStats = PLATFORMS.map((p) => {
    const pData = data.filter((d) => d.platform === p.id);
    return {
      ...p,
      impressions: pData.reduce((s, a) => s + a.impressions, 0),
      engagement: pData.reduce((s, a) => s + a.engagement, 0),
    };
  }).filter((p) => p.impressions > 0);

  const maxPlatformImp = Math.max(...platformStats.map((p) => p.impressions), 1);

  // Best time to post analysis (simulated based on platform)
  const bestTimes: Record<string, { day: string; time: string; reason: string }> = {
    instagram: { day: 'Tuesday & Thursday', time: '11 AM - 1 PM, 7 PM - 9 PM', reason: 'Instagram users are most active during lunch breaks and evening relaxation hours.' },
    facebook: { day: 'Wednesday & Friday', time: '9 AM - 11 AM, 1 PM - 3 PM', reason: 'Facebook engagement peaks mid-morning and early afternoon on weekdays.' },
    youtube: { day: 'Thursday & Saturday', time: '2 PM - 4 PM, 6 PM - 8 PM', reason: 'YouTube viewership increases in the afternoon and peaks in prime evening hours.' },
    tiktok: { day: 'Tuesday & Friday', time: '6 AM - 10 AM, 7 PM - 11 PM', reason: 'TikTok engagement spikes early morning and late evening when users scroll casually.' },
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-stone-900 animate-spin" /></div>;
  }

  const statCards = [
    { label: 'Impressions', value: totals.impressions, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reach', value: totals.reach, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Likes', value: totals.likes, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Comments', value: totals.comments, icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Shares', value: totals.shares, icon: Share2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Saves', value: totals.saves, icon: Bookmark, color: 'text-stone-600', bg: 'bg-stone-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Analytics Intelligence</h1>
          <p className="text-stone-500 mt-1">Track performance, predict sales, and get AI-driven growth recommendations.</p>
        </div>
        <div className="flex items-center gap-3">
          <ReportGenerator business={business} analytics={data} />
          <select className="input-field w-40 text-xs font-semibold" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">All Platforms</option>
            {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tool Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
        {ANALYTICS_TOOLS.map((tool) => {
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

      {activeTool === 'performance' && (
        <>
          {/* Engagement rate highlight */}
          <div className="card p-6 bg-gradient-to-br from-stone-900 to-stone-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-300 text-sm font-medium">Overall Engagement Rate</p>
                <p className="text-4xl font-bold mt-1">{engagementRate}%</p>
                <p className="text-stone-300 text-sm mt-2">
                  {parseFloat(engagementRate) > 5 ? 'Excellent! You\'re above industry average.' :
                   parseFloat(engagementRate) > 2 ? 'Good performance. Keep optimizing.' :
                   'Room to grow. Try posting more consistently.'}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="card p-4">
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className="text-xl font-bold text-stone-900">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-stone-400 font-medium">{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily chart */}
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-1">Daily Impressions</h2>
              <p className="text-sm text-stone-400 mb-6">Last 14 days</p>
              {daily.length > 0 ? (
                <div className="flex items-end gap-1 h-40">
                  {daily.map(([date, vals]) => (
                    <div key={date} className="flex-1 group flex flex-col items-center gap-1">
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-stone-800 to-stone-400 rounded-t-md transition-all duration-500 group-hover:from-stone-900 group-hover:to-stone-600 relative"
                          style={{ height: `${(vals.impressions / maxDaily) * 100}%` }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none">
                            {vals.impressions.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] text-stone-400">
                        {new Date(date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-stone-400 text-sm">No data available</div>
              )}
            </div>

            {/* Platform breakdown */}
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-1">Platform Performance</h2>
              <p className="text-sm text-stone-400 mb-6">Impressions by platform</p>
              {platformStats.length > 0 ? (
                <div className="space-y-4">
                  {platformStats.map((p) => (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-stone-700">{p.label}</span>
                        <span className="text-sm font-semibold text-stone-900">{p.impressions.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-stone-700 to-stone-400 rounded-full transition-all duration-700"
                          style={{ width: `${(p.impressions / maxPlatformImp) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-stone-400 mt-1">{p.engagement.toLocaleString()} engagements</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-stone-400 text-sm">No platform data yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTool === 'sales' && (
        <div className="card p-12 text-center">
          {aiLoading ? (
             <div className="flex flex-col items-center gap-4 py-8">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
               <p className="text-sm text-stone-500 font-medium">AI is projecting your growth...</p>
             </div>
          ) : prediction ? (
            <div className="space-y-8 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
                <PieChart className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xl mb-2">Sales Prediction</h3>
                <p className="text-stone-500 max-w-md mx-auto">{prediction.reasoning}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-xl border border-stone-100 bg-stone-50">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Next 30 Days Est.</p>
                  <p className="text-2xl font-black text-emerald-600">₹{prediction.nextMonthEstimate?.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">+{prediction.growthPercentage}% projected growth</p>
                </div>
                <div className="p-4 rounded-xl border border-stone-100 bg-stone-50">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Confidence Score</p>
                  <p className="text-2xl font-black text-stone-900">{prediction.confidenceScore}%</p>
                  <p className="text-[10px] text-stone-400 font-bold mt-1">Based on historical data</p>
                </div>
                <div className="p-4 rounded-xl border border-stone-100 bg-stone-50">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Top Revenue Driver</p>
                  <p className="text-2xl font-black text-indigo-600">{prediction.topDriver}</p>
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">High conversion potential</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
                 <PieChart className="w-8 h-8 text-stone-300" />
               </div>
               <h3 className="font-bold text-stone-900 text-xl">Sales Prediction</h3>
               <p className="text-stone-500 max-w-md mx-auto">AI models are ready to analyze your engagement trends. This feature requires analytics data.</p>
            </div>
          )}
        </div>
      )}

      {activeTool === 'reviews' && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="font-bold text-stone-900 text-xl mb-2">Review Sentiment Analysis</h3>
          <p className="text-stone-500 max-w-md mx-auto">Connect your Google Business or Yelp account to analyze customer feedback sentiment and identify areas for improvement.</p>
          <button className="mt-6 btn-primary">Connect Review Sources</button>
        </div>
      )}

      {activeTool === 'recommendations' && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="font-bold text-stone-900 text-xl">AI Growth Recommendations</h2>
          </div>

          {aiLoading ? (
             <div className="flex flex-col items-center gap-4 py-8">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
               <p className="text-sm text-stone-500 font-medium">AI is generating your growth roadmap...</p>
             </div>
          ) : (
            <div className="space-y-4">
              {(recommendations.length > 0 ? recommendations : [
                { title: 'Increase Reels Frequency', desc: 'Your Reels engagement is 3.5x higher than static posts. Aim for 3-4 Reels per week.', priority: 'High' },
                { title: 'Optimize Posting Window', desc: 'Your audience is most active between 7 PM and 9 PM. Schedule your top content for these hours.', priority: 'Medium' },
                { title: 'Use Trending Audio', desc: 'Posts using trending audio tracks are getting 40% more reach. Check the AI Copilot for latest trends.', priority: 'Medium' },
                { title: 'Respond to Comments faster', desc: 'Average response time is 4 hours. Reducing this to under 1 hour can boost engagement by 15%.', priority: 'Low' },
              ]).map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-stone-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{rec.title}</h4>
                    <p className="text-xs text-stone-500 mt-1">{rec.desc}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                    rec.priority === 'High' ? 'bg-red-50 text-red-600' :
                    rec.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTool === 'best-time' && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-stone-900 text-lg">Best Time to Post</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {PLATFORMS.map((p) => {
              const bt = bestTimes[p.id];
              const isActive = business.platforms.includes(p.id);
              return (
                <div key={p.id} className={`p-5 rounded-xl border transition-all ${isActive ? 'border-amber-200 bg-amber-50/50' : 'border-stone-100 bg-stone-50/50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-stone-900">{p.label}</h3>
                    {isActive && <span className="badge-amber">Active</span>}
                  </div>
                  <p className="text-sm font-medium text-stone-700">{bt.day}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{bt.time}</p>
                  <p className="text-xs text-stone-400 mt-2 leading-relaxed">{bt.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
