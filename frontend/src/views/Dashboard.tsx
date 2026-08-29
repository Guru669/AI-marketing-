import { useEffect, useState, useCallback } from 'react';
import type { Business, Campaign, Post, Analytics, Competitor } from '@/lib/types';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  ArrowRight,
  Megaphone,
  Users,
  PenTool,
  Clock,
  Zap,
  Search,
  Bell,
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingDown,
  DollarSign,
  BarChart3
} from 'lucide-react';
import type { View } from '@/App';
import { authService } from '@/lib/auth';

export default function Dashboard({
  business,
  setView,
  onBusinessUpdate,
}: {
  business: Business;
  setView: (v: View) => void;
  onBusinessUpdate: () => void;
}) {
  const [stats, setStats] = useState({ impressions: 0, engagement: 0, likes: 0, comments: 0, shares: 0, reach: 0 });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analyticsData, setAnalyticsData] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  const loadData = useCallback(async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    setLoading(true);

    try {
      const [analyticsRes, postsRes, campaignsRes, competitorsRes] = await Promise.all([
        fetch(`${API_URL}/analytics/business/${business.id}`),
        fetch(`${API_URL}/posts/business/${business.id}`),
        fetch(`${API_URL}/campaigns/business/${business.id}`),
        fetch(`${API_URL}/competitors/business/${business.id}`),
      ]);

      const analytics = await analyticsRes.json();
      const postsData = await postsRes.json();
      const campaigns = await campaignsRes.json();
      const competitorsData = await competitorsRes.json();

      // Map analytics fields
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

      setAnalyticsData(mappedAnalytics);
      setStats({
        impressions: mappedAnalytics.reduce((s: number, a: any) => s + (a.impressions || 0), 0),
        engagement: mappedAnalytics.reduce((s: number, a: any) => s + (a.engagement || 0), 0),
        likes: mappedAnalytics.reduce((s: number, a: any) => s + (a.likes || 0), 0),
        comments: mappedAnalytics.reduce((s: number, a: any) => s + (a.comments || 0), 0),
        shares: mappedAnalytics.reduce((s: number, a: any) => s + (a.shares || 0), 0),
        reach: mappedAnalytics.reduce((s: number, a: any) => s + (a.reach || 0), 0),
      });

      // Map backend fields to frontend types
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

      const mappedCampaigns: Campaign[] = campaigns.map((c: any) => ({
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

      const mappedCompetitors: Competitor[] = competitorsData.map((comp: any) => ({
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

      setRecentPosts(mappedPosts);
      setActiveCampaigns(mappedCampaigns.filter(c => c.status === 'active'));
      setCompetitors(mappedCompetitors);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [business.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Seed demo analytics if none exist
  const seedDemoData = async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    const platforms = business.platforms.length > 0 ? business.platforms : ['instagram'];

    // 1. Generate Analytics
    const records = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      for (const platform of platforms.slice(0, 2)) {
        records.push({
          businessId: business.id,
          platform,
          impressions: Math.floor(800 + Math.random() * 3000),
          reach: Math.floor(600 + Math.random() * 2000),
          engagement: Math.floor(50 + Math.random() * 300),
          likes: Math.floor(40 + Math.random() * 200),
          comments: Math.floor(5 + Math.random() * 50),
          shares: Math.floor(2 + Math.random() * 30),
          saves: Math.floor(3 + Math.random() * 40),
          recordedDate: date.toISOString(),
        });
      }
    }

    // 2. Generate Posts
    const posts = [
      {
        businessId: business.id,
        platform: platforms[0],
        contentType: 'post',
        caption: 'Welcome to our new business page! 🚀',
        hashtags: ['#newbeginnings', '#smallbusiness'],
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        aiScore: 95
      },
      {
        businessId: business.id,
        platform: platforms[0],
        contentType: 'reel',
        caption: 'Check out our process! 🎥',
        hashtags: ['#bts', '#behindthescenes'],
        status: 'published',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        aiScore: 88
      }
    ];

    // 3. Generate Campaigns & Competitors
    const campaigns = [
      { businessId: business.id, name: 'Brand Launch', goal: 'Brand Awareness', platform: platforms[0], status: 'active', budget: 500 }
    ];
    const competitors = [
      { businessId: business.id, name: 'Competitor A', platform: platforms[0], followerCount: 1200, avgEngagementRate: 3.2, postingFrequency: 'daily' }
    ];

    try {
      console.log('🌱 Seeding demo data for business:', business.id);
      await Promise.all([
        fetch(`${API_URL}/analytics/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records })
        }),
        fetch(`${API_URL}/posts/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ posts })
        }),
        fetch(`${API_URL}/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaigns[0])
        }),
        fetch(`${API_URL}/competitors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(competitors[0])
        })
      ]);

      console.log('✅ Demo data seeded successfully');
      loadData();
    } catch (err) {
      console.error('Error seeding demo data:', err);
    }
  };

  useEffect(() => {
    if (!loading && analyticsData.length === 0) {
      seedDemoData();
    }
  }, [loading, analyticsData.length]);

  const engagementRate = stats.impressions > 0 ? ((stats.engagement / stats.impressions) * 100).toFixed(1) : '0.0';

  const statCards = [
    { label: 'Total Reach', value: stats.reach > 1000 ? `${(stats.reach / 1000).toFixed(1)}K` : stats.reach, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 18.2 },
    { label: 'Engagement', value: stats.engagement > 1000 ? `${(stats.engagement / 1000).toFixed(1)}K` : stats.engagement, icon: Heart, color: 'text-blue-600', bg: 'bg-blue-50', trend: 24.6 },
    { label: 'Revenue', value: `₹${(stats.likes * 12.5).toFixed(1)}K`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 15.4 },
    { label: 'Active Campaigns', value: activeCampaigns.length, icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50', trend: 0 },
  ];

  const chartData = analyticsData
    .filter((a, i, arr) => arr.findIndex(x => x.recorded_date === a.recorded_date) === i)
    .sort((a, b) => a.recorded_date.localeCompare(b.recorded_date))
    .slice(-14);

  const maxImpressions = Math.max(...chartData.map(d => d.impressions), 1);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Header / Nav Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-2">
        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search for tools, analytics, content..."
            className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-stone-500 hover:bg-white rounded-full transition-colors border border-transparent hover:border-stone-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-stone-900">{user?.name || 'User'}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Business Owner</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-stone-200 overflow-hidden border border-stone-200">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=4f46e5&color=fff`} alt="avatar" />
            </div>
          </div>
        </div>
      </div>

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Partner'} 👋
          </h1>
          <p className="text-stone-500 text-sm font-medium mt-1">Here's what's happening with your marketing today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-stone-400" />
            May 12 - May 18, 2026
          </div>
          <button onClick={() => setView('content')} className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 shadow-lg shadow-indigo-200">
            <Sparkles className="w-4 h-4" />
            Create Content
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{card.label}</p>
                  <h3 className="text-2xl font-black text-stone-900 tracking-tight">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-2xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {card.trend > 0 ? (
                  <div className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
                    <TrendingUp className="w-3 h-3" /> {card.trend}%
                  </div>
                ) : card.trend < 0 ? (
                  <div className="flex items-center gap-0.5 text-[11px] font-bold text-rose-600">
                    <TrendingDown className="w-3 h-3" /> {Math.abs(card.trend)}%
                  </div>
                ) : null}
                {card.trend !== 0 && <span className="text-[10px] text-stone-400 font-bold">vs last 7 days</span>}
              </div>
              {/* Mini Sparkline Simulation */}
              <div className="mt-4 flex items-end gap-1 h-6">
                {[30, 45, 35, 60, 40, 70, 50].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-full ${card.color.replace('text', 'bg')} opacity-20`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Insights Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Line Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">Performance Overview</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Reach</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Engagement</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Clicks</span>
                </div>
              </div>
            </div>
            <select className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-600 focus:outline-none">
              <option>7 Days</option>
              <option>30 Days</option>
            </select>
          </div>

          <div className="relative h-60 w-full">
            {chartData.length > 0 ? (
              <div className="flex items-end justify-between h-full gap-2">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                    {/* Simulated Multi-line chart bars/points */}
                    <div className="w-1.5 bg-indigo-600/10 rounded-full h-full absolute bottom-0" />
                    <div className="w-1.5 bg-indigo-600 rounded-full absolute transition-all duration-700"
                         style={{ height: `${(d.reach || d.impressions / 2) / maxImpressions * 100}%`, bottom: 0 }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute shadow-sm"
                         style={{ bottom: `${(d.reach || d.impressions / 2) / maxImpressions * 100}%`, marginBottom: '-3px' }} />

                    <div className="mt-4 text-[9px] font-black text-stone-300 group-hover:text-stone-900 transition-colors">
                      {new Date(d.recorded_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-300 text-sm font-bold">No data available</div>
            )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm uppercase tracking-widest">AI Insight</h3>
              </div>
              <p className="text-lg font-bold leading-tight tracking-tight">
                Your Instagram engagement is <span className="text-emerald-300">24% higher</span> than last week.
              </p>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Try posting Reels 3x this week to keep the momentum.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all font-bold text-xs">
                View Details
              </button>
            </div>
          </div>

          {/* Platform Distribution Card */}
          <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
            <h2 className="text-sm font-black text-stone-900 tracking-tight uppercase tracking-widest mb-6">Top Platforms</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-stone-50" />
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={300} strokeDashoffset={100} className="text-rose-500" />
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={300} strokeDashoffset={240} className="text-blue-500" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-stone-900">25.6K</span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">Total Reach</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { name: 'Instagram', val: '12.4K', perc: '48%', color: 'bg-rose-500' },
                  { name: 'Facebook', val: '6.7K', perc: '17%', color: 'bg-blue-500' },
                  { name: 'YouTube', val: '2.2K', perc: '9%', color: 'bg-emerald-500' },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.color}`} />
                      <span className="text-stone-500">{p.name}</span>
                    </div>
                    <span className="text-stone-900">{p.val} <span className="text-stone-300 font-medium">({p.perc})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Posts */}
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-black text-stone-900 tracking-tight">Upcoming Posts</h2>
            <button onClick={() => setView('calendar')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Calendar</button>
          </div>
          <div className="space-y-4">
            {recentPosts.length > 0 ? recentPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100 overflow-hidden">
                  {post.media_url ? <img src={post.media_url} className="w-full h-full object-cover" /> : <PenTool className="w-5 h-5 text-stone-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{post.caption}</p>
                  <p className="text-[10px] font-medium text-stone-400 mt-0.5 capitalize">{post.platform} Post</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-900">May 18, 10:00 AM</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${post.status === 'scheduled' ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {post.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-stone-300 font-bold py-4 text-center">No posts upcoming</p>
            )}
          </div>
        </div>

        {/* Active Campaigns Progress */}
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-black text-stone-900 tracking-tight">Active Campaigns</h2>
            <button onClick={() => setView('campaigns')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          <div className="space-y-5">
            {activeCampaigns.length > 0 ? activeCampaigns.slice(0, 3).map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-stone-900">{c.name}</p>
                    <p className="text-[9px] font-medium text-stone-400 capitalize">{c.platform}</p>
                  </div>
                  <span className="text-xs font-black text-stone-900">75%</span>
                </div>
                <div className="h-1.5 bg-stone-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            )) : (
              <p className="text-sm text-stone-300 font-bold py-4 text-center">No active campaigns</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
          <h2 className="text-base font-black text-stone-900 tracking-tight mb-6">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Create New Content', icon: PenTool, id: 'content' },
              { label: 'Analyze Performance', icon: BarChart3, id: 'analytics' },
              { label: 'Generate Campaign', icon: Megaphone, id: 'campaigns' },
              { label: 'Improve Engagement', icon: Zap, id: 'dashboard' },
            ].map(act => (
              <button
                key={act.label}
                onClick={() => setView(act.id as View)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-stone-50 group-hover:bg-indigo-100/50 transition-colors">
                    <act.icon className={`w-4 h-4 ${act.id === 'dashboard' ? 'text-amber-600' : 'text-indigo-600'}`} />
                  </div>
                  <span className="text-xs font-bold text-stone-700">{act.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-indigo-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Comment Assistant Section */}
      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-stone-900 tracking-tight">AI Comment Assistant</h2>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">3 New Comments</span>
        </div>
        <div className="space-y-4">
          {[
            { user: '@alex_m', comment: 'Loved the new summer menu! The pasta was incredible.', platform: 'instagram', time: '2h ago' },
            { user: 'Sarah J.', comment: 'Do you offer catering for private events?', platform: 'facebook', time: '5h ago' },
            { user: '@tech_guru', comment: 'Great use of lighting in this reel! What camera was used?', platform: 'instagram', time: '8h ago' },
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-stone-50 hover:border-stone-100 hover:bg-stone-50/50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0 flex items-center justify-center font-bold text-stone-400 text-xs uppercase">
                {c.user.replace('@', '').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-stone-900">{c.user} <span className="text-[10px] text-stone-400 font-medium ml-2">{c.time}</span></p>
                  <span className="text-[9px] font-black text-stone-300 uppercase">{c.platform}</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 line-clamp-1">{c.comment}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                    <Sparkles className="w-3 h-3" /> AI Suggest Reply
                  </button>
                  <button className="text-[10px] font-bold text-stone-400 hover:text-stone-600 px-2 py-1">Ignore</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
