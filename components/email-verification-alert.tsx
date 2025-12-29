// components/email-verification-alert.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface EmailVerificationAlertProps {
  email: string;
}

export default function EmailVerificationAlert({ email }: EmailVerificationAlertProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    } catch (error) {
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              Email Verification Required
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
              You need to verify your email to create posts, react, comment, or join rooms.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={sending || sent}
            className="border-yellow-600 text-yellow-900 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-100 dark:hover:bg-yellow-950"
          >
            {sent ? "Sent!" : sending ? "Sending..." : "Resend Email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}