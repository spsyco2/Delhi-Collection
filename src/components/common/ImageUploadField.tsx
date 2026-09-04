import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Check, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  presets?: { name: string; url: string }[];
  className?: string;
  previewHeight?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '/image.png or https://...',
  helperText,
  presets,
  className = '',
  previewHeight = 'h-24',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    setIsUploading(true);

    // If SVG, read as text / DataURL directly without canvas rasterization
    if (file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange(result);
        setIsUploading(false);
        setImageError(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        alert('Failed to read SVG file.');
      };
      reader.readAsDataURL(file);
      return;
    }

    // For raster images (JPEG, PNG, WEBP), compress on canvas to prevent local storage quota overflow
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1400;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            onChange(compressedDataUrl);
          } else {
            // fallback to original if canvas context unavailable
            onChange(event.target?.result as string);
          }
        } catch {
          onChange(event.target?.result as string);
        }
        setIsUploading(false);
        setImageError(false);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert('Failed to process image.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-stone-700 mb-1">
          {label}
        </label>
      )}

      {/* Input controls (URL + Upload Button) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setImageError(false);
            }}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-stone-400 transition-all text-stone-900"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setImageError(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200"
              title="Clear image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Image</span>
            </>
          )}
        </button>
      </div>

      {/* Drag and drop thumbnail preview area */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 p-1 flex items-center gap-3">
          <div className={`w-20 ${previewHeight} rounded-xl bg-stone-900 overflow-hidden flex items-center justify-center relative flex-shrink-0 border border-stone-300 shadow-xs`}>
            {!imageError ? (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center p-1 text-[10px] text-amber-300">
                <span>Broken Image URL</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs font-semibold text-stone-800 truncate">
              {value.startsWith('data:') ? 'Custom Uploaded Image (Base64)' : value.split('/').pop() || 'Image'}
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5 truncate">
              Active image asset ready and displayed
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold underline"
              >
                Change Image
              </button>
              <span className="text-stone-300">•</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-3 sm:p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            isDragging
              ? 'border-amber-500 bg-amber-50/50'
              : 'border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300'
          }`}
        >
          <Upload className="w-5 h-5 text-stone-400 mb-1" />
          <p className="text-xs font-semibold text-stone-700">
            Click to upload or drag and drop image here
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            Supports PNG, JPG, WebP, SVG
          </p>
        </div>
      )}

      {/* Preset Suggestions if provided */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.url}
              type="button"
              onClick={() => onChange(p.url)}
              className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-amber-100 text-stone-700 rounded-md transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-stone-400">{helperText}</p>
      )}
    </div>
  );
};
