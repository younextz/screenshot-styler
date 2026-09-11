import { ArrowUpRight, Clipboard, ImagePlus, Loader2, Plus } from 'lucide-react';
import { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export interface ImageLoaderProps {
  compact?: boolean;
  onImageLoad: (dataUrl: string, width: number, height: number) => void;
}
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export default function ImageLoader({ onImageLoad, compact = false }: ImageLoaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadId = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processFile = useCallback((file: File) => {
    if (!/^image\/(png|jpeg|jpg)$/.test(file.type)) {
      toast.error('Please upload a PNG or JPG image');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }
    const currentLoad = ++loadId.current;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (currentLoad !== loadId.current) return;
        setIsLoading(false);
        onImageLoad(e.target?.result as string, img.width, img.height);
        toast.success('Image loaded successfully');
      };
      img.onerror = () => {
        if (currentLoad !== loadId.current) return;
        setIsLoading(false);
        toast.error('Failed to load image');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      if (currentLoad !== loadId.current) return;
      setIsLoading(false);
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  }, [onImageLoad]);
  // Handle document-level paste events for Command+V
  useEffect(() => {
    const handleDocumentPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processFile(blob);
            e.preventDefault();
            return;
          }
        }
      }
    };
    document.addEventListener('paste', handleDocumentPaste);
    return () => {
      document.removeEventListener('paste', handleDocumentPaste);
    };
  }, [processFile]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      e.target.value = '';
    }
  };
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageItem = clipboardItems.find(item =>
        item.types.some(type => type.startsWith('image/'))
      );
      if (!imageItem) {
        toast.error('Clipboard is empty');
        return;
      }
      const imageType = imageItem.types.find(type => type.startsWith('image/'));
      if (!imageType) {
        toast.error('No image found in clipboard');
        return;
      }
      const blob = await imageItem.getType(imageType);
      const file = new File([blob], 'clipboard-image.png', { type: imageType });
      processFile(file);
    } catch (error) {
      toast.error('Clipboard not available. Try Ctrl/⌘+V or use file picker.');
      console.error('Clipboard error:', error);
    }
  };
  const statusMessage = isLoading ? 'Adding a little atmosphere…' : isDragging ? 'Let go. Let it shine.' : '';

  return (
    <>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </span>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (event.dataTransfer.types.includes('Files')) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) processFile(file);
        }}
        className={cn(
          'overflow-hidden rounded-2xl border bg-white/65 shadow-[0_8px_40px_-12px_hsl(210_30%_25%_/_0.18)] backdrop-blur-xl transition-colors',
          isDragging ? 'border-ring bg-white/90 ring-2 ring-ring/30' : 'border-white/80',
        )}
        aria-busy={isLoading}
      >
        {!compact && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Add some Air: upload a screenshot"
            className="group flex w-full flex-col items-center justify-center px-6 py-10 text-center outline-none transition-colors hover:bg-white/30 focus-visible:bg-white/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-wait sm:py-12"
          >
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-foreground/10 bg-white/60 shadow-sm transition-transform group-hover:-translate-y-1 motion-reduce:transform-none">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
            </span>
            <span className="text-base font-medium">{statusMessage || 'Drop your screenshot here'}</span>
            <span className="mt-2 text-xs text-muted-foreground">or click to choose a file · PNG, JPG, up to 10 MB</span>
          </button>
        )}
        <div className={cn('flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5', !compact && 'border-t border-foreground/[0.07]')}>
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
            Paste image
            <kbd className="ml-1 hidden rounded border border-foreground/10 px-1.5 py-0.5 font-sans text-[10px] sm:inline">⌘ / Ctrl V</kbd>
          </button>
          <div className="flex items-center gap-4">
            <span className="hidden text-[10px] text-muted-foreground sm:inline">PNG, JPG · up to 10 MB</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {compact ? 'Replace image' : 'Add some Air'}
              {compact ? <Plus className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          aria-label="Upload screenshot"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </>
  );
}
