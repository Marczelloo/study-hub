"use client";

import { FileText, CheckSquare, Calendar, Brain, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

const features = [
  {
    icon: FileText,
    title: "Rich Notes",
    description: "Write beautiful notes with our rich text editor. Add images, tables, code blocks, and even drawings.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Stay on top of assignments with priorities, due dates, and subject tagging. Never miss a deadline.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Calendar,
    title: "Smart Calendar",
    description: "Visualize your schedule, track exams, and plan your study sessions with our integrated calendar.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "AI Study Tools",
    description: "Generate flashcards and quizzes from your notes using AI. Study smarter, not harder.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            StudyHub brings all your study tools together in one place. Simple, powerful, and designed for students.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="group border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-5 sm:p-6">
                <div className={`inline-flex p-2.5 rounded-lg ${feature.bgColor} mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
          {["Semesters", "Subjects", "Holidays", "Dark Mode", "Export/Import", "Lesson Plans"].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <ArrowRight className="h-3 w-3 text-primary" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
