import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Image, Paperclip, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadReport } from '@/lib/api';
import { toast } from 'sonner';

export function ScanScreen() {
  const { setCurrentScreen, setActiveTab, setCurrentReportId } = useApp();
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    setActiveTab('home');
    setCurrentScreen('home');
  };

  const validateAndAddFiles = (files: FileList | null, type: 'image' | 'pdf') => {
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    let hasInvalidFile = false;

    Array.from(files).forEach(file => {
      if (type === 'image') {
        if (file.type.startsWith('image/')) {
          newFiles.push(file);
        } else {
          hasInvalidFile = true;
        }
      } else if (type === 'pdf') {
        if (file.type === 'application/pdf') {
          newFiles.push(file);
        } else {
          hasInvalidFile = true;
        }
      }
    });

    if (hasInvalidFile) {
      toast.error(`Please select ${type === 'image' ? 'image' : 'PDF'} files only.`);
    }

    if (newFiles.length > 0) {
      setCapturedImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files, 'image');
    if (e.target) e.target.value = '';
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files, 'pdf');
    if (e.target) e.target.value = '';
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleScan = async () => {
    if (capturedImages.length === 0) {
      toast.error('Please select at least one document');
      return;
    }

    setUploading(true);
    try {
      const file = capturedImages[0];
      const result = await uploadReport(file);

      setCurrentReportId(result.report_id);
      setCurrentScreen('scanning');

      toast.success('Document uploaded successfully!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Failed to upload document. Please try again.');
      setCurrentScreen('scan-error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index));
  };

  const isPDF = (file: File) => file.type === 'application/pdf';

  return (
    <div className="absolute inset-0 bg-background overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="pt-12 px-5 pb-4 flex items-center justify-between z-10 bg-background border-b">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-section font-semibold">Upload Document</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center gap-8">

        {capturedImages.length === 0 ? (
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Upload your report</h2>
            <p className="text-muted-foreground">
              Select an image from your gallery or upload a PDF document directly.
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 gap-4">
            {capturedImages.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative aspect-square rounded-xl bg-secondary overflow-hidden border border-border"
              >
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive flex items-center justify-center z-10"
                >
                  <X className="w-3 h-3 text-destructive-foreground" />
                </button>

                {isPDF(file) ? (
                  <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center">
                    <Paperclip className="w-8 h-8 text-foreground mb-2" />
                    <span className="text-xs text-muted-foreground break-all line-clamp-2">{file.name}</span>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Bottom Controls */}
      <div className="p-5 pb-8 bg-background border-t">
        {capturedImages.length > 0 ? (
          <Button
            size="lg"
            className="w-full mb-4"
            onClick={handleScan}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Process ${capturedImages.length} Document${capturedImages.length > 1 ? 's' : ''}`}
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGalleryClick}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-secondary rounded-xl active:scale-95 transition-transform hover:bg-secondary/80"
            >
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border">
                <Image className="w-6 h-6 text-foreground" />
              </div>
              <span className="font-medium">Gallery</span>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGallerySelect}
                className="hidden"
              />
            </button>

            <button
              onClick={handleFileClick}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-secondary rounded-xl active:scale-95 transition-transform hover:bg-secondary/80"
            >
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border">
                <Paperclip className="w-6 h-6 text-foreground" />
              </div>
              <span className="font-medium">PDF File</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfSelect}
                className="hidden"
              />
            </button>
          </div>
        )}

        {/* Add more button if items exist */}
        {capturedImages.length > 0 && (
          <div className="flex gap-3 justify-center mt-2">
            <Button variant="outline" size="sm" onClick={handleGalleryClick} className="flex gap-2">
              <Image className="w-4 h-4" /> Add Image
            </Button>
            <Button variant="outline" size="sm" onClick={handleFileClick} className="flex gap-2">
              <Paperclip className="w-4 h-4" /> Add PDF
            </Button>
            {/* Hidden inputs must remain accessible */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleGallerySelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePdfSelect}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}

