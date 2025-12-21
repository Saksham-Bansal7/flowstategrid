// components/image-upload.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  currentImage?: string;
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export default function ImageUpload({
  currentImage,
  onUploadSuccess,
  onUploadError,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onUploadError?.("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      
      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadSuccess(data.image);
      setPreview(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      onUploadError?.(error.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || currentImage;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {displayImage ? (
          <div className="relative size-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
            <Image
              src={displayImage}
              alt="Profile"
              fill
              className="object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="size-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="size-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
            <Camera className="size-12 text-muted-foreground" />
          </div>
        )}
        
        {!uploading && (
          <button
            type="button"
            onClick={handleButtonClick}
            className="absolute bottom-0 right-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Upload profile picture"
          >
            <Camera className="size-5" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <p className="text-xs text-muted-foreground text-center">
        Click the camera icon to upload a new profile picture
        <br />
        (Max 5MB, JPG, PNG, or GIF)
      </p>
    </div>
  );
}