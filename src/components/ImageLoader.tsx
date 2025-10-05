import { Upload, Clipboard } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ImageLoaderProps {
  onImageLoad: (dataUrl: string, width: number, height: number) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageLoader({ onImageLoad }: ImageLoaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error('Clipboard not available. Try Ctrl/⌘+V or use file picker.');
      console.error('Clipboard error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 h-32 border-2 border-dashed hover:border-primary transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Upload Image</span>
            <span className="text-xs text-muted-foreground">PNG or JPG, max 10MB</span>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={handlePasteFromClipboard}
          className="flex-1 h-32 border-2 border-dashed hover:border-primary transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <Clipboard className="w-8 h-8" />
            <span className="text-sm font-medium">From Clipboard</span>
            <span className="text-xs text-muted-foreground">Or press Ctrl/⌘+V</span>
          </div>
        </Button>
      </div>

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
