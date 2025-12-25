// hooks/use-documents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'text';
  fileSize: number;
  totalChunks: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    pageCount?: number;
    subject?: string;
    tags?: string[];
  };
  createdAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    content: string;
    chunkIndex: number;
    pageNumber?: number;
    score: number;
  }[];
  timestamp: string;
}

// Query: Fetch all documents
export function useDocuments() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      return data.documents as Document[];
    },
    enabled: !!session?.user?.id,
  });
}

// Mutation: Upload document
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title, subject }: { file: File; title?: string; subject?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (subject) formData.append('subject', subject);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

// Mutation: Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

// Mutation: Send chat message
export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ 
      question, 
      documentId, 
      sessionId 
    }: { 
      question: string; 
      documentId: string; 
      sessionId?: string;
    }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, documentId, sessionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      return response.json();
    },
  });
}
export function useChatSessions(documentId: string | null) {
  return useQuery({
    queryKey: ["chat-sessions", documentId],
    queryFn: async () => {
      if (!documentId) return { sessions: [] };
      
      const response = await fetch(`/api/chat/sessions?documentId=${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chat sessions");
      }
      return response.json();
    },
    enabled: !!documentId,
  });
}
export function useDeleteChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat session");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });
}