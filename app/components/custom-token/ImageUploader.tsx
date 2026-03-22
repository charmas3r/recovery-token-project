import {useCallback, useRef, useState} from 'react';

interface ImageUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  existingImages?: string[];
  onUpload: (files: File[]) => void;
  uploading?: boolean;
}

export function ImageUploader({
  maxFiles = 5, maxSizeMB = 5, existingImages = [], onUpload, uploading = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = maxFiles - existingImages.length;

  const validateAndUpload = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const valid: File[] = [];
      for (const file of Array.from(files)) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError('Only JPEG, PNG, and WebP images are accepted');
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`Each file must be under ${maxSizeMB}MB`);
          return;
        }
        valid.push(file);
      }
      if (valid.length > remaining) {
        setError(`You can upload ${remaining} more image${remaining !== 1 ? 's' : ''}`);
        return;
      }
      onUpload(valid);
    },
    [maxSizeMB, remaining, onUpload],
  );

  return (
    <div>
      <div
        className={`relative rounded-2xl border-2 border-dashed p-xl text-center transition-colors cursor-pointer ${
          dragActive ? 'border-accent bg-accent/5' : 'border-white/[0.15] hover:border-white/[0.25]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) validateAndUpload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        aria-label="Upload inspiration images"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) validateAndUpload(e.target.files); e.target.value = ''; }}
          disabled={uploading || remaining <= 0}
        />
        <p className="text-white/50 text-sm">
          {uploading ? 'Uploading...' : remaining > 0 ? `Drag & drop or click to upload (${remaining} remaining)` : 'Maximum images uploaded'}
        </p>
      </div>
      {error && <p className="text-red-400 text-sm mt-sm">{error}</p>}
      {existingImages.length > 0 && (
        <div className="flex gap-sm mt-md flex-wrap">
          {existingImages.map((url, i) => (
            <img key={i} src={url} alt={`Inspiration ${i + 1}`} className="h-20 w-20 rounded-lg object-cover border border-white/[0.08]" />
          ))}
        </div>
      )}
    </div>
  );
}
