'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  currentPublicId?: string | null;
  folder: 'profiles' | 'projects' | 'logos';
  onUploadComplete: (result: { url: string; publicId: string }) => void;
  onDeleteComplete?: () => void;
  label?: string;
  aspectRatio?: '1:1' | '16:9' | '4:3';
  disabled?: boolean;
}

export function ImageUploader({
  currentImageUrl,
  currentPublicId,
  folder,
  onUploadComplete,
  onDeleteComplete,
  label = 'Unggah Gambar',
  aspectRatio = '1:1',
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      default:
        return 'aspect-square';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    // Validate format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format tidak didukung. Gunakan JPG, PNG, atau WebP');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get signature
      const sigRes = await fetch(`/api/upload/signature?folder=${folder}`);
      if (!sigRes.ok) throw new Error('Gagal mendapatkan signature');
      const { signature, timestamp, api_key, cloud_name } = await sigRes.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', `portfolio-cms/${folder}`);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error('Gagal mengunggah gambar ke Cloudinary');
      }

      const uploadData = await uploadRes.json();
      
      // 3. Delete old image if exists
      if (currentPublicId) {
        await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: currentPublicId }),
        });
      }

      toast.success('Gambar berhasil diunggah');
      onUploadComplete({
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
      });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentPublicId || !onDeleteComplete) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: currentPublicId }),
      });

      if (!res.ok) throw new Error('Gagal menghapus gambar');
      
      toast.success('Gambar berhasil dihapus');
      onDeleteComplete();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}
      
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          disabled={disabled || isUploading || isDeleting}
        />

        {currentImageUrl ? (
          <div className={`relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 ${getAspectClass()}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentImageUrl} 
              alt="Preview" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading || isDeleting}
                className="btn btn-secondary text-xs h-8"
              >
                {isUploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
                Ganti
              </button>
              {onDeleteComplete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={disabled || isUploading || isDeleting}
                  className="btn bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 text-xs h-8"
                >
                  {isDeleting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <X className="mr-1 h-3 w-3" />}
                  Hapus
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading || isDeleting}
            className={`w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-cyan-500/50 transition-colors ${getAspectClass()}`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-2" />
                <span className="text-sm text-zinc-400">Mengunggah...</span>
              </>
            ) : (
              <>
                <div className="bg-zinc-800 p-3 rounded-full mb-2">
                  <ImageIcon className="h-6 w-6 text-zinc-400" />
                </div>
                <span className="text-sm font-medium text-zinc-300">Pilih atau letakkan gambar</span>
                <span className="text-xs text-zinc-500 mt-1">JPG, PNG, WebP (Max 2MB)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
