// app/rag/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useDocuments } from "@/hooks/use-documents";
import { UploadDocumentDialog } from "@/components/upload-document-dialog";
import { DocumentCard } from "@/components/document-card";
import { ChatInterface } from "@/components/chat-interface";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

export default function RAGPage() {
  const { data: session, status } = useSession();
  const { data: documents, isLoading } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const selectedDoc = documents?.find((d) => d.id === selectedDocId);

  return (
    <div className="fixed inset-0 top-16 bg-linear-to-br from-background via-background to-muted">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-full grid grid-rows-[auto_1fr] gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Study Assistant
              </h1>
              <p className="text-muted-foreground text-sm">
                Upload your notes and ask questions using AI
              </p>
            </div>
            <UploadDocumentDialog />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            {/* Left: Document List */}
            <div className="lg:col-span-1 grid grid-rows-[auto_1fr] gap-3 overflow-hidden">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h2 className="text-lg font-semibold">Your Documents</h2>
              </div>

              {isLoading ? (
                <div className="space-y-3 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3 overflow-y-auto pr-2">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      isSelected={doc.id === selectedDocId}
                      onSelect={() => setSelectedDocId(doc.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload your first document to get started
                  </p>
                </div>
              )}
            </div>

            {/* Right: Chat Interface */}
            <div className="lg:col-span-2 overflow-hidden">
              <div className="h-full">
                <ChatInterface
                  documentId={selectedDocId}
                  documentTitle={selectedDoc?.title}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}