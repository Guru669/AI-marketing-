const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export const api = {
  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('media', file);

    const res = await fetch(`${API_URL}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  async publishPost(data: any) {
    const res = await fetch(`${API_URL}/posts/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Publish failed');
    }
    return res.json();
  },

  async schedulePost(data: any) {
    const res = await fetch(`${API_URL}/posts/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Schedule failed');
    }
    return res.json();
  },

  async getConnectedAccounts(businessId: string) {
    const res = await fetch(`${API_URL}/accounts/${businessId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch accounts');
    }
    return res.json();
  },

  async disconnectAccount(businessId: string, platform: string) {
    const res = await fetch(`${API_URL}/accounts/${businessId}/${platform}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to disconnect account');
    }
    return res.json();
  },
};
