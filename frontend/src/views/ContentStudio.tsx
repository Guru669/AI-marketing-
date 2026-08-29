import { useState } from 'react';
import { PLATFORMS, type Business, type Post } from '@/lib/types';
import { Sparkles, RefreshCw, Save, Clock, Hash, Lightbulb, Check, Copy, Calendar, Upload, Image as ImageIcon, Type, Target } from 'lucide-react';
import MediaUpload from '@/components/MediaUpload';
import PublishModal from '@/components/PublishModal';
import Toast, { ToastType } from '@/components/Toast';
import AIVisualGenerator from '@/components/AIVisualGenerator';
import { api } from '@/lib/api';

type GeneratedContent = {
  caption: string;
  hashtags: string[];
  bestPostTime: string;
  aiScore: number;
  suggestions: string[];
};

const CONTENT_TYPES = [
  { id: 'post', label: 'Feed Post' },
  { id: 'story', label: 'Story' },
  { id: 'reel', label: 'Reel' },
  { id: 'video', label: 'Video' },
];

const TOOLS = [
  { id: 'studio', label: 'Content Studio', icon: Sparkles },
  { id: 'captions', label: 'Caption Generator', icon: Type },
  { id: 'hashtags', label: 'Hashtag Generator', icon: Hash },
  { id: 'adcopy', label: 'Ad Copy Generator', icon: Target },
];

export default function ContentStudio({ business }: { business: Business }) {
  const [activeTool, setActiveTool] = useState('studio');
  const [platform, setPlatform] = useState(business.platforms[0] || 'instagram');
  const [contentType, setContentType] = useState('post');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('Brand Awareness');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  // New state for media and publishing
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [showVisualStudio, setShowVisualStudio] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const goals = ['Brand Awareness', 'Product Launch', 'Seasonal Sale', 'Customer Engagement', 'Lead Generation', 'Followers Growth', 'Event Promotion'];

  const generate = async () => {
    setGenerating(true);
    setError('');
    setGenerated(null);
    setSaved(false);

    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: business.name,
          businessType: business.type,
          description: business.description,
          targetAudience: business.target_audience,
          brandVoice: business.brand_voice,
          platform,
          contentType,
          topic: topic || 'our latest offering',
          goal,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');
      const data: GeneratedContent = await response.json();
      setGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const savePost = async (status: 'draft' | 'scheduled') => {
    if (!generated) return;
    setSaving(true);
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

    try {
      const res = await fetch(`${API_URL}/posts/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: [{
            businessId: business.id,
            platform,
            contentType,
            caption: generated.caption,
            hashtags: generated.hashtags,
            bestPostTime: generated.bestPostTime,
            aiScore: generated.aiScore,
            status,
            mediaUrl,
          }]
        }),
      });

      if (!res.ok) throw new Error('Failed to save post');

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const copyContent = () => {
    if (!generated) return;
    const text = `${generated.caption}\n\n${generated.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    if (!generated || !mediaUrl) return;
    setIsPublishing(true);
    try {
      await api.publishPost({
        businessId: business.id,
        platform,
        contentType,
        mediaUrl,
        caption: generated.caption,
        hashtags: generated.hashtags,
        campaignGoal: goal,
      });
      setToast({ message: 'Post published successfully!', type: 'success' });
      setShowPublishModal(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to publish post', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async (date: Date) => {
    if (!generated || !mediaUrl) return;
    setIsPublishing(true);
    try {
      await api.schedulePost({
        businessId: business.id,
        platform,
        contentType,
        mediaUrl,
        caption: generated.caption,
        hashtags: generated.hashtags,
        campaignGoal: goal,
        scheduledTime: date.toISOString(),
      });
      setToast({ message: 'Post scheduled successfully!', type: 'success' });
      setShowPublishModal(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to schedule post', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">AI Content Hub</h1>
          <p className="text-stone-500 mt-1">Generate AI-powered social media content and visual graphics tailored to your business.</p>
        </div>
        <button
          onClick={() => setShowVisualStudio(!showVisualStudio)}
          className="btn-secondary text-xs flex items-center gap-2 self-start"
        >
          <ImageIcon className="w-4 h-4 text-purple-600" />
          {showVisualStudio ? 'Hide Visual Studio' : 'Open AI Visual Banner Studio'}
        </button>
      </div>

      {/* Tool Selector */}
      <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
        {TOOLS.map((tool) => {
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

      {showVisualStudio && activeTool === 'studio' && (
        <AIVisualGenerator
          onSelectImage={(url) => {
            setMediaUrl(url);
            setMediaType('image');
            setToast({ message: 'AI Banner graphic attached to post media!', type: 'success' });
          }}
          defaultTopic={topic || business.name}
          businessName={business.name}
        />
      )}

      {activeTool === 'studio' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration panel */}
          <div className="card p-6 space-y-5">
            <div>
              <label className="label">Platform</label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      platform === p.id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Content Type</label>
              <div className="grid grid-cols-4 gap-2">
                {CONTENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setContentType(t.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      contentType === t.id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">What's this post about?</label>
              <input
                className="input-field"
                placeholder="e.g. New summer menu launch, weekend special, behind-the-scenes"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Campaign Goal</label>
              <select
                className="input-field"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                {goals.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="pt-2">
              <MediaUpload onUploadSuccess={(url, type) => { setMediaUrl(url); setMediaType(type); }} />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            <button
              onClick={generate}
              disabled={generating || !mediaUrl}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!mediaUrl ? 'Upload media first' : ''}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Generated content panel */}
          <div className="card p-6">
            {generating ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-stone-400 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Crafting your perfect post...
                </div>
                <div className="space-y-3">
                  <div className="h-4 shimmer rounded-lg w-3/4" />
                  <div className="h-4 shimmer rounded-lg w-full" />
                  <div className="h-4 shimmer rounded-lg w-5/6" />
                  <div className="h-8 shimmer rounded-lg w-1/2 mt-4" />
                  <div className="h-4 shimmer rounded-lg w-2/3 mt-4" />
                </div>
              </div>
            ) : generated ? (
              <div className="space-y-5 animate-fade-in">
                {/* Media Preview */}
                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
                    {mediaType === 'image' ? (
                      <img src={mediaUrl} alt="Preview" className="w-full h-48 object-cover" />
                    ) : (
                      <video src={mediaUrl} controls className="w-full h-48 object-cover" />
                    )}
                  </div>
                )}

                {/* AI Score badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-800 to-stone-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm text-stone-900">AI Generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 text-white text-sm font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      {generated.aiScore}
                    </div>
                    <span className="text-xs text-stone-400">Quality Score</span>
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label !mb-0">Caption</label>
                    <button onClick={copyContent} className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                    {generated.caption}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="label flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {generated.hashtags.map((tag) => (
                      <span key={tag} className="badge-blue">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Best time */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-900">Best Time to Post</span>
                  </div>
                  <p className="text-sm text-amber-700">{generated.bestPostTime}</p>
                </div>

                {/* Suggestions */}
                <div>
                  <label className="label flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> AI Suggestions</label>
                  <ul className="space-y-2">
                    {generated.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex gap-2">
                    <button onClick={() => savePost('draft')} disabled={saving} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                      {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Draft</>}
                    </button>
                    <button
                      onClick={() => setShowPublishModal(true)}
                      disabled={!mediaUrl}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!mediaUrl ? 'Upload media first to publish' : ''}
                    >
                      <Upload className="w-4 h-4" /> Publish / Schedule
                    </button>
                  </div>

                  {/* Simulated "Continue on Instagram" link */}
                  {saved && (
                    <a
                      href="https://www.instagram.com/create/select/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all animate-slide-up"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Complete Post on Instagram
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-stone-300" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">Your AI content will appear here</h3>
                <p className="text-sm text-stone-400 max-w-xs">
                  Configure your post settings and click "Generate Content" to create captions, hashtags, and more.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'captions' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-lg text-stone-900">Caption Generator</h3>
            <div>
              <label className="label">What is the post about?</label>
              <textarea className="input-field min-h-[120px] resize-none" placeholder="Describe your post idea..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="label">Tone of Voice</label>
              <div className="flex flex-wrap gap-2">
                {['Professional', 'Witty', 'Empathetic', 'Excited', 'Minimalist'].map(tone => (
                  <button key={tone} className="px-3 py-1.5 rounded-full border border-stone-200 text-xs font-bold text-stone-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                    {tone}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={generate} disabled={generating} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Type className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate Captions'}
            </button>
          </div>
          <div className="card p-6 bg-stone-50/50 border-dashed border-2 border-stone-200 flex flex-col items-center justify-center text-center">
             {generated ? (
               <div className="w-full text-left space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm relative group">
                    <p className="text-sm text-stone-700 leading-relaxed">{generated.caption}</p>
                    <button onClick={copyContent} className="absolute top-2 right-2 p-1.5 bg-stone-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm relative group">
                    <p className="text-sm text-stone-700 leading-relaxed font-italic opacity-80">"Looking for a different variation? Try clicking generate again for more creative hooks."</p>
                  </div>
               </div>
             ) : (
               <>
                <Type className="w-8 h-8 text-stone-300 mb-2" />
                <p className="text-sm text-stone-400">Your AI-generated captions will appear here.</p>
               </>
             )}
          </div>
        </div>
      )}

      {activeTool === 'hashtags' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-lg text-stone-900">Hashtag Generator</h3>
            <div>
              <label className="label">Keywords or Topic</label>
              <input className="input-field" placeholder="e.g. Italian Restaurant, Pasta, Foodie" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900">AI SMART-MATCH</span>
              </div>
              <span className="text-[10px] font-black text-indigo-600 uppercase">Optimized for Reach</span>
            </div>
            <button onClick={generate} disabled={generating} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Hash className="w-4 h-4" /> {generating ? 'Researching...' : 'Generate Hashtags'}
            </button>
          </div>
          <div className="card p-6">
            <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Recommended Hashtags</h4>
            {generated ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {generated.hashtags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-white border border-stone-100 text-xs font-bold text-indigo-600 shadow-sm hover:scale-105 transition-transform cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-[11px] font-bold text-stone-400 mb-2 uppercase">Strategy Note</p>
                  <p className="text-xs text-stone-600 italic">"Mix these high-reach tags with niche community tags for the best algorithmic visibility."</p>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <Hash className="w-8 h-8 text-stone-200 mb-2" />
                <p className="text-sm text-stone-300">Enter keywords to generate high-performing hashtags.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'adcopy' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-100">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-stone-900">AI Ad Copy Generator</h2>
            <p className="text-stone-500 max-w-md mx-auto">Create high-converting ad copy using proven marketing frameworks like AIDA and PAS.</p>

            <div className="grid md:grid-cols-2 gap-4 text-left mt-8">
              <div>
                <label className="label">Product / Service</label>
                <input className="input-field" placeholder="What are you advertising?" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
              <div>
                <label className="label">Framework</label>
                <select className="input-field">
                  <option>AIDA (Attention, Interest, Desire, Action)</option>
                  <option>PAS (Problem, Agitation, Solution)</option>
                  <option>Benefit-Driven</option>
                  <option>Storytelling</option>
                </select>
              </div>
            </div>
            <button onClick={generate} disabled={generating} className="btn-primary px-8 py-3 flex items-center justify-center gap-2 mx-auto">
              <Sparkles className="w-4 h-4" /> {generating ? 'Writing Copy...' : 'Generate Ad Copy'}
            </button>
          </div>

          {generated && (
            <div className="animate-slide-up">
              <div className="card overflow-hidden">
                <div className="bg-stone-900 p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Generated Ad Copy</span>
                  <button onClick={copyContent} className="text-[10px] font-bold text-stone-400 hover:text-white flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy All
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase mb-2 block">Hook / Attention</span>
                    <p className="text-lg font-bold text-stone-900 leading-tight">Stop wasting time on manual marketing. Let AI handle it.</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase mb-2 block">Body / Interest</span>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {generated.caption}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-stone-400 uppercase">Ready for Meta Ads</span>
                    </div>
                    <button className="btn-secondary text-[10px] py-1.5 px-3">Export as PDF</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showPublishModal && (
        <PublishModal
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
          onSchedule={handleSchedule}
          isPublishing={isPublishing}
          platform={PLATFORMS.find(p => p.id === platform)?.label || platform}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
