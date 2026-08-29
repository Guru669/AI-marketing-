import {
  Sparkles,
  LayoutDashboard,
  PenTool,
  Calendar,
  Megaphone,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Zap,
  Type,
  Hash,
  Target,
  MessageSquare,
  Clock,
  CheckSquare,
  LineChart,
  PieChart,
  Search,
  Star,
  ChevronRight
} from 'lucide-react';
import type { View } from '@/App';
import type { Business } from '@/lib/types';
import { authService } from '@/lib/auth';

interface NavItem {
  id: View;
  label: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'AI TOOLS',
    items: [
      { id: 'content', label: 'Content Studio', icon: PenTool },
      { id: 'content', label: 'Caption Generator', icon: Type },
      { id: 'content', label: 'Hashtag Generator', icon: Hash },
      { id: 'content', label: 'Ad Copy Generator', icon: Target },
      { id: 'analytics', label: 'Best Time to Post', icon: Clock },
      { id: 'dashboard', label: 'Comment Reply', icon: MessageSquare },
    ]
  },
  {
    label: 'MARKETING',
    items: [
      { id: 'campaigns', label: 'Campaign Planner', icon: Megaphone },
      { id: 'calendar', label: 'Marketing Calendar', icon: Calendar },
      { id: 'calendar', label: 'Scheduled Posts', icon: Clock },
      { id: 'campaigns', label: 'Tasks', icon: CheckSquare },
    ]
  },
  {
    label: 'ANALYTICS',
    items: [
      { id: 'analytics', label: 'Performance', icon: LineChart },
      { id: 'analytics', label: 'Sales Prediction', icon: PieChart },
      { id: 'competitors', label: 'Competitor Analysis', icon: Users },
      { id: 'analytics', label: 'Review Analysis', icon: Search },
      { id: 'analytics', label: 'Recommendations', icon: Star },
    ]
  }
];

export default function Sidebar({
  view,
  setView,
  business,
  onSignOut,
}: {
  view: View;
  setView: (v: View) => void;
  business: Business;
  onSignOut: () => void;
}) {
  const user = authService.getUser();

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-stone-900">MarketAI</span>
        </div>
        <button onClick={() => setView('settings')} className="p-2 text-stone-500">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-stone-100 flex-col z-40 overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-stone-900 text-xl tracking-tight">MarketAI</h1>
          </div>
        </div>

        <div className="px-4 space-y-6 flex-1 pb-8">
          {/* Top level items */}
          <div className="space-y-1">
            <button
              onClick={() => setView('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                view === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className={`w-[18px] h-[18px] ${view === 'dashboard' ? 'text-indigo-600' : 'text-stone-400'}`} />
              Dashboard
            </button>
            <button
              onClick={() => setView('content')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                view === 'content' && false // Special handling for copilot if needed
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-[18px] h-[18px] text-stone-400" />
                AI Copilot
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">New</span>
            </button>
          </div>

          {/* Groups */}
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <h3 className="px-4 text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.label}
                    onClick={() => setView(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      false // Disable active state for sub-items to match UI style of multi-mapping
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] text-stone-400" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Upgrade CTA */}
          <div className="mx-2 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-900 leading-tight">Upgrade to Pro</p>
              <p className="text-[11px] text-indigo-600/70 mt-1 leading-relaxed">
                Unlock advanced AI insights, more tools & export.
              </p>
            </div>
            <button className="w-full py-2 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-stone-100 mt-auto">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`}
                  alt="avatar"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">{user?.name || 'Business Owner'}</p>
                <p className="text-[11px] text-stone-400 truncate capitalize">{business.type} Owner</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => setView('settings')} className="p-1 text-stone-300 hover:text-stone-600">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button onClick={onSignOut} className="p-1 text-stone-300 hover:text-red-500">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
