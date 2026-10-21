/**
 * Converts a local year/month/day triple into a UTC date-only timestamp.
 */
export function toUtcDateOnly(y        , m        , d        )         {
  return Date.UTC(y, m - 1, d);
}

/**
 * Returns the cycle start date for the given year, defaulting to April 7.
 */
export function getCycleStartUtc(targetDate      , startMonth         = 4, startDay         = 7)         {
  const y = targetDate.getFullYear();
  const startThisYearUtc = toUtcDateOnly(y, startMonth, startDay);
  const targetUtc = toUtcDateOnly(y, targetDate.getMonth() + 1, targetDate.getDate());

  return targetUtc < startThisYearUtc
    ? toUtcDateOnly(y - 1, startMonth, startDay)
    : startThisYearUtc;
}

/**
 * True when a zero-based day index is inside the 365-day cycle window.
 */
export function inRange(dayIndex        )          {
  return dayIndex >= 0 && dayIndex < 365;
}

/**
 * Maps a date into the 1-indexed yao sequence.
 * Valid dates run from April 7 to April 1 of the following year and map to 25..384.
 * April 2 through April 6 intentionally return null.
 */
export function calcYaoNum(date      )                {
  const startUtc = getCycleStartUtc(date, 4, 7);
  const targetUtc = toUtcDateOnly(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const diffDays = Math.floor((targetUtc - startUtc) / 86400000);

  if (diffDays >= 0 && diffDays < 360) {
    return 25 + diffDays;
  }

  return null;
}

/**
 * Maps a yao number into a 1-indexed gua number.
 */
export function calcGuaNum(yaoNum               )                {
  if (yaoNum === null) return null;
  return Math.floor((yaoNum - 1) / 6) + 1;
}
