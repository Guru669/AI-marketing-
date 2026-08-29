import { useState } from 'react';
import { BUSINESS_TYPES, PLATFORMS, BRAND_VOICES, type Business } from '@/lib/types';
import { Sparkles, Store, ArrowRight, Check } from 'lucide-react';
import { authService } from '@/lib/auth';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'Bakery',
    description: '',
    target_audience: '',
    platforms: ['instagram'] as string[],
    brand_voice: 'Friendly',
    primary_color: '#0ea5e9',
  });

  const togglePlatform = (id: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(id)
        ? f.platforms.filter((p) => p !== id)
        : [...f.platforms, id],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const user = authService.getUser();
    if (!user) {
      setError('User not found. Please log in again.');
      setSaving(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: form.name,
          type: form.type,
          description: form.description,
          targetAudience: form.target_audience,
          platforms: form.platforms,
          brandVoice: form.brand_voice,
          primaryColor: form.primary_color,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create business');
      }

      onComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save business');
      setSaving(false);
    }
  };

  const steps = [
    {
      title: 'What\'s your business name?',
      subtitle: 'Let\'s start with the basics.',
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">Business Name</label>
            <input
              className="input-field text-lg"
              placeholder="e.g. Sweet Crumb Bakery"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Business Type</label>
            <div className="grid grid-cols-3 gap-2">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, type })}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.type === type
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      canProceed: form.name.trim().length > 0,
    },
    {
      title: 'Tell us about your business',
      subtitle: 'The more we know, the better content we can create.',
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">What does your business do?</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="e.g. We bake fresh artisan breads, pastries, and cakes daily using locally sourced ingredients."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Who is your target audience?</label>
            <input
              className="input-field"
              placeholder="e.g. Young professionals and families in the downtown area"
              value={form.target_audience}
              onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
            />
          </div>
        </div>
      ),
      canProceed: true,
    },
    {
      title: 'Where do you want to market?',
      subtitle: 'Select the platforms you want to grow on.',
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">Platforms</label>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((p) => {
                const selected = form.platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selected ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-stone-900' : 'bg-stone-100'}`}>
                      {selected ? <Check className="w-5 h-5 text-white" /> : <span className="text-stone-400 text-sm font-bold">{p.label[0]}</span>}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-stone-900">{p.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Brand Voice</label>
            <div className="flex flex-wrap gap-2">
              {BRAND_VOICES.map((voice) => (
                <button
                  key={voice}
                  onClick={() => setForm({ ...form, brand_voice: voice })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.brand_voice === voice
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {voice}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      canProceed: form.platforms.length > 0,
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-900 text-xl leading-none">MarketAI</h1>
            <p className="text-xs text-stone-400 mt-0.5">Your AI Marketing Assistant</p>
          </div>
        </div>

        <div className="card p-8">
          {/* Progress dots */}
          <div className="flex gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? 'bg-stone-900' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-stone-400" />
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Step {step + 1} of {steps.length}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{current.title}</h2>
            <p className="text-stone-500 text-sm mt-1">{current.subtitle}</p>
          </div>

          <div className="animate-fade-in" key={step}>
            {current.content}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="btn-ghost">Back</button>
            ) : <div />}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!current.canProceed}
                className="btn-primary flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !current.canProceed}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? 'Setting up...' : 'Get Started'} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Set up takes 30 seconds. No credit card required.
        </p>
      </div>
    </div>
  );
}
