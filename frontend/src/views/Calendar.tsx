import { useState, useEffect } from 'react';
import { type Business, type Post } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Zap,
  Instagram,
  Youtube,
  Facebook,
  Video,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  List,
} from 'lucide-react';
import type { View } from '@/App';

interface CalendarProps {
  business: Business;
  setView: (v: View) => void;
}

const CALENDAR_TOOLS = [
  { id: 'calendar', label: 'Marketing Calendar', icon: CalendarIcon },
  { id: 'scheduled', label: 'Scheduled Posts', icon: Clock },
];

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  tiktok: Video,
};

// Heatmap data for optimal posting times
const OPTIMAL_HOURS = [
  { day: 'Wed', time: '6:00 PM', platform: 'Instagram', boost: '94% Reach' },
  { day: 'Fri', time: '12:00 PM', platform: 'YouTube', boost: '88% Engagement' },
  { day: 'Sun', time: '7:30 PM', platform: 'Facebook', boost: '91% Clicks' },
  { day: 'Tue', time: '5:00 PM', platform: 'TikTok', boost: '86% Views' },
];

export default function Calendar({ business, setView }: CalendarProps) {
  const [activeTool, setActiveTool] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, [business.id]);

  const loadPosts = async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts/business/${business.id}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const postsData = await response.json();

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

      setPosts(mappedPosts);
    } catch (err) {
      console.error('Failed to fetch posts for calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Helper to format YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const getPostsForDay = (d: number) => {
    const dateStr = formatDateStr(year, month, d);
    return posts.filter((p) => {
      const pDate = (p.scheduled_for || p.created_at || '').split('T')[0];
      return pDate === dateStr;
    });
  };

  const scheduledPosts = posts.filter(p => p.status === 'scheduled').sort((a, b) => (a.scheduled_for || '').localeCompare(b.scheduled_for || ''));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Marketing Scheduler</h1>
          <p className="text-stone-500 mt-1">
            Visual schedule of scheduled, published, and draft posts across all social platforms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('content')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule New Post
          </button>
        </div>
      </div>

      {/* Tool Selector */}
      <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
        {CALENDAR_TOOLS.map((tool) => {
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

      {activeTool === 'calendar' && (
        <>
          {/* Optimal Posting Time Heatmap Banner */}
          <div className="card p-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-stone-50 border-amber-200/60">
            <div className="flex items-center gap-2 text-amber-900 font-semibold mb-2 text-sm">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>AI Optimal Posting Time Recommendations for {business.name}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {OPTIMAL_HOURS.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur p-2.5 rounded-xl border border-amber-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900">{h.day} @ {h.time}</span>
                    <p className="text-[11px] text-stone-500">{h.platform}</p>
                  </div>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    {h.boost}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Controls */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-stone-900">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={goToday}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-stone-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-stone-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-stone-400 pb-2 border-b border-stone-100">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty padding slots */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] p-2 rounded-xl bg-stone-50/50 opacity-40" />
              ))}

              {/* Actual Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayPosts = getPostsForDay(dayNum);
                const isToday =
                  dayNum === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                    className={`min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? 'border-stone-900 bg-stone-900/5 shadow-sm'
                        : 'border-stone-100 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday ? 'bg-stone-900 text-white' : 'text-stone-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-[10px] font-semibold text-stone-400">
                          {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Day Posts List */}
                    <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                      {dayPosts.slice(0, 2).map((post) => {
                        const PlatformIcon = PLATFORM_ICONS[post.platform] || CalendarIcon;
                        return (
                          <div
                            key={post.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                            }}
                            className={`p-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border truncate ${
                              post.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : post.status === 'scheduled'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            <PlatformIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{post.caption}</span>
                          </div>
                        );
                      })}
                      {dayPosts.length > 2 && (
                        <span className="text-[10px] font-semibold text-stone-400 block pl-1">
                          +{dayPosts.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTool === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Scheduled Queue
            </h2>
            <button onClick={() => setView('content')} className="btn-secondary text-xs">Add New</button>
          </div>
          <div className="card overflow-hidden">
            <div className="divide-y divide-stone-100">
              {scheduledPosts.length > 0 ? scheduledPosts.map((post) => {
                const PlatformIcon = PLATFORM_ICONS[post.platform] || CalendarIcon;
                return (
                  <div key={post.id} className="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center overflow-hidden">
                        {post.media_url ? <img src={post.media_url} className="w-full h-full object-cover" /> : <PlatformIcon className="w-6 h-6 text-stone-300" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{post.caption}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <PlatformIcon className="w-3 h-3" /> {post.platform}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(post.scheduled_for || '').toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-ghost p-2 text-stone-400 hover:text-stone-900"><Plus className="w-4 h-4" /* Edit icon */ /></button>
                      <button className="btn-ghost p-2 text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-10 text-center text-stone-400 text-sm">No posts scheduled in the queue.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="badge-stone capitalize">{selectedPost.platform}</span>
                <span
                  className={`badge capitalize ${
                    selectedPost.status === 'published'
                      ? 'badge-green'
                      : selectedPost.status === 'scheduled'
                      ? 'badge-blue'
                      : 'badge-stone'
                  }`}
                >
                  {selectedPost.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedPost.media_url && (
                <img
                  src={selectedPost.media_url}
                  alt="Post preview"
                  className="w-full h-44 object-cover rounded-xl border border-stone-200"
                />
              )}
              <p className="text-stone-800 text-sm font-medium leading-relaxed">{selectedPost.caption}</p>
              {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPost.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-blue-600 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedPost(null)} className="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
