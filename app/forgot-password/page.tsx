"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Mail } from "lucide-react";
import { useRedirectIfAuthenticated } from "@/features/auth";
import { authService } from "@/services";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { isLoading } = useRedirectIfAuthenticated();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate sending reset email
      const userExists = authService.resetPassword(email);

      // Always show success to avoid email enumeration
      setIsSubmitted(true);

      if (userExists) {
        toast.success("Password reset instructions sent!");
      } else {
        // Still show success message for security
        toast.success("If an account exists, you will receive reset instructions");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent password reset instructions to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or try again with a different email address.
            </p>
            <p className="text-xs text-muted-foreground text-center bg-muted p-3 rounded-md">
              <strong>Note:</strong> This is a local-only demo app. Passwords are stored in your browser&apos;s
              localStorage. To reset your password, you can clear browser data and create a new account.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
              Try another email
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-8 w-8" />
              <span className="text-2xl font-bold">StudyHub</span>
            </div>
          </div>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex.johnson@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset instructions"}
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
