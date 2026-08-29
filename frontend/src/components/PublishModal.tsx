import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Send, Loader2 } from 'lucide-react';

interface PublishModalProps {
  onClose: () => void;
  onPublish: () => void;
  onSchedule: (date: Date) => void;
  isPublishing: boolean;
  platform: string;
}

export default function PublishModal({ onClose, onPublish, onSchedule, isPublishing, platform }: PublishModalProps) {
  const [tab, setTab] = useState<'publish' | 'schedule'>('publish');
  
  // Format current date for datetime-local input
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultDateTime = now.toISOString().slice(0, 16);
  
  const [scheduledDate, setScheduledDate] = useState(defaultDateTime);

  const handleSchedule = () => {
    onSchedule(new Date(scheduledDate));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-900">Publish Content</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-xl text-stone-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex p-1 mb-6 bg-stone-100 rounded-xl">
            <button
              onClick={() => setTab('publish')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === 'publish' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Send className="w-4 h-4" /> Publish Now
            </button>
            <button
              onClick={() => setTab('schedule')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === 'schedule' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Schedule
            </button>
          </div>

          {tab === 'publish' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 text-blue-900 text-sm">
                Your post will be published immediately to <strong>{platform}</strong>. Make sure your media and caption are ready.
              </div>
              <button
                onClick={onPublish}
                disabled={isPublishing}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                {isPublishing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                ) : (
                  <><Send className="w-4 h-4" /> Publish to {platform}</>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Select Date & Time</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={defaultDateTime}
                />
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your post will automatically be published at the selected time. Make sure your account remains connected.
              </p>
              <button
                onClick={handleSchedule}
                disabled={isPublishing || !scheduledDate}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                {isPublishing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling...</>
                ) : (
                  <><CalendarIcon className="w-4 h-4" /> Schedule for Later</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
