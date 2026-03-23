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
        style={{
          position: 'relative',
          borderRadius: '1rem',
          border: dragActive ? '2px dashed #B8764F' : '2px dashed rgba(255,255,255,0.15)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          background: dragActive ? 'rgba(184,118,79,0.05)' : 'transparent',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) validateAndUpload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onMouseEnter={(e) => { if (!dragActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
        onMouseLeave={(e) => { if (!dragActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        role="button"
        tabIndex={0}
        aria-label="Upload inspiration images"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{display: 'none'}}
          onChange={(e) => { if (e.target.files?.length) validateAndUpload(e.target.files); e.target.value = ''; }}
          disabled={uploading || remaining <= 0}
        />
        <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem'}}>
          {uploading ? 'Uploading...' : remaining > 0 ? `Drag & drop or click to upload (${remaining} remaining)` : 'Maximum images uploaded'}
        </p>
      </div>
      {error && <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '0.5rem'}}>{error}</p>}
      {existingImages.length > 0 && (
        <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap'}}>
          {existingImages.map((url, i) => (
            <img key={i} src={url} alt={`Inspiration ${i + 1}`} style={{height: '5rem', width: '5rem', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)'}} />
          ))}
        </div>
      )}
    </div>
  );
}
