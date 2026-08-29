import { useState, useRef, useEffect } from 'react';
import { Sparkles, PenTool, BarChart3, Megaphone, Users, TrendingUp, ArrowRight, Check, Store, Zap, Hash, Clock } from 'lucide-react';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMouse({ x, y });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const px = (factor: number) => `${mouse.x * factor}px`;
  const py = (factor: number) => `${mouse.y * factor}px`;
  const rotateX = (factor: number) => `${mouse.y * -factor}deg`;
  const rotateY = (factor: number) => `${mouse.x * factor}deg`;

  const features = [
    { icon: PenTool, title: 'AI Content Studio', desc: 'Generate captions, hashtags, and post ideas tailored to your business in seconds.', color: 'from-amber-500 to-orange-600', accent: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Megaphone, title: 'Campaign Manager', desc: 'Plan, organize, and track marketing campaigns across all your social platforms.', color: 'from-emerald-500 to-teal-600', accent: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: BarChart3, title: 'Smart Analytics', desc: 'Understand engagement, reach, and find the best times to post with visual reports.', color: 'from-sky-500 to-blue-600', accent: 'text-sky-600', bg: 'bg-sky-50' },
    { icon: Users, title: 'Competitor Tracking', desc: 'Monitor rival businesses and get AI-powered strategy insights to stay ahead.', color: 'from-rose-500 to-pink-600', accent: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-stone-50 overflow-x-hidden">
      {/* Hero Section with 3D perspective */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ perspective: '2000px' }}>
        {/* Ambient background orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none"
          style={{ transform: `translate3d(${px(-30)}, ${py(-30)}, 0)`, transition: 'transform 0.3s ease-out' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none"
          style={{ transform: `translate3d(${px(40)}, ${py(40)}, 0)`, transition: 'transform 0.3s ease-out' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-sky-200/20 blur-3xl pointer-events-none"
          style={{ transform: `translate3d(${px(-50)}, ${py(50)}, 0)`, transition: 'transform 0.3s ease-out' }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#4f4232 1px, transparent 1px), linear-gradient(90deg, #4f4232 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left" style={{ transform: `translate3d(${px(10)}, ${py(10)}, 0)`, transition: 'transform 0.3s ease-out' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-stone-700">AI-Powered Marketing Assistant</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-900 leading-[1.05] tracking-tight">
              Marketing
              <br />
              <span className="font-serif italic font-normal text-amber-700">made effortless</span>
              <br />
              for small business.
            </h1>
            <p className="text-lg text-stone-500 mt-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Create engaging content, manage campaigns, analyze performance, and outsmart competitors — no marketing degree required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start">
              <button onClick={onGetStarted} className="btn-primary flex items-center justify-center gap-2 px-7 py-3.5 text-base">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 px-5 py-3.5 text-sm text-stone-500 justify-center">
                <Check className="w-4 h-4 text-emerald-500" /> No credit card needed
              </div>
            </div>
          </div>

          {/* Right: 3D floating cards scene */}
          <div className="relative h-[500px] hidden lg:block" style={{ perspective: '1200px' }}>
            <div
              className="absolute inset-0"
              style={{
                transform: `rotateX(${rotateX(8)}) rotateY(${rotateY(8)})`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.2s ease-out',
              }}
            >
              {/* Main dashboard card */}
              <div
                className="absolute top-8 left-8 w-80 card p-5 shadow-2xl"
                style={{
                  transform: `translateZ(80px) translate3d(${px(-15)}, ${py(-15)}, 0)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-stone-900 text-sm">AI Content</span>
                  </div>
                  <span className="badge-amber">New</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-stone-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-stone-100 rounded-lg w-full" />
                  <div className="h-3 bg-stone-100 rounded-lg w-5/6" />
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="badge-stone">#bakery</span>
                  <span className="badge-stone">#fresh</span>
                  <span className="badge-stone">#local</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">AI Score: 94</span>
                </div>
              </div>

              {/* Analytics card */}
              <div
                className="absolute top-4 right-0 w-64 card p-4 shadow-2xl"
                style={{
                  transform: `translateZ(50px) translate3d(${px(25)}, ${py(25)}, 0)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-sm text-stone-900">Performance</span>
                </div>
                <div className="flex items-end gap-1.5 h-20">
                  {[40, 65, 50, 80, 60, 95, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-stone-800 to-stone-400 rounded-t-md" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-2">+24% this week</p>
              </div>

              {/* Best time card */}
              <div
                className="absolute bottom-16 left-0 w-56 card p-4 shadow-2xl"
                style={{
                  transform: `translateZ(60px) translate3d(${px(-20)}, ${py(20)}, 0)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                  <span className="font-semibold text-sm text-stone-900">Best Time</span>
                </div>
                <p className="text-sm text-stone-600">Tuesday, 11 AM</p>
                <p className="text-xs text-stone-400 mt-1">Peak engagement window</p>
              </div>

              {/* Hashtag card */}
              <div
                className="absolute bottom-4 right-4 w-60 card p-4 shadow-2xl"
                style={{
                  transform: `translateZ(40px) translate3d(${px(30)}, ${py(-20)}, 0)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Hash className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <span className="font-semibold text-sm text-stone-900">Trending Tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['#smallbiz', '#shoplocal', '#handmade', '#fresh', '#support'].map((t) => (
                    <span key={t} className="badge-stone text-[10px]">{t}</span>
                  ))}
                </div>
              </div>

              {/* Competitor mini card */}
              <div
                className="absolute top-1/2 left-1/3 w-48 card p-3 shadow-2xl"
                style={{
                  transform: `translateZ(30px) translate3d(${px(15)}, ${py(-30)}, 0)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Rival Watch</p>
                    <p className="text-[10px] text-stone-400">3 competitors tracked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400">
          <span className="text-xs font-medium uppercase tracking-wider">Scroll to explore</span>
          <div className="w-5 h-9 rounded-full border-2 border-stone-300 flex items-start justify-center p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-stone-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10x', label: 'Faster content creation' },
            { value: '4', label: 'Social platforms supported' },
            { value: '94', label: 'Avg AI quality score' },
            { value: '0', label: 'Marketing experience needed' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-amber-400">{s.value}</p>
              <p className="text-sm text-stone-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features section with 3D tilt cards */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mt-2">
              Everything you need to <span className="font-serif italic font-normal text-amber-700">grow online</span>
            </h2>
            <p className="text-stone-500 mt-4 max-w-xl mx-auto">
              From your first post to your hundredth campaign — MarketAI handles the heavy lifting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FeatureCard key={f.title} icon={Icon} title={f.title} desc={f.desc} color={f.color} accent={f.accent} bg={f.bg} index={i} />
              );
            })}
          </div>
        </div>
      </section>

      {/* Who is it for section */}
      <section className="py-20 px-6 bg-stone-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
            Built for <span className="font-serif italic font-normal text-amber-700">local heroes</span>
          </h2>
          <p className="text-stone-500 mt-3 max-w-lg mx-auto">No matter what you sell, MarketAI helps you market it better.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {['Bakery', 'Cafe', 'Salon', 'Gym', 'Boutique', 'Restaurant', 'Florist', 'Coffee Shop', 'Pet Shop', 'Photography', 'Home Business'].map((type) => (
              <span key={type} className="px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm font-medium text-stone-700 shadow-sm hover:shadow-md hover:border-stone-300 transition-all cursor-default">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative card p-12 text-center overflow-hidden" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-transparent to-emerald-50 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-stone-900 flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
                Ready to grow your business?
              </h2>
              <p className="text-stone-500 mt-3 max-w-md mx-auto">
                Set up takes 30 seconds. Start creating AI-powered content today.
              </p>
              <button onClick={onGetStarted} className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base mt-8">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900">MarketAI</span>
          </div>
          <p className="text-sm text-stone-400">AI Marketing Assistant for Small Business Owners</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  accent,
  bg,
  index,
}: {
  icon: typeof PenTool;
  title: string;
  desc: string;
  color: string;
  accent: string;
  bg: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setTilt({ x: y * -10, y: x * 10 });
  };

  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className="card card-hover p-8 cursor-pointer"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-500 leading-relaxed">{desc}</p>
      <div className={`flex items-center gap-1.5 mt-4 text-sm font-medium ${accent}`}>
        Learn more <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}
