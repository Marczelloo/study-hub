import { localEventRepository, localSubjectRepository } from "@/data/local";
import type { CalendarEvent, Subject } from "@/domain/types";
import { isSameDay, getDaysUntil } from "@/lib/dates";

export const calendarService = {
  list(): CalendarEvent[] {
    return localEventRepository.list();
  },

  getById(id: string): CalendarEvent | null {
    return localEventRepository.getById(id);
  },

  create(payload: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">): CalendarEvent {
    return localEventRepository.create(payload);
  },

  update(id: string, patch: Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>): CalendarEvent | null {
    return localEventRepository.update(id, patch);
  },

  remove(id: string): boolean {
    return localEventRepository.remove(id);
  },

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.list().filter((event) => isSameDay(event.startAt, date));
  },

  getUpcomingEvents(days: number = 14): CalendarEvent[] {
    return this.list()
      .filter((event) => {
        const daysUntil = getDaysUntil(event.startAt);
        return daysUntil >= 0 && daysUntil <= days;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  },

  getUpcomingExams(): CalendarEvent[] {
    return this.getUpcomingEvents(30).filter((event) => event.type === "exam");
  },

  getEventsForMonth(year: number, month: number): CalendarEvent[] {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    return this.list().filter((event) => {
      const eventDate = new Date(event.startAt);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  },

  getSubjects(): Subject[] {
    return localSubjectRepository.list();
  },
};
