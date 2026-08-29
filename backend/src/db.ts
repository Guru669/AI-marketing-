import mongoose, { Schema, Document } from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketing-assistant';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Remove process.exit(1) to keep the server running so you can see errors
  }
};

// ─── Business Schema ──────────────────────────────────────────────────────────
export interface IBusiness extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  description: string;
  targetAudience: string;
  platforms: string[];
  brandVoice: string;
  primaryColor: string;
  createdAt: Date;
}

const BusinessSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'bakery' },
  description: { type: String, default: '' },
  targetAudience: { type: String, default: '' },
  platforms: { type: [String], default: [] },
  brandVoice: { type: String, default: 'friendly' },
  primaryColor: { type: String, default: '#0ea5e9' },
  createdAt: { type: Date, default: Date.now },
});

// ─── Campaign Schema ──────────────────────────────────────────────────────────
export interface ICampaign extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  goal: string;
  platform: string;
  status: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  createdAt: Date;
}

const CampaignSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  goal: { type: String, default: '' },
  platform: { type: String, default: 'instagram' },
  status: { type: String, default: 'draft' },
  startDate: { type: Date },
  endDate: { type: Date },
  budget: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// ─── Post Schema (extended with publish fields) ───────────────────────────────
export interface IPost extends Document {
  businessId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  platform: string;
  contentType: string;
  mediaUrl?: string;             // Cloudinary/S3 public URL
  caption: string;
  hashtags: string[];
  campaignGoal?: string;
  bestPostTime?: string;
  aiScore?: number;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: Date;
  publishedAt?: Date;
  platformPostId?: string;       // ID returned by the platform API
  platformPostUrl?: string;      // Live link to the post
  errorMessage?: string;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  platform: { type: String, default: 'instagram' },
  contentType: { type: String, default: 'post' },
  mediaUrl: { type: String, default: '' },
  caption: { type: String, default: '' },
  hashtags: { type: [String], default: [] },
  campaignGoal: { type: String, default: '' },
  bestPostTime: { type: String, default: '' },
  aiScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft',
  },
  scheduledTime: { type: Date },
  publishedAt: { type: Date },
  platformPostId: { type: String, default: '' },
  platformPostUrl: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// ─── ConnectedAccount Schema ──────────────────────────────────────────────────
export interface IConnectedAccount extends Document {
  businessId: mongoose.Types.ObjectId;
  platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok';
  accessToken: string;           // AES-256-GCM encrypted
  refreshToken?: string;         // AES-256-GCM encrypted
  expiresAt?: Date;
  platformUserId: string;
  platformUsername: string;
  platformAvatarUrl?: string;
  connectedAt: Date;
}

const ConnectedAccountSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'youtube', 'tiktok'],
    required: true,
  },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, default: '' },
  expiresAt: { type: Date },
  platformUserId: { type: String, default: '' },
  platformUsername: { type: String, default: '' },
  platformAvatarUrl: { type: String, default: '' },
  connectedAt: { type: Date, default: Date.now },
});

// Unique index: one account per platform per business
ConnectedAccountSchema.index({ businessId: 1, platform: 1 }, { unique: true });

// ─── User Schema (for authentication) ───────────────────────────────────────
export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  const password = this.get('password') as string;
  this.set('password', await bcrypt.hash(password, salt));
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Analytics Schema ─────────────────────────────────────────────────────────
export interface IAnalytics extends Document {
  businessId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  platform: string;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  recordedDate: Date;
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  platform: { type: String, default: '' },
  impressions: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  recordedDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// ─── Competitor Schema ────────────────────────────────────────────────────────
export interface ICompetitor extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  platform: string;
  handle: string;
  followerCount: number;
  avgEngagementRate: number;
  postingFrequency: string;
  topContentType: string;
  notes: string;
  createdAt: Date;
}

const CompetitorSchema: Schema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  platform: { type: String, default: 'instagram' },
  handle: { type: String, default: '' },
  followerCount: { type: Number, default: 0 },
  avgEngagementRate: { type: Number, default: 0 },
  postingFrequency: { type: String, default: 'daily' },
  topContentType: { type: String, default: 'post' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
export const Post = mongoose.model<IPost>('Post', PostSchema);
export const ConnectedAccount = mongoose.model<IConnectedAccount>('ConnectedAccount', ConnectedAccountSchema);
export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const Competitor = mongoose.model<ICompetitor>('Competitor', CompetitorSchema);
