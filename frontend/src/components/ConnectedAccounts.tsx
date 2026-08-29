import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Trash2, Link2, Loader2, Instagram, Youtube, Facebook, Video } from 'lucide-react';

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-800' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'from-red-600 to-red-700' },
  { key: 'tiktok', label: 'TikTok', icon: Video, color: 'from-stone-900 to-black' },
];

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

interface ConnectedAccountsProps {
  businessId: string;
}

interface AccountInfo {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  connectedAt?: string;
}

type StatusMap = Record<string, AccountInfo>;

export default function ConnectedAccounts({ businessId }: ConnectedAccountsProps) {
  const [status, setStatus] = useState<StatusMap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/status?businessId=${businessId}`);
      if (!res.ok) {
        // Fallback to accounts route if status endpoint is formatted differently
        const accountsRes = await fetch(`${API_BASE}/accounts/${businessId}`);
        if (accountsRes.ok) {
          const accounts: any[] = await accountsRes.json();
          const mapped: StatusMap = {};
          PLATFORMS.forEach((p) => {
            const found = accounts.find((a) => a.platform === p.key);
            mapped[p.key] = found
              ? {
                  connected: true,
                  username: found.platformUsername,
                  avatarUrl: found.platformAvatarUrl,
                  connectedAt: found.connectedAt,
                }
              : { connected: false };
          });
          setStatus(mapped);
          return;
        }
      }
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      console.error('Failed to fetch connection status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Read ?connected=platform or ?error=... from the URL after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected) {
      setToast({
        type: 'success',
        message: `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`,
      });
    }
    if (error) {
      setToast({
        type: 'error',
        message: `Connection error: ${error.replace(/_/g, ' ')}`,
      });
    }

    if (connected || error) {
      const cleanUrl = window.location.pathname + (window.location.search.includes('view=') ? '?view=settings' : '');
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [businessId]);

  const handleConnect = (platform: string) => {
    if (platform === 'youtube' || platform === 'instagram' || platform === 'facebook') {
      window.location.href = `${API_BASE}/auth/${platform}/connect?businessId=${businessId}`;
    } else {
      setToast({ type: 'error', message: `${platform} connection is coming soon.` });
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    try {
      setActionLoading(platform);
      const res = await fetch(`${API_BASE}/auth/disconnect?businessId=${businessId}&platform=${platform}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        // Fallback to accounts route
        await fetch(`${API_BASE}/accounts/${businessId}/${platform}`, { method: 'DELETE' });
      }
      setToast({ type: 'success', message: `Disconnected ${platform} successfully.` });
      await fetchStatus();
    } catch (err: any) {
      setToast({ type: 'error', message: `Failed to disconnect ${platform}` });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-stone-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-stone-700" />
        <span className="text-sm font-medium">Loading connected accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs font-semibold hover:underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {PLATFORMS.map(({ key, label, icon: Icon, color }) => {
          const info = status?.[key];
          const isConnected = info?.connected;
          const isProcessing = actionLoading === key;

          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                {info?.avatarUrl ? (
                  <img
                    src={info.avatarUrl}
                    alt={label}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-stone-900 text-sm">{label}</h4>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isConnected
                      ? `Connected as @${info.username || 'Account'}`
                      : 'Not connected'}
                  </p>
                </div>
              </div>

              <div>
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(key)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(key)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
