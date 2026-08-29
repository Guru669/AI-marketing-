import { useState, useEffect } from 'react';
import { BUSINESS_TYPES, PLATFORMS, BRAND_VOICES, type Business } from '@/lib/types';
import { Store, Save, Check, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

import ConnectedAccounts from '@/components/ConnectedAccounts';

export default function Settings({ business, onUpdate }: { business: Business; onUpdate: () => void }) {
  const [form, setForm] = useState({
    name: business.name,
    type: business.type,
    description: business.description,
    target_audience: business.target_audience,
    platforms: business.platforms,
    brand_voice: business.brand_voice,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const togglePlatform = (id: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(id)
        ? f.platforms.filter((p) => p !== id)
        : [...f.platforms, id],
    }));
  };

  const save = async () => {
    setSaving(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/businesses/${business.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          description: form.description,
          targetAudience: form.target_audience,
          platforms: form.platforms,
          brandVoice: form.brand_voice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update business');
      }

      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500 mt-2">Manage your business profile and preferences.</p>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900">Business Profile</h2>
            <p className="text-sm text-stone-400">Update your business information</p>
          </div>
        </div>

        <div>
          <label className="label">Business Name</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="label">Business Type</label>
          <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {BUSINESS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input-field min-h-[100px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does your business do?" />
        </div>

        <div>
          <label className="label">Target Audience</label>
          <input className="input-field" value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} placeholder="Who are your customers?" />
        </div>

        <div>
          <label className="label">Active Platforms</label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => {
              const selected = form.platforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selected ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? 'bg-stone-900' : 'bg-stone-100'}`}>
                    <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-stone-400'}`}>{p.label[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-stone-700">{p.label}</span>
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

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</>}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900">Connected Accounts</h2>
            <p className="text-sm text-stone-400">Connect your social media accounts to enable direct publishing.</p>
          </div>
        </div>

        <ConnectedAccounts businessId={business.id} />
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-stone-900 mb-1">About MarketAI</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          MarketAI is your AI-powered digital marketing assistant. It helps small business owners create engaging content,
          manage campaigns, analyze performance, track competitors, and optimize posting times — all without needing
          digital marketing expertise.
        </p>
      </div>
    </div>
  );
}
