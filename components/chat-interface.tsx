// components/chat-interface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageCircle, Sparkles, Plus } from "lucide-react";
import {
  useSendMessage,
  useChatSessions,
  useDeleteChatSession,
} from "@/hooks/use-documents";
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

    const userMessage: Message = { role: "user", content: input.trim() };
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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  const startNewChat = async () => {
    if (sessionId) {
      try {
        await deleteChatSessionMutation.mutateAsync(sessionId);
      } catch (error) {}
    }
    setMessages([]);
    setSessionId(undefined);
  };

  if (!documentId) {
    return (
      <div className="relative h-full rounded-lg border bg-card">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <MessageCircle className="size-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Document Selected</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Upload or select a document to start chatting
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full rounded-lg border bg-card">
      {/* Header - Absolute positioned */}
      <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b bg-muted/50 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h3 className="font-semibold text-sm truncate">
            {documentTitle || "Document"}
          </h3>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={startNewChat}>
            <Plus className="size-4 mr-1" />
            New
          </Button>
        )}
      </div>

      {/* Messages - Absolute positioned with top and bottom offsets */}
      <div className="absolute top-14 bottom-20 left-0 right-0 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3 max-w-md">
              <Sparkles className="size-12 text-primary mx-auto" />
              <h3 className="font-semibold">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about your document.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {/* {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <p className="text-xs font-semibold">Sources:</p>
                          {message.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="bg-background/50 rounded p-2 text-xs"
                            >
                              <p className="font-mono">
                                Chunk {source.chunkIndex} (
                                {(source.score * 100).toFixed(1)}%)
                              </p>
                            </div>
                          ))}
                        </div>
                      )} */}
                    </>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - Absolute positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 border-t p-4 bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSend())
            }
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            size="icon"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
