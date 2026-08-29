import { useEffect, useState, useCallback } from 'react';
import { authService, type User } from '@/lib/auth';
import type { Business } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/views/Dashboard';
import ContentStudio from '@/views/ContentStudio';
import Campaigns from '@/views/Campaigns';
import Calendar from '@/views/Calendar';
import Analytics from '@/views/Analytics';
import Competitors from '@/views/Competitors';
import Settings from '@/views/Settings';
import Onboarding from '@/views/Onboarding';
import LandingPage from '@/views/LandingPage';
import Auth from '@/views/Auth';

export type View = 'dashboard' | 'content' | 'calendar' | 'campaigns' | 'analytics' | 'competitors' | 'settings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingBusiness, setFetchingBusiness] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    if (currentUser) setShowLanding(false);
    setLoading(false);
  }, []);

  const loadBusiness = useCallback(async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    const currentUser = authService.getUser();

    if (currentUser) {
      setFetchingBusiness(true);
      try {
        const response = await fetch(`${API_URL}/businesses/user/${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch businesses');

        const businesses = await response.json();
        if (businesses && businesses.length > 0) {
          // Mapping MongoDB structure to frontend type
          const b = businesses[0];
          const mappedBusiness: Business = {
            id: b._id,
            name: b.name,
            type: b.type,
            description: b.description,
            target_audience: b.targetAudience,
            platforms: b.platforms,
            brand_voice: b.brandVoice,
            primary_color: b.primaryColor,
            user_id: b.userId,
            created_at: b.createdAt
          };
          setBusiness(mappedBusiness);
        } else {
          setBusiness(null);
        }
      } catch (err) {
        console.error('Error loading business:', err);
        setBusiness(null);
      } finally {
        setFetchingBusiness(false);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadBusiness();
    } else {
      setBusiness(null);
    }
  }, [user, loadBusiness]);

  if (loading || fetchingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-stone-900 animate-spin" />
          <p className="text-sm text-stone-500 font-medium">Loading your marketing assistant...</p>
        </div>
      </div>
    );
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <Auth onAuthed={() => {
      setUser(authService.getUser());
      setShowLanding(false);
    }} />;
  }

  if (!business) {
    return <Onboarding onComplete={loadBusiness} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar view={view} setView={setView} business={business} onSignOut={() => {
        authService.logout();
        authService.clearUser();
        setUser(null);
        setShowLanding(true);
      }} />
      <main className="flex-1 ml-0 md:ml-72 min-h-screen">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {view === 'dashboard' && <Dashboard business={business} setView={setView} onBusinessUpdate={loadBusiness} />}
          {view === 'content' && <ContentStudio business={business} />}
          {view === 'calendar' && <Calendar business={business} setView={setView} />}
          {view === 'campaigns' && <Campaigns business={business} />}
          {view === 'analytics' && <Analytics business={business} />}
          {view === 'competitors' && <Competitors business={business} />}
          {view === 'settings' && <Settings business={business} onUpdate={loadBusiness} />}
        </div>
      </main>
    </div>
  );
}
