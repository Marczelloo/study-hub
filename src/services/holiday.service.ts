// Holiday service - fetches and caches public holidays

import type { Holiday } from '@/domain/types';
import { STORAGE_KEYS } from '@/domain/constants';
import { storage } from '@/data/storage';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Using Nager.Date public API - free, no auth required
// https://date.nager.at/
const API_BASE_URL = 'https://date.nager.at/api/v3';

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

// Universal observance days (not country-specific, celebrated globally)
// These are added to any country's holiday list
function getObservanceDays(year: number): Holiday[] {
  return [
    { date: `${year}-02-14`, name: "Valentine's Day", localName: "Valentine's Day", countryCode: '', fixed: true, global: true, types: ['Observance'] },
    { date: `${year}-03-08`, name: "International Women's Day", localName: "International Women's Day", countryCode: '', fixed: true, global: true, types: ['Observance'] },
    { date: `${year}-04-01`, name: "April Fools' Day", localName: "April Fools' Day", countryCode: '', fixed: true, global: true, types: ['Observance'] },
    { date: `${year}-04-22`, name: "Earth Day", localName: "Earth Day", countryCode: '', fixed: true, global: true, types: ['Observance'] },
    { date: `${year}-05-01`, name: "International Workers' Day", localName: "Labour Day", countryCode: '', fixed: true, global: true, types: ['Observance'] },
    { date: `${year}-06-21`, name: "Summer Solstice", localName: "Summer Solstice", countryCode: '', fixed: false, global: true, types: ['Observance'] },
    { date: `${year}-10-31`, name: "Halloween", localName: "Halloween", countryCode: '', fixed: true, global: true, types: ['Observance'] },
    { date: `${year}-12-31`, name: "New Year's Eve", localName: "New Year's Eve", countryCode: '', fixed: true, global: true, types: ['Observance'] },
  ];
}

// Check if a holiday type indicates a day off (no work/school)
export function isDayOff(holiday: Holiday): boolean {
  // These types typically mean a day off from work/school
  const dayOffTypes = ['Public', 'Bank', 'School'];
  return holiday.types.some(t => dayOffTypes.includes(t));
}

// Check if a specific date is a day off
export function isDateDayOff(dateStr: string): boolean {
  const holiday = getHolidayForDate(dateStr);
  return holiday ? isDayOff(holiday) : false;
}

export async function fetchHolidays(countryCode: string, year: number): Promise<Holiday[]> {
  // Try fetching for the requested year, then fall back to recent years
  const yearsToTry = [year, 2025, 2024];
  
  for (const tryYear of yearsToTry) {
    try {
      const url = `${API_BASE_URL}/PublicHolidays/${tryYear}/${countryCode}`;
      console.log('[HolidayService] Fetching:', url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data: NagerHoliday[] = await response.json();
        console.log('[HolidayService] Fetched', data.length, 'holidays for', tryYear);
        
        // Map to our Holiday type and adjust year if needed
        const apiHolidays: Holiday[] = data.map((h) => ({
          date: tryYear !== year ? h.date.replace(String(tryYear), String(year)) : h.date,
          name: h.name,
          localName: h.localName,
          countryCode: h.countryCode,
          fixed: h.fixed,
          global: h.global,
          types: h.types,
        }));
        
        // Add observance days that aren't already in the list
        const observances = getObservanceDays(year);
        const existingDates = new Set(apiHolidays.map(h => h.date));
        const uniqueObservances = observances.filter(o => !existingDates.has(o.date));
        
        const allHolidays = [...apiHolidays, ...uniqueObservances].sort((a, b) => a.date.localeCompare(b.date));
        
        // Cache the holidays
        cacheHolidays(allHolidays);
        
        return allHolidays;
      }
      
      // If 404, try next year in the list
      if (response.status === 404) {
        console.log('[HolidayService] 404 for year', tryYear, '- trying fallback');
        continue;
      }
      
      console.error('[HolidayService] Failed:', response.status);
    } catch (error) {
      console.error('[HolidayService] Error:', error);
    }
  }
  
  // Return just observance days if API fails
  console.log('[HolidayService] API failed, returning observance days only');
  const observances = getObservanceDays(year);
  cacheHolidays(observances);
  return observances;
}

function cacheHolidays(holidays: Holiday[]): void {
  storage.set(STORAGE_KEYS.HOLIDAYS, holidays);
  storage.set(STORAGE_KEYS.HOLIDAYS_LAST_FETCH, Date.now());
}

export function getCachedHolidays(): Holiday[] {
  return storage.get<Holiday[]>(STORAGE_KEYS.HOLIDAYS, []);
}

export function getLastFetchTime(): number | null {
  return storage.get<number | null>(STORAGE_KEYS.HOLIDAYS_LAST_FETCH, null);
}

export function shouldRefetchHolidays(): boolean {
  const lastFetch = getLastFetchTime();
  if (!lastFetch) return true;
  return Date.now() - lastFetch > CACHE_DURATION_MS;
}

export async function getHolidays(countryCode: string, forceRefresh = false): Promise<Holiday[]> {
  // Check cache first
  if (!forceRefresh && !shouldRefetchHolidays()) {
    const cached = getCachedHolidays();
    if (cached.length > 0) {
      console.log('[HolidayService] Using cached holidays:', cached.length);
      return cached;
    }
  }

  const currentYear = new Date().getFullYear();
  return fetchHolidays(countryCode, currentYear);
}

// Get holidays for a specific date (YYYY-MM-DD format)
export function getHolidayForDate(dateStr: string): Holiday | undefined {
  const holidays = getCachedHolidays();
  return holidays.find((h) => h.date === dateStr);
}

// Check if a date is a holiday
export function isHoliday(dateStr: string): boolean {
  return !!getHolidayForDate(dateStr);
}

// Available country codes
export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NZ', name: 'New Zealand' },
] as const;
