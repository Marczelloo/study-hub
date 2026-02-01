"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { calendarService, subjectService, holidayService, lessonService, settingsService } from "@/services";
import { storage } from "@/data/storage";
import { STORAGE_KEYS } from "@/domain/constants";
import { LessonPlanDialog } from "@/components/calendar/LessonPlanDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getCalendarDays,
  getMonthName,
  isSameDay,
  formatTime,
  addMonths,
  addDays,
  getStartOfWeek,
  getDayName,
  getDayOfWeek,
} from "@/lib/dates";
import type { CalendarEvent, CalendarEventType, Subject, Holiday, Lesson } from "@/domain/types";

const EVENT_TYPE_STYLES: Record<CalendarEventType, string> = {
  exam: "bg-red-500/80 text-white",
  assignment: "bg-blue-500/80 text-white",
  project: "bg-purple-500/80 text-white",
  class: "bg-green-500/80 text-white",
  personal: "bg-gray-500/80 text-white",
};

const EVENT_TYPES: CalendarEventType[] = ["exam", "assignment", "project", "class", "personal"];

interface EventFormData {
  title: string;
  description: string;
  type: CalendarEventType;
  startAt: string;
  endAt: string;
  subjectId: string;
}

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function EventForm({
  event,
  subjects,
  selectedDate,
  onSave,
  onCancel,
}: {
  event?: CalendarEvent;
  subjects: Subject[];
  selectedDate: Date;
  onSave: (data: EventFormData) => void;
  onCancel: () => void;
}) {
  const defaultDate = formatDateForInput(selectedDate);
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [type, setType] = useState<CalendarEventType>(event?.type ?? "class");
  const [startDate, setStartDate] = useState(event?.startAt ? event.startAt.split("T")[0] : defaultDate);
  const [startTime, setStartTime] = useState(event?.startAt ? formatTime(event.startAt) : "09:00");
  const [endTime, setEndTime] = useState(event?.endAt ? formatTime(event.endAt) : "10:00");
  const [subjectId, setSubjectId] = useState(event?.subjectId ?? "__none__");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const startAt = `${startDate}T${startTime}:00.000Z`;
    const endAt = endTime ? `${startDate}T${endTime}:00.000Z` : "";

    onSave({ title, description, type, startAt, endAt, subjectId: subjectId === "__none__" ? "" : subjectId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  <span className="capitalize">{t}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject (optional)</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div
          className="relative cursor-pointer"
          onClick={() => (document.getElementById("date") as HTMLInputElement)?.showPicker?.()}
        >
          <Input
            id="date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="cursor-pointer w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <div
            className="relative cursor-pointer"
            onClick={() => (document.getElementById("startTime") as HTMLInputElement)?.showPicker?.()}
          >
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="cursor-pointer w-full"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time (optional)</Label>
          <div
            className="relative cursor-pointer"
            onClick={() => (document.getElementById("endTime") as HTMLInputElement)?.showPicker?.()}
          >
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="cursor-pointer w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{event ? "Save Changes" : "Create Event"}</Button>
      </DialogFooter>
    </form>
  );
}

function MonthCalendar({
  currentDate,
  events,
  holidays,
  lessons,
  subjects,
  selectedDate,
  onDateSelect,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  holidays: Holiday[];
  lessons: Lesson[];
  subjects: Subject[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}) {
  const days = getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  return (
    <div className="flex-1">
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayEvents = events.filter((e) => isSameDay(e.startAt, day));

          // Find holidays for this day - use local date format
          const dateStr = formatDateForInput(day);
          const dayHolidays = holidays.filter((h) => h.date === dateStr);

          // Check if this is a day off (hide lessons on public holidays)
          const isDayOff = dayHolidays.some((h) => holidayService.isDayOff(h));

          // Find lessons for this day (hide if day off)
          const dayOfWeek = getDayOfWeek(day);
          const dayLessons = isDayOff ? [] : lessons.filter((lesson) => lesson.dayOfWeek === dayOfWeek);

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={cn(
                "min-h-24 p-1 text-left border border-border rounded-lg transition-colors",
                !isCurrentMonth && "opacity-40",
                isSelected && "ring-2 ring-primary",
                isToday && "bg-primary/10",
                "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block w-6 h-6 text-center text-sm rounded-full",
                  isToday && "bg-primary text-primary-foreground"
                )}
              >
                {day.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {/* Holidays */}
                {dayHolidays.map((holiday) => (
                  <div key={holiday.name} className="text-xs px-1 py-0.5 rounded truncate bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-500/30">
                    🎉 {holiday.name}
                  </div>
                ))}
                
                {/* Lessons */}
                {dayLessons.slice(0, 1).map((lesson) => {
                  const subject = subjectMap.get(lesson.subjectId);
                  return (
                    <div
                      key={lesson.id}
                      className="text-xs px-1 py-0.5 rounded truncate"
                      style={{
                        backgroundColor: subject?.color ? `${subject.color}20` : undefined,
                        borderLeft: `2px solid ${subject?.color || '#6366f1'}`,
                      }}
                    >
                      {subject?.name || 'Lesson'} {lesson.startTime}
                    </div>
                  );
                })}

                {/* Events */}
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={cn("text-xs px-1 py-0.5 rounded truncate", EVENT_TYPE_STYLES[event.type])}
                  >
                    {event.title}
                  </div>
                ))}
                {(dayEvents.length + dayHolidays.length + dayLessons.length) > 3 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length + dayHolidays.length + dayLessons.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64; // pixels per hour (h-16 = 4rem = 64px)

// Helper to get minutes from midnight for a date
function getMinutesFromMidnight(dateString: string): number {
  const date = new Date(dateString);
  return date.getHours() * 60 + date.getMinutes();
}

// Helper to calculate event duration in minutes
function getEventDurationMinutes(startAt: string, endAt?: string): number {
  if (!endAt) return 60; // Default 1 hour if no end time
  const start = new Date(startAt);
  const end = new Date(endAt);
  return Math.max(30, (end.getTime() - start.getTime()) / (1000 * 60)); // Minimum 30 min for visibility
}

function WeekCalendar({
  currentDate,
  events,
  holidays,
  lessons,
  subjects,
  selectedDate,
  onDateSelect,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  holidays: Holiday[];
  lessons: Lesson[];
  subjects: Subject[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const weekStart = getStartOfWeek(currentDate);
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.startAt, day));
  };

  const getHolidaysForDay = (day: Date) => {
    const dateStr = formatDateForInput(day);
    return holidays.filter((h) => h.date === dateStr);
  };

  const getLessonsForDay = (day: Date) => {
    // Check if this day is a day off (hide lessons on public holidays)
    const dayHolidays = getHolidaysForDay(day);
    const isDayOff = dayHolidays.some((h) => holidayService.isDayOff(h));
    if (isDayOff) return [];
    
    const dayOfWeek = getDayOfWeek(day);
    return lessons.filter((lesson) => lesson.dayOfWeek === dayOfWeek);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 gap-px border-b border-border">
        <div className="p-2 text-xs text-muted-foreground"></div>
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "p-2 text-center transition-colors hover:bg-muted rounded-t-lg",
                isSelected && "bg-primary/20",
                isToday && "text-primary font-semibold"
              )}
            >
              <div className="text-xs text-muted-foreground">{getDayName(day)}</div>
              <div
                className={cn(
                  "text-lg",
                  isToday &&
                    "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}
              >
                {day.getDate()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hours grid with positioned events */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 gap-px relative">
          {/* Time column */}
          <div className="sticky left-0 bg-background z-10">
            {HOURS.map((hour) => (
              <div key={hour} className="h-16 p-1 text-xs text-muted-foreground text-right pr-2 border-r border-border">
                {hour.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns with events */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            const dayHolidays = getHolidaysForDay(day);
            const dayLessons = getLessonsForDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={cn("relative cursor-pointer", isSelected && "bg-primary/5")}
              >
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-r border-border hover:bg-muted/30 transition-colors"
                  />
                ))}

                {/* Holiday banner at top */}
                {dayHolidays.map((holiday, idx) => (
                  <div
                    key={holiday.name}
                    className="absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-500/30 z-10"
                    style={{ top: `${idx * 18}px` }}
                  >
                    🎉 {holiday.name}
                  </div>
                ))}

                {/* Positioned lessons */}
                {dayLessons.map((lesson) => {
                  const [hours, minutes] = lesson.startTime.split(":").map(Number);
                  const [endHours, endMinutes] = lesson.endTime.split(":").map(Number);
                  const startMinutes = hours * 60 + minutes;
                  const endMinutesCalc = endHours * 60 + endMinutes;
                  const durationMinutes = endMinutesCalc - startMinutes;
                  const topPx = (startMinutes / 60) * HOUR_HEIGHT;
                  const heightPx = Math.max(20, (durationMinutes / 60) * HOUR_HEIGHT);
                  const subject = subjectMap.get(lesson.subjectId);

                  return (
                    <div
                      key={lesson.id}
                      className="absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-xs overflow-hidden z-15"
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        minHeight: "20px",
                        backgroundColor: subject?.color ? `${subject.color}30` : '#6366f130',
                        borderLeft: `3px solid ${subject?.color || '#6366f1'}`,
                      }}
                    >
                      <div className="font-medium truncate">{subject?.name || 'Lesson'}</div>
                      {heightPx >= 40 && (
                        <div className="text-[10px] opacity-80">
                          {lesson.startTime} - {lesson.endTime}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Positioned events */}
                {dayEvents.map((event) => {
                  const startMinutes = getMinutesFromMidnight(event.startAt);
                  const durationMinutes = getEventDurationMinutes(event.startAt, event.endAt);
                  const topPx = (startMinutes / 60) * HOUR_HEIGHT;
                  const heightPx = Math.max(20, (durationMinutes / 60) * HOUR_HEIGHT);

                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={cn(
                        "absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-xs overflow-hidden z-20",
                        EVENT_TYPE_STYLES[event.type],
                        "hover:opacity-90 transition-opacity"
                      )}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        minHeight: "20px",
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {heightPx >= 40 && (
                        <div className="text-[10px] opacity-80">
                          {formatTime(event.startAt)}
                          {event.endAt && ` - ${formatTime(event.endAt)}`}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DayCalendar({
  currentDate,
  events,
  holidays,
  lessons,
  subjects,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  holidays: Holiday[];
  lessons: Lesson[];
  subjects: Subject[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const today = new Date();
  const isToday = isSameDay(currentDate, today);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const dayEvents = events.filter((event) => isSameDay(event.startAt, currentDate));
  
  const dateStr = formatDateForInput(currentDate);
  const dayHolidays = holidays.filter((h) => h.date === dateStr);

  // Check if this day is a day off (hide lessons on public holidays)
  const isDayOff = dayHolidays.some((h) => holidayService.isDayOff(h));

  const dayOfWeek = getDayOfWeek(currentDate);
  const dayLessons = isDayOff ? [] : lessons.filter((lesson) => lesson.dayOfWeek === dayOfWeek);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day header */}
      <div className="p-4 border-b border-border text-center">
        <div className="text-sm text-muted-foreground">{getDayName(currentDate)}</div>
        <div className={cn("text-3xl font-bold", isToday && "text-primary")}>{currentDate.getDate()}</div>
        <div className="text-sm text-muted-foreground">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Hours grid with positioned events */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex relative">
          {/* Time column */}
          <div className="w-16 shrink-0 border-r border-border">
            {HOURS.map((hour) => (
              <div key={hour} className="h-16 p-2 text-sm text-muted-foreground text-right pr-4">
                {hour.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1 relative">
            {/* Hour grid lines */}
            {HOURS.map((hour) => (
              <div key={hour} className="h-16 border-b border-border" />
            ))}

            {/* Holiday banners at top */}
            {dayHolidays.map((holiday, idx) => (
              <div
                key={holiday.name}
                className="absolute left-1 right-1 px-3 py-1 rounded text-sm font-medium bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-500/30 z-10"
                style={{ top: `${idx * 32}px` }}
              >
                🎉 {holiday.name}
              </div>
            ))}

            {/* Positioned lessons */}
            {dayLessons.map((lesson) => {
              const [hours, minutes] = lesson.startTime.split(":").map(Number);
              const [endHours, endMinutes] = lesson.endTime.split(":").map(Number);
              const startMinutes = hours * 60 + minutes;
              const endMinutesCalc = endHours * 60 + endMinutes;
              const durationMinutes = endMinutesCalc - startMinutes;
              const topPx = (startMinutes / 60) * HOUR_HEIGHT;
              const heightPx = Math.max(40, (durationMinutes / 60) * HOUR_HEIGHT);
              const subject = subjectMap.get(lesson.subjectId);

              return (
                <div
                  key={lesson.id}
                  className="absolute left-1 right-1 px-3 py-1 rounded text-left overflow-hidden"
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    minHeight: "40px",
                    backgroundColor: subject?.color ? `${subject.color}30` : '#6366f130',
                    borderLeft: `4px solid ${subject?.color || '#6366f1'}`,
                  }}
                >
                  <p className="font-medium text-sm truncate">{subject?.name || 'Lesson'}</p>
                  <p className="text-xs opacity-80">
                    {lesson.startTime} - {lesson.endTime}
                  </p>
                  {lesson.location && <p className="text-xs opacity-80">{lesson.location}</p>}
                </div>
              );
            })}

            {/* Positioned events */}
            {dayEvents.map((event) => {
              const startMinutes = getMinutesFromMidnight(event.startAt);
              const durationMinutes = getEventDurationMinutes(event.startAt, event.endAt);
              const topPx = (startMinutes / 60) * HOUR_HEIGHT;
              const heightPx = Math.max(40, (durationMinutes / 60) * HOUR_HEIGHT);

              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={cn(
                    "absolute left-1 right-1 px-3 py-1 rounded text-left overflow-hidden",
                    EVENT_TYPE_STYLES[event.type],
                    "hover:opacity-90 transition-opacity"
                  )}
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    minHeight: "40px",
                  }}
                >
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  <p className="text-xs opacity-80">
                    {formatTime(event.startAt)}
                    {event.endAt && ` - ${formatTime(event.endAt)}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventsList({
  events,
  subjects,
  selectedDate,
  onEventClick,
}: {
  events: CalendarEvent[];
  subjects: Subject[];
  selectedDate: Date | null;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => isSameDay(e.startAt, selectedDate));
  }, [events, selectedDate]);

  return (
    <div className="w-80 border-l border-border p-4">
      <h2 className="font-semibold mb-4">
        {selectedDate
          ? `${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
          : "Select a date"}
      </h2>
      {!selectedDate ? (
        <p className="text-sm text-muted-foreground">Select a date to view events</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events on this date</p>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event) => {
            const subject = event.subjectId ? subjectMap.get(event.subjectId) : null;
            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-l-4 transition-colors hover:bg-muted",
                  event.type === "exam" && "border-l-red-500 bg-red-500/10",
                  event.type === "assignment" && "border-l-blue-500 bg-blue-500/10",
                  event.type === "project" && "border-l-purple-500 bg-purple-500/10",
                  event.type === "class" && "border-l-green-500 bg-green-500/10",
                  event.type === "personal" && "border-l-gray-500 bg-gray-500/10"
                )}
              >
                <p className="text-xs uppercase text-muted-foreground">{event.type}</p>
                <p className="font-medium text-sm">{event.title}</p>
                {subject && <p className="text-xs text-muted-foreground">{subject.name}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(event.startAt)}
                  {event.endAt && ` - ${formatTime(event.endAt)}`}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window === "undefined") return [];
    return calendarService.list();
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (typeof window === "undefined") return [];
    return subjectService.list();
  });

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    if (typeof window === "undefined") return [];
    return lessonService.list();
  });
  const [showCountryDialog, setShowCountryDialog] = useState(() => {
    if (typeof window === "undefined") return false;
    return !storage.get<boolean>(STORAGE_KEYS.COUNTRY_CONFIGURED, false);
  });
  const [selectedCountry, setSelectedCountry] = useState(() => {
    if (typeof window === "undefined") return "US";
    const settings = settingsService.getSettings();
    return settings.country || "US";
  });

  // Fetch holidays on mount
  useEffect(() => {
    const loadHolidays = async () => {
      const settings = settingsService.getSettings();
      console.log('[Calendar] Loading holidays for country:', settings.country);
      try {
        // Use getHolidays which handles caching
        const fetchedHolidays = await holidayService.getHolidays(settings.country);
        console.log('[Calendar] Loaded holidays:', fetchedHolidays.length);
        setHolidays(fetchedHolidays);
      } catch (error) {
        console.error("[Calendar] Failed to load holidays:", error);
      }
    };

    loadHolidays();
  }, []);

  // Handle country selection
  const handleCountryConfirm = async () => {
    settingsService.updateSettings({ country: selectedCountry });
    storage.set(STORAGE_KEYS.COUNTRY_CONFIGURED, true);
    setShowCountryDialog(false);
    toast.success(`Country set to ${holidayService.SUPPORTED_COUNTRIES.find((c: { code: string; name: string }) => c.code === selectedCountry)?.name || selectedCountry}`);
    
    // Reload holidays for the selected country
    try {
      const fetchedHolidays = await holidayService.getHolidays(selectedCountry, true);
      setHolidays(fetchedHolidays);
    } catch (error) {
      console.error("[Calendar] Failed to load holidays:", error);
    }
  };

  const refreshData = () => {
    setEvents(calendarService.list());
    setSubjects(subjectService.list());
    setLessons(lessonService.list());
  };

  const handlePrevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getHeaderTitle = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    return getMonthName(currentDate);
  };

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setIsFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = (formData: EventFormData) => {
    if (editingEvent) {
      calendarService.update(editingEvent.id, formData);
      toast.success("Event updated");
    } else {
      calendarService.create(formData);
      toast.success("Event created");
    }
    setIsFormOpen(false);
    refreshData();
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      calendarService.remove(editingEvent.id);
      toast.success("Event deleted");
      setIsFormOpen(false);
      refreshData();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={() => setIsLessonDialogOpen(true)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Lesson Plan
          </Button>
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/*Calendar */}
      <Card className="flex-1 p-4 flex overflow-hidden">
        {viewMode === "month" && (
          <>
            <MonthCalendar
              currentDate={currentDate}
              events={events}
              holidays={holidays}
              lessons={lessons}
              subjects={subjects}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <EventsList
              events={events}
              subjects={subjects}
              selectedDate={selectedDate}
              onEventClick={handleEventClick}
            />
          </>
        )}
        {viewMode === "week" && (
          <WeekCalendar
            currentDate={currentDate}
            events={events}
            holidays={holidays}
            lessons={lessons}
            subjects={subjects}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onEventClick={handleEventClick}
          />
        )}
        {viewMode === "day" && (
          <DayCalendar
            currentDate={currentDate}
            events={events}
            holidays={holidays}
            lessons={lessons}
            subjects={subjects}
            onEventClick={handleEventClick}
          />
        )}
      </Card>

      {/* Event Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          <EventForm
            event={editingEvent}
            subjects={subjects}
            selectedDate={selectedDate ?? new Date()}
            onSave={handleSaveEvent}
            onCancel={() => setIsFormOpen(false)}
          />
          {editingEvent && (
            <div className="pt-4 border-t">
              <Button variant="destructive" className="w-full" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lesson Plan Dialog */}
      <LessonPlanDialog
        isOpen={isLessonDialogOpen}
        onClose={() => setIsLessonDialogOpen(false)}
        onLessonsChanged={refreshData}
      />

      {/* Country Selection Dialog */}
      <Dialog open={showCountryDialog} onOpenChange={setShowCountryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Your Country</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your country to display public holidays on your calendar.
          </p>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-75">
              {holidayService.SUPPORTED_COUNTRIES.map((country: { code: string; name: string }) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter className="mt-4">
            <Button onClick={handleCountryConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
