export type Business = {
  id: string;
  name: string;
  type: string;
  description: string;
  target_audience: string;
  platforms: string[];
  brand_voice: string;
  primary_color: string;
  user_id: string;
  created_at: string;
};

export type Campaign = {
  id: string;
  business_id: string;
  name: string;
  goal: string;
  platform: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  created_at: string;
};

export type Post = {
  id: string;
  business_id: string;
  campaign_id: string | null;
  platform: string;
  content_type: string;
  caption: string;
  hashtags: string[];
  best_post_time: string;
  status: string;
  scheduled_for: string | null;
  ai_score: number;
  media_url?: string;
  platform_post_url?: string;
  created_at: string;
};

export type Analytics = {
  id: string;
  business_id: string;
  post_id: string | null;
  platform: string;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  recorded_date: string;
  created_at: string;
};

export type Competitor = {
  id: string;
  business_id: string;
  name: string;
  platform: string;
  handle: string;
  follower_count: number;
  avg_engagement_rate: number;
  posting_frequency: string;
  top_content_type: string;
  notes: string;
  created_at: string;
};

export const BUSINESS_TYPES = [
  'Bakery', 'Cafe', 'Salon', 'Gym', 'Boutique', 'Restaurant',
  'Florist', 'Bookstore', 'Coffee Shop', 'Pet Shop', 'Photography Studio',
  'Home Business', 'Other'
] as const;

export const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: 'instagram' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
  { id: 'tiktok', label: 'TikTok', icon: 'tiktok' },
] as const;

export const BRAND_VOICES = [
  'Friendly', 'Professional', 'Playful', 'Luxury', 'Inspirational', 'Casual', 'Bold'
] as const;

export const CAMPAIGN_GOALS = [
  'Brand Awareness', 'Product Launch', 'Seasonal Sale', 'Customer Engagement',
  'Lead Generation', 'Followers Growth', 'Event Promotion'
] as const;

export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed'] as const;