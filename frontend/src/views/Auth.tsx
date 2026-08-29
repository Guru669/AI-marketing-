import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Store } from 'lucide-react';

type Mode = 'login' | 'register';

export default function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const { user } = await authService.signup(email, password, name);
        authService.saveUser(user);
        onAuthed();
      } else {
        const { user } = await authService.login(email, password);
        authService.saveUser(user);
        onAuthed();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(
        msg.includes('Invalid email or password')
          ? 'Incorrect email or password.'
          : msg.includes('already registered')
          ? 'This email is already registered. Try logging in.'
          : msg.includes('Password must be')
          ? 'Password must be at least 6 characters.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-stone-50">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-stone-900 text-xl leading-none">MarketAI</h1>
              <p className="text-xs text-stone-400 mt-0.5">Marketing Assistant</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-stone-900">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-stone-500 mt-2 mb-8">
            {mode === 'login'
              ? 'Sign in to manage your marketing.'
              : 'Start your AI marketing journey today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    className="input-field pl-11"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field pl-11"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-stone-900 hover:text-amber-700 transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 relative bg-stone-900 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-6">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Your complete
            <br />
            <span className="font-serif italic font-normal text-amber-400">digital marketing</span>
            <br />
            assistant.
          </h2>
          <p className="text-stone-400 mt-4 max-w-md leading-relaxed">
            Create content, manage campaigns, analyze performance, and track competitors —
            all powered by AI, built for small business owners.
          </p>
          <div className="flex flex-wrap gap-2 mt-8">
            {['AI Content', 'Campaigns', 'Analytics', 'Competitors', 'Best Time'].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-stone-200 backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
