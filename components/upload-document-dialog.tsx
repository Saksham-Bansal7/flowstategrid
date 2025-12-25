// components/upload-document-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Image as ImageIcon, File, Loader2 } from "lucide-react";
import { useUploadDocument } from "@/hooks/use-documents";

export function UploadDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  const uploadMutation = useUploadDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      await uploadMutation.mutateAsync({ file, title, subject });
      setOpen(false);
      setFile(null);
      setTitle("");
      setSubject("");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const getFileIcon = () => {
    if (!file) return <File className="size-8 text-muted-foreground" />;
    
    if (file.type === 'application/pdf') {
      return <FileText className="size-8 text-red-500" />;
    } else if (file.type.startsWith('image/')) {
      return <ImageIcon className="size-8 text-blue-500" />;
    } else {
      return <File className="size-8 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="size-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription asChild>
            <span>Upload PDF to chat with your notes</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,image/*,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="space-y-2">
                  {getFileIcon()}
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="size-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Click to select file or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF(max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Subject Input */}
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject (optional)
            </label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics, Physics, etc."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {uploadMutation.isError && (
            <p className="text-sm text-red-500">
              {uploadMutation.error?.message || "Failed to upload document"}
            </p>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Uploading & Processing...
              </>
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                Upload & Process
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}