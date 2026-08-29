import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Business, Campaign, Post, Analytics, User, ConnectedAccount, Competitor } from './db';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketing-assistant';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🌱 Connecting to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Business.deleteMany({});
    await Campaign.deleteMany({});
    await Post.deleteMany({});
    await Analytics.deleteMany({});
    await ConnectedAccount.deleteMany({});
    await Competitor.deleteMany({});

    console.log('🧹 Cleared existing data');

    // 1. Create User
    const user = new User({
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User'
    });
    await user.save();
    console.log('👤 Created Demo User');

    // 2. Create Businesses
    const business = new Business({
      userId: user._id,
      name: 'Artisan Bakery',
      type: 'Bakery & Cafe',
      description: 'Handcrafted sourdough bread and organic pastries in the heart of the city.',
      targetAudience: 'Foodies, local residents, and organic food enthusiasts aged 25-45.',
      platforms: ['instagram', 'facebook', 'tiktok'],
      brandVoice: 'warm, professional, and inviting',
      primaryColor: '#8B4513'
    });
    await business.save();
    const businessId = (business._id as mongoose.Types.ObjectId).toString();

    const luxurySalon = new Business({
      userId: user._id,
      name: 'Glow Up Studio',
      type: 'Salon',
      description: 'Premium hair styling and skincare treatments for modern professionals.',
      targetAudience: 'Professionals aged 20-50 looking for luxury self-care.',
      platforms: ['instagram', 'tiktok'],
      brandVoice: 'luxury, inspirational, and clean',
      primaryColor: '#FDF2F8'
    });
    await luxurySalon.save();
    console.log('🏢 Created Businesses: Artisan Bakery & Glow Up Studio');

    // 3. Create Connected Accounts for Bakery
    await ConnectedAccount.create([
      {
        businessId,
        platform: 'instagram',
        accessToken: 'mock_insta_token',
        platformUserId: 'insta_user_123',
        platformUsername: '@artisanbakery_official',
        platformAvatarUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=150&h=150&fit=crop'
      },
      {
        businessId,
        platform: 'facebook',
        accessToken: 'mock_fb_token',
        platformUserId: 'fb_page_456',
        platformUsername: 'Artisan Bakery Official',
        platformAvatarUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=150&h=150&fit=crop'
      }
    ]);
    console.log('🔗 Created Connected Accounts');

    // 4. Create Campaigns
    const summerCampaign = await Campaign.create({
      businessId: business._id,
      name: 'Summer Sourdough Series',
      goal: 'Brand Awareness',
      platform: 'instagram',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 500
    });

    const holidaySpecial = await Campaign.create({
      businessId: business._id,
      name: 'Holiday Pastry Box',
      goal: 'Seasonal Sale',
      platform: 'facebook',
      status: 'draft',
      budget: 1200
    });
    console.log('📅 Created Campaigns');

    // 5. Create Posts
    const posts = await Post.create([
      {
        businessId,
        campaignId: summerCampaign._id,
        platform: 'instagram',
        contentType: 'post',
        mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
        caption: 'Nothing beats the smell of fresh sourdough in the morning! 🥖✨ Come grab a loaf today.',
        hashtags: ['#sourdough', '#bakery', '#freshbread', '#artisan', '#morningvibes'],
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        aiScore: 92
      },
      {
        businessId,
        campaignId: summerCampaign._id,
        platform: 'instagram',
        contentType: 'reel',
        mediaUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
        caption: 'Watch how we make our signature croissants from scratch! 🥐 #bakinglove',
        hashtags: ['#croissant', '#baking', '#pastrychef', '#foodie'],
        status: 'published',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        aiScore: 88
      },
      {
        businessId,
        platform: 'facebook',
        contentType: 'post',
        mediaUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80',
        caption: 'Join us this Saturday for a free tasting event! ☕🍰',
        hashtags: ['#bakerylife', '#tasting', '#community', '#coffee'],
        status: 'scheduled',
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        aiScore: 85
      },
      {
        businessId,
        platform: 'instagram',
        contentType: 'post',
        status: 'draft',
        caption: 'Working on something sweet for next week... 🍓',
        hashtags: ['#comingsoon', '#bakery'],
        aiScore: 78
      }
    ]);
    console.log('📝 Created Sample Posts');

    // 6. Create Analytics
    await Analytics.create([
      {
        businessId: business._id,
        postId: posts[0]._id,
        platform: 'instagram',
        impressions: 1250,
        reach: 1100,
        engagement: 145,
        likes: 120,
        comments: 15,
        shares: 10,
        saves: 25,
        recordedDate: new Date()
      },
      {
        businessId: business._id,
        postId: posts[1]._id,
        platform: 'instagram',
        impressions: 3400,
        reach: 2900,
        engagement: 420,
        likes: 380,
        comments: 32,
        shares: 8,
        saves: 45,
        recordedDate: new Date()
      },
      // Trend data
      {
        businessId: business._id,
        platform: 'instagram',
        impressions: 5000,
        reach: 4500,
        engagement: 600,
        likes: 550,
        recordedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('📊 Created Analytics Data');

    // 7. Create Competitors
    await Competitor.create([
      {
        businessId,
        name: 'The Bread Factory',
        platform: 'instagram',
        handle: '@breadfactory',
        followerCount: 15200,
        avgEngagementRate: 3.2,
        postingFrequency: 'daily',
        topContentType: 'reel',
        notes: 'Very active with video content and behind-the-scenes.'
      },
      {
        businessId,
        name: 'Sweet Cravings',
        platform: 'instagram',
        handle: '@sweetcravings',
        followerCount: 8400,
        avgEngagementRate: 4.5,
        postingFrequency: '3x week',
        topContentType: 'post',
        notes: 'High engagement on product close-ups.'
      }
    ]);
    console.log('👥 Created Competitor Data');

    console.log('\n✅ Seeding complete! You can now present the app.');
    console.log('Demo Credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
