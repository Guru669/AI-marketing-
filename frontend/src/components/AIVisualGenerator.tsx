import { useState, useRef, useEffect } from 'react';
import { Sparkles, Download, Check, Image as ImageIcon, Palette, Layout, RefreshCw } from 'lucide-react';

interface AIVisualGeneratorProps {
  onSelectImage?: (imageUrl: string) => void;
  defaultTopic?: string;
  businessName?: string;
}

const STYLES = [
  { id: 'vibrant', label: 'Vibrant Promo', bg: 'from-purple-600 via-pink-500 to-rose-500', text: 'text-white' },
  { id: 'minimal', label: 'Minimalist Dark', bg: 'from-stone-900 via-stone-800 to-black', text: 'text-amber-300' },
  { id: 'warm', label: 'Warm Bakery/Cafe', bg: 'from-amber-700 via-orange-600 to-yellow-600', text: 'text-amber-50' },
  { id: 'emerald', label: 'Modern Bio/Eco', bg: 'from-emerald-700 via-teal-600 to-cyan-700', text: 'text-emerald-100' },
];

const RATIOS = [
  { id: 'square', label: '1:1 Square (Feed)', width: 400, height: 400 },
  { id: 'story', label: '9:16 Story/Reel', width: 337, height: 600 },
  { id: 'banner', label: '16:9 Banner', width: 480, height: 270 },
];

export default function AIVisualGenerator({ onSelectImage, defaultTopic, businessName }: AIVisualGeneratorProps) {
  const [headline, setHeadline] = useState(defaultTopic || 'Special Promotion!');
  const [subheading, setSubheading] = useState(businessName ? `By ${businessName}` : 'Limited Time Offer');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCanvas = () => {
    setIsGenerating(true);
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = selectedRatio.width * 2; // high DPI
    canvas.height = selectedRatio.height * 2;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (selectedStyle.id === 'vibrant') {
      grad.addColorStop(0, '#7e22ce');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, '#f43f5e');
    } else if (selectedStyle.id === 'minimal') {
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#000000');
    } else if (selectedStyle.id === 'warm') {
      grad.addColorStop(0, '#b45309');
      grad.addColorStop(1, '#d97706');
    } else {
      grad.addColorStop(0, '#047857');
      grad.addColorStop(1, '#0f766e');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative shapes / circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.85, canvas.height * 0.2, canvas.width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width * 0.1, canvas.height * 0.85, canvas.width * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Main Text
    ctx.fillStyle = selectedStyle.id === 'minimal' ? '#fde047' : '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap text if needed
    ctx.fillText(headline, canvas.width / 2, canvas.height / 2 - 20);

    // Subheading
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '500 20px sans-serif';
    ctx.fillText(subheading, canvas.width / 2, canvas.height / 2 + 30);

    // Brand tag at bottom
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText((businessName || 'MarketAI').toUpperCase(), canvas.width / 2, canvas.height - 30);

    const dataUrl = canvas.toDataURL('image/png');
    setGeneratedUrl(dataUrl);
    setIsGenerating(false);
  };

  useEffect(() => {
    generateCanvas();
  }, [headline, subheading, selectedStyle, selectedRatio]);

  const handleUseImage = () => {
    if (generatedUrl && onSelectImage) {
      onSelectImage(generatedUrl);
    }
  };

  return (
    <div className="card p-5 space-y-4 border border-stone-200">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-stone-900 text-base">AI Visual Banner & Post Studio</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="label text-xs font-semibold">Post Headline</label>
            <input
              className="input-field text-sm"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Headline..."
            />
          </div>

          <div>
            <label className="label text-xs font-semibold">Subheading / Call-to-Action</label>
            <input
              className="input-field text-sm"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="Subheading..."
            />
          </div>

          <div>
            <label className="label text-xs font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-stone-500" /> Color Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
                    selectedStyle.id === style.id
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${style.bg}`} />
                  <span className="truncate">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label text-xs font-semibold flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-stone-500" /> Aspect Ratio
            </label>
            <div className="flex gap-2">
              {RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedRatio.id === ratio.id
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl border border-stone-200 min-h-[260px]">
          <canvas ref={canvasRef} className="hidden" />
          {generatedUrl ? (
            <div className="space-y-3 flex flex-col items-center">
              <img
                src={generatedUrl}
                alt="AI Banner Preview"
                className="max-h-[220px] rounded-xl shadow-md border border-stone-200 object-contain"
              />
              <button
                onClick={handleUseImage}
                className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" /> Attach Graphic to Post
              </button>
            </div>
          ) : (
            <div className="text-stone-400 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Generating preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
