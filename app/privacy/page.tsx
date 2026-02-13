import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground">
                StudyHub is a local-first student organizer application designed with your privacy in mind. 
                This policy explains how we handle your data and protect your privacy.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">2. Data Storage</h2>
              <p className="text-muted-foreground">
                <strong>Local-First Architecture:</strong> StudyHub stores all your data locally in your 
                browser&apos;s localStorage. This includes your notes, tasks, calendar events, study materials, 
                and preferences.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your data never leaves your device unless you explicitly export it</li>
                <li>We do not have access to your stored data</li>
                <li>Data persists in your browser until you clear it or delete your account</li>
                <li>Clearing browser data will remove all your StudyHub data</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">3. AI Features</h2>
              <p className="text-muted-foreground">
                StudyHub offers optional AI-powered features to help you study more effectively:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Flashcard Generation:</strong> When you use AI to generate flashcards, your note 
                  content is sent to our server for processing
                </li>
                <li>
                  <strong>Quiz Generation:</strong> Similarly, quiz generation sends note content to our server
                </li>
                <li>
                  <strong>No Data Retention:</strong> We do not store or log the content sent for AI processing
                </li>
                <li>
                  <strong>Optional:</strong> AI features are completely optional. You can create flashcards 
                  and quizzes manually without using AI
                </li>
              </ul>
              <p className="text-muted-foreground">
                You can disable AI features in your Settings at any time.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">4. No Third-Party Sharing</h2>
              <p className="text-muted-foreground">
                We do not share, sell, or rent your personal data to any third parties. 
                Your data remains on your device and is never transmitted to external services 
                (except for optional AI processing as described above).
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">5. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                StudyHub does not use traditional HTTP cookies. We use browser localStorage to store:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your account session information</li>
                <li>Your notes, tasks, and calendar events</li>
                <li>Your preferences and settings</li>
                <li>Your consent preferences</li>
              </ul>
              <p className="text-muted-foreground">
                localStorage is specific to your browser and device. We do not use any analytics 
                or tracking services.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
              <p className="text-muted-foreground">You have full control over your data:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Export:</strong> Go to Settings to export all your data as a JSON file
                </li>
                <li>
                  <strong>Delete:</strong> You can delete individual items or reset all data from Settings
                </li>
                <li>
                  <strong>Portability:</strong> Exported data can be imported back into StudyHub or used elsewhere
                </li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">7. Security</h2>
              <p className="text-muted-foreground">
                Since your data is stored locally in your browser, the security of your data depends on 
                the security of your device and browser. We recommend:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Keeping your browser and operating system up to date</li>
                <li>Using a secure, password-protected device</li>
                <li>Regularly exporting your data as a backup</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. Any changes will be reflected in the 
                &quot;Last updated&quot; date at the top of this page.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
              <p className="text-muted-foreground">
                If you have questions about this privacy policy or our data practices, please contact us 
                through our GitHub repository or project issues.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
