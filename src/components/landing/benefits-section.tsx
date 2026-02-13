"use client";

import { HardDrive, Wifi, Brain, Lock, Download, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: HardDrive,
    title: "Local-First Storage",
    description: "Your data lives in your browser. No cloud uploads, no servers, complete ownership.",
  },
  {
    icon: Wifi,
    title: "Works Offline",
    description: "No internet? No problem. StudyHub works perfectly without a connection.",
  },
  {
    icon: Lock,
    title: "100% Private",
    description: "Your notes and data never leave your device. We don't track or sell anything.",
  },
  {
    icon: Brain,
    title: "AI Study Assistant",
    description: "Optional AI features to generate flashcards and quizzes from your notes.",
  },
  {
    icon: Download,
    title: "Export Anytime",
    description: "Download all your data as JSON. Take it anywhere, anytime.",
  },
  {
    icon: Sparkles,
    title: "Modern & Fast",
    description: "Built with the latest tech for a smooth, responsive experience.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 sm:py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Why Students Love StudyHub
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with students in mind. Privacy, simplicity, and powerful features that actually help you study.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
