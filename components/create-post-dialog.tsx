// components/create-post-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePost } from "@/hooks/use-posts";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";


interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePostDialog({
  open,
  onClose,
}: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const { data: profile } = useUserProfile();
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Check verification before submitting
    if (!profile?.emailVerified) {
      alert("Please verify your email before creating posts.");
      return;
    }

    if (!content.trim()) {
      alert("Please enter some content");
      return;
    }

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createPost.mutateAsync({
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      // Reset form
      setContent("");
      setTags("");
      setImages([]);
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to create post");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    if (images.length >= 4) {
      alert("Maximum 4 images allowed");
      return;
    }

    // Upload to Cloudinary
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();
      if (response.ok) {
        setImages([...images, data.image]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert("Failed to upload image");
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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share your study content with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-32 px-3 py-2 rounded-md border bg-background text-sm resize-none"
              maxLength={5000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/5000 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (optional)</label>
            <Input
              placeholder="e.g. mathematics, physics, programming (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Images (optional)</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("post-image")?.click()}
                disabled={images.length >= 4}
              >
                <ImageIcon className="size-4" />
                Add Image ({images.length}/4)
              </Button>
              <input
                id="post-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`Upload ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}