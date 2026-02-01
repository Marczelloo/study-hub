"use client";

import { useState, useRef } from "react";
import { Moon, Bell, User, Download, Upload, Trash2, Database, GraduationCap } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  Switch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Separator,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { settingsService, authService } from "@/services";
import { generateDemoData, hasDemoData } from "@/lib/demo-seed";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";
import type { Settings } from "@/domain/types";

export default function SettingsPage() {
  const { user, refreshSession } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") {
      return {
        theme: "dark" as const,
        taskReminders: true,
        eventNotifications: true,
        studySessionReminders: false,
        defaultStudyGenerator: "basic" as const,
        allowAiNoteProcessing: true,
      };
    }
    return settingsService.getSettings();
  });

  const handleSettingChange = (key: keyof Settings, value: boolean | string) => {
    settingsService.updateSettings({ [key]: value });
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "theme") {
      if (value === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  };

  const handleLoadDemoData = () => {
    generateDemoData();
    toast.success("Demo data loaded successfully");
    // Refresh the page to reload data
    window.location.reload();
  };

  const handleExportData = () => {
    const data = settingsService.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studyhub-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = settingsService.importData(content);
      if (success) {
        toast.success("Data imported successfully");
        window.location.reload();
      } else {
        toast.error("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    settingsService.resetData();
    authService.logout();
    toast.success("All data has been reset");
    window.location.href = "/login";
  };

  const handleNameChange = (name: string) => {
    settingsService.updateUser({ name });
    refreshSession();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account settings</p>
      </div>

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <Switch
              checked={settings.theme === "dark"}
              onCheckedChange={(checked) => handleSettingChange("theme", checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Task Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded about upcoming deadlines</p>
            </div>
            <Switch
              checked={settings.taskReminders}
              onCheckedChange={(checked) => handleSettingChange("taskReminders", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Event Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts for calendar events</p>
            </div>
            <Switch
              checked={settings.eventNotifications}
              onCheckedChange={(checked) => handleSettingChange("eventNotifications", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Study Session Reminders</p>
              <p className="text-sm text-muted-foreground">Get nudged to start studying</p>
            </div>
            <Switch
              checked={settings.studySessionReminders}
              onCheckedChange={(checked) => handleSettingChange("studySessionReminders", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user?.name ?? ""} onBlur={(e) => handleNameChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          {user?.studentId && (
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" value={user.studentId} disabled />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Study
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Default Generator</p>
              <p className="text-sm text-muted-foreground">Choose the default study material generator</p>
            </div>
            <Select
              value={settings.defaultStudyGenerator || "basic"}
              onValueChange={(value) => handleSettingChange("defaultStudyGenerator", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow AI Processing</p>
              <p className="text-sm text-muted-foreground">Allow AI to process your notes for study materials</p>
            </div>
            <Switch
              checked={settings.allowAiNoteProcessing !== false}
              onCheckedChange={(checked) => handleSettingChange("allowAiNoteProcessing", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Load Demo Data</p>
              <p className="text-sm text-muted-foreground">
                {hasDemoData() ? "Demo data already loaded" : "Populate with sample data to explore features"}
              </p>
            </div>
            <Button variant="outline" onClick={handleLoadDemoData}>
              <Database className="h-4 w-4 mr-2" />
              Load Demo
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your data as a JSON file</p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Import Data</p>
              <p className="text-sm text-muted-foreground">Restore data from a backup file</p>
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportData} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Reset All Data</p>
              <p className="text-sm text-muted-foreground">Delete all data and start fresh</p>
            </div>
            <Button variant="destructive" onClick={() => setResetConfirmOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Data</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to reset all data? This will delete all your notes, tasks, calendar events, and
            settings. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetData}>
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
