"use client";

import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, Clock, Calendar, FileText, AlertCircle, BookOpen } from "lucide-react";
import { Button, Badge } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Local-first & Privacy Focused
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Your Complete{" "}
            <span className="text-primary">Student Organizer</span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Organize notes, manage tasks, track deadlines, and study smarter with AI-powered flashcards and quizzes. 
            All your data stays on your device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-sm font-medium">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-sm font-medium">
              <a href="#demo">
                <Play className="mr-2 h-4 w-4" />
                See How It Works
              </a>
            </Button>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Works offline
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              100% private
            </div>
          </div>
        </div>
        
        <div className="mt-14 lg:mt-20">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-2 shadow-2xl shadow-primary/5">
              <div className="rounded-lg bg-card border border-border overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="flex items-center gap-2 ml-3">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">StudyHub Dashboard</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 bg-background">
                  <p className="text-sm font-medium text-foreground mb-4">Welcome back, Alex!</p>
                  
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="p-2.5 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mb-1" />
                      <p className="text-lg sm:text-xl font-bold text-foreground">8</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <Clock className="h-4 w-4 text-yellow-500 mb-1" />
                      <p className="text-lg sm:text-xl font-bold text-foreground">3</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Due Today</p>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Calendar className="h-4 w-4 text-blue-500 mb-1" />
                      <p className="text-lg sm:text-xl font-bold text-foreground">5</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Events</p>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <FileText className="h-4 w-4 text-purple-500 mb-1" />
                      <p className="text-lg sm:text-xl font-bold text-foreground">12</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Notes</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        Today&apos;s Tasks
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-3.5 h-3.5 rounded border border-muted-foreground/30" />
                            <span className="text-[11px] text-foreground truncate">Study for Calculus</span>
                          </div>
                          <Badge variant="danger" className="text-[9px] px-1.5 py-0 h-4">high</Badge>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-3.5 h-3.5 rounded border border-muted-foreground/30" />
                            <span className="text-[11px] text-foreground truncate">Submit lab report</span>
                          </div>
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0 h-4">med</Badge>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-3.5 h-3.5 rounded border border-muted-foreground/30" />
                            <span className="text-[11px] text-foreground truncate">Read Chapter 5</span>
                          </div>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">low</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                        Upcoming
                      </p>
                      <div className="space-y-1.5">
                        <div className="p-1.5 rounded bg-red-500/10 border-l-2 border-red-500">
                          <p className="text-[11px] font-medium text-foreground">Calculus Exam</p>
                          <p className="text-[9px] text-muted-foreground">Tomorrow, 9:00 AM</p>
                        </div>
                        <div className="p-1.5 rounded bg-blue-500/10 border-l-2 border-blue-500">
                          <p className="text-[11px] font-medium text-foreground">Physics Lab</p>
                          <p className="text-[9px] text-muted-foreground">Fri, 2:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
