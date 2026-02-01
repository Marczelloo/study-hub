"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  Calendar,
  CheckSquare,
  Settings,
  Sun,
  Moon,
  Menu,
  LogOut,
  User,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui";
import { settingsService, semesterService } from "@/services";
import { useAuth } from "@/features/auth";
import { useState, useSyncExternalStore, useCallback } from "react";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: Home },
  { href: "/app/notes", label: "Notes", icon: BookOpen },
  { href: "/app/study", label: "Study", icon: GraduationCap },
  { href: "/app/calendar", label: "Calendar", icon: Calendar },
  { href: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const getTheme = useCallback(() => {
    if (typeof window === "undefined") return "dark";
    return settingsService.getSettings().theme;
  }, []);

  const theme = useSyncExternalStore(
    () => () => {}, // No subscription needed for settings
    getTheme,
    () => "dark" as const
  );

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    settingsService.updateSettings({ theme: newTheme });

    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    // Force re-render
    window.location.reload();
  };

  // Apply theme on mount
  if (typeof window !== "undefined" && theme === "light") {
    document.documentElement.classList.add("light");
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          Dark Mode
        </>
      )}
    </button>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const getSemesterName = useCallback(() => {
    if (typeof window === "undefined") return "";
    const semester = semesterService.getCurrent();
    return semester?.name ?? "";
  }, []);

  const semesterName = useSyncExternalStore(
    () => () => {},
    getSemesterName,
    () => ""
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">StudyHub</span>
        </Link>
        {semesterName && <p className="text-xs text-muted-foreground mt-1">{semesterName}</p>}
      </div>

      <div className="flex-1 p-4">
        <NavLinks onClick={onLinkClick} />
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <ThemeToggle />

        {/* User info and logout */}
        {user && (
          <div className="pt-2 border-t border-border mt-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full mt-1"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent onLinkClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border">
        <SidebarContent />
      </aside>
    </>
  );
}
