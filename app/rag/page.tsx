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
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionBlock, MotionMain } from "@/components/motion-shell";

export default function RAGPage() {
  const { data: session, status } = useSession();
  const { data: documents, isLoading } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const selectedDoc = documents?.find((d) => d.id === selectedDocId);

  return (
    <MotionMain className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 flex flex-col">
          {/* Header - Stack on mobile */}
          <MotionBlock className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 shrink-0 gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              {/* Back button on mobile - visible when document selected */}
              {selectedDocId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocId(null)}
                  className="lg:hidden -ml-2"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                  Study Assistant
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Upload your notes and ask questions using AI
                </p>
              </div>
            </div>
            <UploadDocumentDialog />
          </MotionBlock>

          {/* Main Content - Single column on mobile */}
          <MotionBlock className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 overflow-hidden min-h-0">
            {/* Documents - Hide on mobile when chat is active */}
            <div className={`${selectedDocId ? 'hidden lg:flex' : 'flex'} lg:col-span-1 flex-col gap-3 overflow-hidden`}>
              <div className="flex items-center gap-2 shrink-0">
                <FileText className="size-4 text-primary" />
                <h2 className="text-base sm:text-lg font-semibold">Your Documents</h2>
              </div>

              {isLoading ? (
                <div className="space-y-3 overflow-y-auto flex-1">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 sm:h-40" />
                  ))}
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
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
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-8 sm:py-12 border rounded-lg px-4 bg-background/70">
                    <FileText className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">No documents yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Upload your first document to get started
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat - Full width on mobile when document selected */}
            <div className={`${!selectedDocId ? 'hidden lg:flex' : 'flex'} lg:col-span-2 flex-col overflow-hidden min-h-0`}>
              <ChatInterface
                documentId={selectedDocId}
                documentTitle={selectedDoc?.title}
              />
            </div>
          </MotionBlock>
        </div>
      </div>
    </MotionMain>
  );
}
