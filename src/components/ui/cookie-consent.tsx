"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Shield } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { consentService } from "@/services/consent.service";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = consentService.getConsent();
    if (!consent.hasResponded) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    consentService.accept();
    setVisible(false);
  };

  const handleDecline = () => {
    consentService.decline();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <Card className="max-w-2xl mx-auto pointer-events-auto border-border/50 bg-card/95 backdrop-blur-sm shadow-lg">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Your Privacy Matters
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use browser storage (localStorage) to save your notes, tasks, and preferences locally on your device. 
                Your data never leaves your browser. We also offer optional AI-powered study features.{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Learn more in our Privacy Policy
                </Link>
              </p>
            </div>
            <button
              onClick={handleDecline}
              className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="text-xs order-2 sm:order-1"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="text-xs order-1 sm:order-2"
            >
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
