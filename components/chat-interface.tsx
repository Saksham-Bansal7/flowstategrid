// components/chat-interface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageCircle, Sparkles, Plus } from "lucide-react";
import { useSendMessage, useChatSessions, useDeleteChatSession } from "@/hooks/use-documents";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: {
    content: string;
    chunkIndex: number;
    score: number;
  }[];
}

interface ChatInterfaceProps {
  documentId: string | null;
  documentTitle?: string;
}

export function ChatInterface({
  documentId,
  documentTitle,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useSendMessage();
  const { data: sessionsData } = useChatSessions(documentId);
  const deleteChatSessionMutation = useDeleteChatSession();
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load the most recent session when document changes
  useEffect(() => {
    if (sessionsData?.sessions && sessionsData.sessions.length > 0) {
      const latestSession = sessionsData.sessions[0];
      setSessionId(latestSession.id);
      setMessages(latestSession.messages);
    } else {
      setMessages([]);
      setSessionId(undefined);
    }
  }, [documentId, sessionsData]);

  const handleSend = async () => {
    if (!input.trim() || !documentId) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await sendMessageMutation.mutateAsync({
        question: input.trim(),
        documentId,
        sessionId,
      });

      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Send message error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your question. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = async () => {
  if (sessionId) {
    try {
      await deleteChatSessionMutation.mutateAsync(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }
  setMessages([]);
  setSessionId(undefined);
};

  if (!documentId) {
    return (
      <Card className="w-full">
        <CardContent className="text-center space-y-3 py-12">
          <MessageCircle className="size-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No Document Selected</h3>
            <p className="text-sm text-muted-foreground">
              Upload or select a document to start chatting
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="border-b shrink-0 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Chat with {documentTitle || "Document"}
          </CardTitle>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={startNewChat}>
              <Plus className="size-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="space-y-2">
              <Sparkles className="size-12 text-primary mx-auto" />
              <h3 className="font-semibold">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask questions about your document. I'll search through the
                content and provide accurate answers with sources.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t text-xs space-y-2">
                          <p className="font-semibold text-muted-foreground">
                            Sources:
                          </p>
                          {message.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="bg-background/50 p-2 rounded text-muted-foreground"
                            >
                              <p className="font-mono text-xs">
                                Chunk {source.chunkIndex} (Relevance:{" "}
                                {(source.score * 100).toFixed(1)}%)
                              </p>
                              <p className="text-xs mt-1 line-clamp-2">
                                {source.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      <div className="border-t p-3 shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
