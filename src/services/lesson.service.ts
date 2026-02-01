// Lesson service - manages student lesson plan/schedule

import type { Lesson, DayOfWeek } from '@/domain/types';
import { generateId } from '@/lib/ids';
import { STORAGE_KEYS } from '@/domain/constants';
import { storage } from '@/data/storage';

export function list(): Lesson[] {
  return storage.get<Lesson[]>(STORAGE_KEYS.LESSONS, []);
}

export function getById(id: string): Lesson | null {
  const lessons = list();
  return lessons.find((l) => l.id === id) || null;
}

export function getBySubject(subjectId: string): Lesson[] {
  const lessons = list();
  return lessons.filter((l) => l.subjectId === subjectId);
}

export function getByDay(dayOfWeek: DayOfWeek): Lesson[] {
  const lessons = list();
  return lessons.filter((l) => l.dayOfWeek === dayOfWeek);
}

export function create(payload: {
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  location?: string;
  instructor?: string;
  recurrence?: 'weekly' | 'biweekly';
}): Lesson {
  const now = new Date().toISOString();
  const lesson: Lesson = {
    id: generateId(),
    subjectId: payload.subjectId,
    dayOfWeek: payload.dayOfWeek,
    startTime: payload.startTime,
    endTime: payload.endTime,
    location: payload.location,
    instructor: payload.instructor,
    recurrence: payload.recurrence || 'weekly',
    createdAt: now,
    updatedAt: now,
  };

  const lessons = list();
  lessons.push(lesson);
  storage.set(STORAGE_KEYS.LESSONS, lessons);

  return lesson;
}

export function update(id: string, patch: Partial<Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
  const lessons = list();
  const index = lessons.findIndex((l) => l.id === id);
  if (index === -1) return false;

  lessons[index] = {
    ...lessons[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  storage.set(STORAGE_KEYS.LESSONS, lessons);
  return true;
}

export function remove(id: string): boolean {
  const lessons = list();
  const filtered = lessons.filter((l) => l.id !== id);
  if (filtered.length === lessons.length) return false;

  storage.set(STORAGE_KEYS.LESSONS, filtered);
  return true;
}

export function removeBySubject(subjectId: string): void {
  const lessons = list();
  const filtered = lessons.filter((l) => l.subjectId !== subjectId);
  storage.set(STORAGE_KEYS.LESSONS, filtered);
}

// Generate calendar events from lesson plan for a specific week
export function generateEventsForWeek(weekStart: Date): Array<{
  lesson: Lesson;
  date: Date;
  startAt: string;
  endAt: string;
}> {
  const lessons = list();
  const result: Array<{ lesson: Lesson; date: Date; startAt: string; endAt: string }> = [];

  const dayOfWeekMap: Record<DayOfWeek, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    const dayOfWeek = currentDate.getDay();

    const dayLessons = lessons.filter((lesson) => dayOfWeekMap[lesson.dayOfWeek] === dayOfWeek);

    for (const lesson of dayLessons) {
      const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
      const [endHour, endMinute] = lesson.endTime.split(':').map(Number);

      const startDate = new Date(currentDate);
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(currentDate);
      endDate.setHours(endHour, endMinute, 0, 0);

      result.push({
        lesson,
        date: currentDate,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
      });
    }
  }

  return result;
}
