import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Image, Paperclip, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadReport } from '@/lib/api';
import { toast } from 'sonner';

export function ScanScreen() {
  const { setCurrentScreen, setActiveTab, setCurrentReportId } = useApp();
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    setActiveTab('home');
    setCurrentScreen('home');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setCapturedImages([...capturedImages, ...newFiles]);
    }
    // Reset inputs so the same file handles change event again if needed
    if (e.target) e.target.value = '';
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
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
    <div className="absolute inset-0 bg-foreground overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="pt-12 px-5 pb-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-primary-foreground" />
        </button>
        <h1 className="text-section text-primary-foreground font-semibold">Scan Document</h1>
        <div className="w-10" />
      </div>

      {/* Preview List */}
      {capturedImages.length > 0 && (
        <div className="px-5 py-3 flex gap-2 overflow-x-auto">
          {capturedImages.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative w-20 h-20 rounded-lg bg-card/20 shrink-0 overflow-hidden flex items-center justify-center border border-primary-foreground/20"
            >
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive flex items-center justify-center z-10"
              >
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>

              {isPDF(file) ? (
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <div className="bg-red-500/20 p-1.5 rounded-md mb-1">
                    <Paperclip className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-[8px] text-primary-foreground line-clamp-2 leading-tight">
                    {file.name}
                  </span>
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

      {/* Camera View / Placeholder */}
      <div className="flex-1 relative mx-5 rounded-2xl overflow-hidden bg-foreground/80 flex flex-col items-center justify-center">
        {/* Viewfinder Overlay */}
        <div className="absolute inset-8 border-2 border-dashed border-primary-foreground/50 rounded-xl" />

        <div className="text-center p-6 bg-black/40 backdrop-blur-sm rounded-xl max-w-[80%]">
          <Camera className="w-12 h-12 text-primary-foreground/50 mx-auto mb-4" />
          <p className="text-body text-primary-foreground/90 font-medium mb-1">
            Tap the camera button below
          </p>
          <p className="text-caption text-primary-foreground/60">
            to take a photo of your medical report
          </p>
        </div>
      </div>

      {/* Capture Controls */}
      <div className="px-5 py-6 bg-foreground/95 pb-10">
        {/* Scan Button */}
        {capturedImages.length > 0 && (
          <Button
            size="lg"
            className="w-full mb-6"
            onClick={handleScan}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Process ${capturedImages.length} Document${capturedImages.length > 1 ? 's' : ''}`}
          </Button>
        )}

        {/* Control Row */}
        <div className="flex items-center justify-around translate-y-2">
          {/* Gallery */}
          <button
            onClick={handleGalleryClick}
            className="flex flex-col items-center gap-1.5 py-2 px-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-md">
              <Image className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-caption font-medium text-primary-foreground/80">Gallery</span>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </button>

          {/* Camera (Primary Action) */}
          <button
            onClick={handleCameraClick}
            className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-all duration-200 -mt-8"
          >
            <div className="w-[72px] h-[72px] rounded-full border-[3px] border-foreground flex items-center justify-center">
              <Camera className="w-8 h-8 text-foreground fill-foreground" />
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </button>

          {/* File/PDF */}
          <button
            onClick={handleFileClick}
            className="flex flex-col items-center gap-1.5 py-2 px-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-md">
              <Paperclip className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-caption font-medium text-primary-foreground/80">PDF</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
