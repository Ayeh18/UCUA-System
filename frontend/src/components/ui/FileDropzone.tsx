import { FileText, ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type DragEvent } from 'react';

import { cn } from '@/lib/cn';

interface FileDropzoneProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: string;
  error?: string;
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf';

/** Reads an image preview asynchronously; non-images (PDF) show a document icon. */
function Thumbnail({ file }: { file: File }) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPreview({ file, url: reader.result });
    };
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  const url = preview?.file === file ? preview.url : null;
  if (!url) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-slate-500">
        <FileText className="h-8 w-8" />
      </div>
    );
  }
  return <img src={url} alt={file.name} className="aspect-square w-full object-cover" />;
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileDropzone({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMb = 10,
  accept = DEFAULT_ACCEPT,
  error,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const allowed = accept.split(',').map((type) => type.trim());
    const accepted: File[] = [];
    let problem: string | null = null;

    for (const file of Array.from(incoming)) {
      if (!allowed.includes(file.type)) {
        problem = `${file.name}: unsupported file type`;
      } else if (file.size > maxSizeMb * 1024 * 1024) {
        problem = `${file.name}: larger than ${maxSizeMb} MB`;
      } else {
        accepted.push(file);
      }
    }

    const next = [...value, ...accepted];
    if (next.length > maxFiles) problem = `You can attach up to ${maxFiles} files`;
    setLocalError(problem);
    onChange(next.slice(0, maxFiles));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeAt = (index: number) => {
    setLocalError(null);
    onChange(value.filter((_, i) => i !== index));
  };

  const message = error ?? localError;
  const full = value.length >= maxFiles;

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition',
          dragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-white',
          full && 'pointer-events-none opacity-50',
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm">
          <ImagePlus className="h-5 w-5" />
        </span>
        <span className="mt-3 text-sm font-semibold text-slate-800">
          <span className="text-brand-700">Click to upload</span> or drag and drop
        </span>
        <span className="mt-1 text-xs text-slate-500">
          JPG, PNG, WebP, GIF or PDF · up to {maxSizeMb} MB each · max {maxFiles} files
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={accept}
          disabled={full}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            // Allow re-selecting the same file after removing it.
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      </label>

      {message && (
        <p role="alert" className="text-xs font-medium text-accent-700">
          {message}
        </p>
      )}

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <Thumbnail file={file} />
              <div className="px-2 py-1.5">
                <p className="truncate text-xs font-medium text-slate-700">{file.name}</p>
                <p className="text-[11px] text-slate-400">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${file.name}`}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur transition hover:bg-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
