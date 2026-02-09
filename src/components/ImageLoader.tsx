import { Upload, Clipboard } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface ImageLoaderProps {
  onImageLoad: (dataUrl: string, width: number, height: number) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageLoader({ onImageLoad }: ImageLoaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          }
        }
      }
    };

    document.addEventListener('paste', handleDocumentPaste);
    return () => {
      document.removeEventListener('paste', handleDocumentPaste);
    };
  }, []);

  const processFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      toast.error('Please upload a PNG or JPG image');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onImageLoad(e.target?.result as string, img.width, img.height);
        toast.success('Image loaded successfully');
      };
      img.onerror = () => {
        toast.error('Failed to load image');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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
      toast.error('Clipboard not available. Try Ctrl/Cmd+V or use file picker.');
      console.error('Clipboard error:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-float tilt-hover flex flex-col items-center gap-2 rounded-2xl bg-primary px-4 py-6 text-primary-foreground"
      >
        <Upload className="h-6 w-6" />
        <span className="text-sm font-semibold">Upload</span>
        <span className="text-xs opacity-70">PNG or JPG</span>
      </button>

      <button
        onClick={handlePasteFromClipboard}
        className="btn-float tilt-hover flex flex-col items-center gap-2 rounded-2xl bg-secondary px-4 py-6 text-secondary-foreground"
      >
        <Clipboard className="h-6 w-6" />
        <span className="text-sm font-semibold">Paste</span>
        <span className="text-xs opacity-70">Ctrl/Cmd+V</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
