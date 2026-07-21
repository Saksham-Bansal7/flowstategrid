// components/document-card.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDeleteDocument } from "@/hooks/use-documents";
import { useState } from "react";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: "pdf" | "image" | "text";
  fileSize: number;
  totalChunks: number;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  metadata?: {
    pageCount?: number;
    subject?: string;
  };
  createdAt: string;
}

interface DocumentCardProps {
  document: Document;
  isSelected?: boolean;
  onSelect: () => void;
}

export function DocumentCard({
  document,
  isSelected,
  onSelect,
}: DocumentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useDeleteDocument();

  const getFileIcon = () => {
    if (document.fileType === "pdf") {
      return <FileText className="size-5 text-red-500" />;
    } else if (document.fileType === "image") {
      return <ImageIcon className="size-5 text-blue-500" />;
    } else {
      return <File className="size-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (document.processingStatus) {
      case "completed":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="size-3" />
            Ready
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="size-3 animate-spin" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="size-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(document.id);
      setShowDeleteConfirm(false);
    } catch (error) {}
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={document.processingStatus === "completed" ? onSelect : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {document.title}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {document.fileName}
              </CardDescription>
            </div>
          </div>
          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
            >
              <Trash2 className="size-4 text-muted-foreground hover:text-red-500" />
            </Button>
          ) : (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{(document.fileSize / 1024).toFixed(2)} KB</span>
          {document.metadata?.pageCount && (
            <span>{document.metadata.pageCount} pages</span>
          )}
          <span>{document.totalChunks} chunks</span>
        </div>
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          {document.metadata?.subject && (
            <Badge variant="outline" className="text-xs">
              {document.metadata.subject}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(document.createdAt), {
            addSuffix: true,
          })}
        </p>
      </CardContent>
    </Card>
  );
}
