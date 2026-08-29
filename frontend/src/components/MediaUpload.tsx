import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface MediaUploadProps {
  onUploadSuccess: (url: string, type: 'image' | 'video') => void;
}

export default function MediaUpload({ onUploadSuccess }: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError('');

    // Validate size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only image and video files are supported');
      return;
    }

    setUploading(true);
    try {
      const data = await api.uploadMedia(file);
      const isVideo = file.type.startsWith('video/');
      setPreview({ url: data.url, type: isVideo ? 'video' : 'image' });
      onUploadSuccess(data.url, isVideo ? 'video' : 'image');
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const clearMedia = () => {
    setPreview(null);
    onUploadSuccess('', 'image'); // clear in parent
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="label">Media</label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 group">
          {preview.type === 'image' ? (
            <img src={preview.url} alt="Upload preview" className="w-full h-48 object-cover" />
          ) : (
            <video src={preview.url} controls className="w-full h-48 object-cover" />
          )}
          <button
            onClick={clearMedia}
            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,video/mp4,video/quicktime"
            onChange={handleChange}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
              <p className="text-sm font-medium text-stone-600">Uploading media...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 cursor-pointer">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white relative z-10">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-white relative">
                  <Video className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">Click to upload or drag & drop</p>
                <p className="text-xs text-stone-500 mt-1">JPG, PNG, MP4, MOV (max 3GB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
