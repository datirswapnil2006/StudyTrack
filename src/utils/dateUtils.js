// Asia/Kolkata Date and Time Utilities

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date string 'YYYY-MM-DD' in Asia/Kolkata timezone
 */
export function getKolkataDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

/**
 * Format a 'YYYY-MM-DD' string to readable format e.g. "Wed, Oct 22, 2026"
 */
export function formatReadableDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Format date for short display e.g. "22 Oct"
 */
export function formatShortDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Calculate duration in minutes between 'HH:mm' and 'HH:mm'
 * Handles spans_midnight (e.g., 22:00 to 00:00 or 23:00 to 01:00)
 */
export function calculateDurationMinutes(startTime, endTime, spansMidnight = false) {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (spansMidnight || endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diff = endMinutes - startMinutes;
  return diff >= 0 ? diff : 0;
}

/**
 * Format minutes into readable "Xh Ym" or "Xm"
 */
export function formatMinutesToHours(minutes = 0) {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Convert minutes to decimal hours with 1 decimal place (e.g. 2.5h)
 */
export function minutesToDecimalHours(minutes = 0) {
  if (!minutes || minutes <= 0) return 0;
  return parseFloat((minutes / 60).toFixed(1));
}

/**
 * Compute reporting date ranges based on Asia/Kolkata
 */
export function getReportRange(type = 'weekly', baseDate = new Date()) {
  const todayStr = getKolkataDateString(baseDate);
  const [year, month, day] = todayStr.split('-').map(Number);

  if (type === 'weekly') {
    // Last 7 calendar days including today
    const end = new Date(Date.UTC(year, month - 1, day));
    const start = new Date(Date.UTC(year, month - 1, day - 6));
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      label: 'Last 7 Days (Weekly)'
    };
  }

  if (type === '15-day') {
    // Last 15 calendar days including today
    const end = new Date(Date.UTC(year, month - 1, day));
    const start = new Date(Date.UTC(year, month - 1, day - 14));
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      label: 'Last 15 Days'
    };
  }

  if (type === 'monthly') {
    // Current calendar month (1st of month to today or end of month)
    const start = new Date(Date.UTC(year, month - 1, 1));
    // Last day of this month
    const end = new Date(Date.UTC(year, month, 0));
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      label: `Current Month (${new Intl.DateTimeFormat('en-IN', { timeZone: TIMEZONE, month: 'long', year: 'numeric' }).format(start)})`
    };
  }

  return {
    startDate: todayStr,
    endDate: todayStr,
    label: 'Custom Range'
  };
}

/**
 * Generate an array of date strings between startDate and endDate inclusive
 */
export function getDatesBetween(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
