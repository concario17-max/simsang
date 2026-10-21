                                                                 
import { normalizeNewlines } from './textUtils.mjs';

/**
 * Removes stray spaces between adjacent digits.
 */
export function cleanNumberSpaces(s        )         {
  return s.replace(/(\d)\s+(?=\d)/g, '$1');
}

/**
 * Parses a month/day range from noisy source text.
 */
export function parseDateSpec(specRaw        )                  {
  const spec = cleanNumberSpaces(String(specRaw || '').trim())
    .replace(/[^\d]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const nums = spec.match(/\d{1,2}/g)?.map(Number) ?? [];

  if (nums.length === 2) {
    return { start: { m: nums[0], d: nums[1] }, end: { m: nums[0], d: nums[1] } };
  }

  if (nums.length === 3) {
    return { start: { m: nums[0], d: nums[1] }, end: { m: nums[0], d: nums[2] } };
  }

  if (nums.length >= 4) {
    return { start: { m: nums[0], d: nums[1] }, end: { m: nums[2], d: nums[3] } };
  }

  return null;
}

/**
 * Converts month/day into an ordinal day number for a non-leap year.
 */
export function mdToOrdinal(m        , d        )         {
  const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let ord = 0;
  for (let i = 1; i < m; i += 1) ord += dim[i - 1];
  return ord + d;
}

/**
 * Checks whether a target month/day falls inside the provided range.
 */
export function isInRangeMD(targetM        , targetD        , range          )          {
  const t = mdToOrdinal(targetM, targetD);
  const s = mdToOrdinal(range.start.m, range.start.d);
  const e = mdToOrdinal(range.end.m, range.end.d);

  if (s <= e) return t >= s && t <= e;
  return t >= s || t <= e;
}

/**
 * Extracts a display label like "52주 · 1주" from a group heading.
 */
export function extractWeeksLabel(titleLine        )                                                        {
  const line = String(titleLine || '').trim();
  const matchedPair = line.match(/Weeks\s+(\d{1,2})\s+and\s+(\d{1,2})/i);

  if (matchedPair) {
    const [, first, second] = matchedPair;
    return { label: `${first}주 · ${second}주`, a: Number(first), b: Number(second) };
  }

  const matchedSingle = line.match(/Weeks\s+(\d{1,2})/i);
  if (matchedSingle) {
    const [, week] = matchedSingle;
    return { label: `${week}주`, a: Number(week), b: null };
  }

  return { label: line || 'soul calendar info unavailable', a: null, b: null };
}

const isGroupTitle = (line        ) => /CoTS\s+Verses\s+for\s+Weeks/i.test(String(line || '').trim());

const isDateLine = (line        ) => {
  const trimmed = String(line || '').trim();
  if (!trimmed.includes('(') || !trimmed.includes(')')) return false;
  const inside = trimmed.slice(trimmed.indexOf('(') + 1, trimmed.lastIndexOf(')'));
  return /\d/.test(inside);
};

/**
 * Parses all soul-calendar groups from the raw source text.
 */
export function parseSoulGroups(text        )              {
  const normalized = normalizeNewlines(text);
  const lines = normalized.split('\n');
  const titleIdxs = lines.reduce((acc          , line, i) => {
    if (isGroupTitle(line)) acc.push(i);
    return acc;
  }, []);

  return titleIdxs.map((start, i) => {
    const end = i + 1 < titleIdxs.length ? titleIdxs[i + 1] : lines.length;
    return parseSingleGroup(lines, start, end);
  });
}

function parseSingleGroup(lines          , start        , end        )            {
  const titleLine = lines[start].trim();
  const block = lines.slice(start, end).join('\n').trim();
  const ranges = lines
    .slice(start, end)
    .filter(isDateLine)
    .map((line) => {
      const trimmed = line.trim();
      return parseDateSpec(trimmed.slice(trimmed.indexOf('(') + 1, trimmed.lastIndexOf(')')));
    })
    .filter((range)                    => range !== null);

  const label = extractWeeksLabel(titleLine);
  return { titleLine, weeksLabel: label.label, weekA: label.a, weekB: label.b, ranges, block };
}

/**
 * Splits a group block into per-week sections.
 */
export function parseWeekSectionsFromGroupBlock(block        )                {
  const normalized = normalizeNewlines(block);
  const lines = normalized.split('\n');
  const headerRe = /^\s*(\d{1,2})[^\d(]*\(([^)]+)\)(.*)$/;

  const heads = lines.reduce((acc                                                              , line, i) => {
    const match = line.match(headerRe);
    if (match) acc.push({ idx: i, week: Number(match[1]), range: match[2].trim(), tail: match[3].trim() });
    return acc;
  }, []);

  if (heads.length === 0) return [];

  return heads.map((head, index) => {
    const end = index + 1 < heads.length ? heads[index + 1].idx : lines.length;
    const bodyText = lines
      .slice(head.idx + 1, end)
      .join('\n')
      .replace(/^\s*\n+/, '')
      .replace(/\n+\s*$/, '')
      .trim();

    const text = head.tail ? `${head.tail}\n${bodyText}`.trim() : bodyText;
    return { week: head.week, range: head.range, text };
  });
}

export function formatSoulDateRange(range        )         {
  const normalized = range.replace(/\s+/g, ' ').trim().replace(/[()]/g, '');
  const match = normalized.match(/(\d{1,2})\D+(\d{1,2})\D*-\D*(\d{1,2})(?:\D+(\d{1,2}))?/u);

  if (!match) {
    return normalized.replace(/\s*-\s*/g, '-');
  }

  const [, startMonth, startDay, endMonth, endDay] = match;
  if (endDay) {
    return `${startMonth}월 ${startDay}일-${endMonth}월 ${endDay}일`;
  }

  return `${startMonth}월 ${startDay}일-${endMonth}일`;
}

function normalizeWeeksLabel(label        )         {
  const normalized = label.replace(/\s+/g, ' ').trim();
  const segments = normalized
    .split(/\s*\/\s*/u)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return normalized;
  }

  return segments
    .map((segment) => {
      const match = segment.match(/(\d{1,2})\D+(.*)/u);
      if (!match) {
        return segment;
      }

      const [, week, rawRange] = match;
      return `${Number(week)}주(${formatSoulDateRange(rawRange)})`;
    })
    .join(' · ');
}

function formatWeekRange(week        , range        )         {
  return `${week}주(${formatSoulDateRange(range)})`;
}

export function formatWeeksLabel(hitSoulGroup                       , soulSections               )         {
  if (soulSections.length > 0) {
    return soulSections.map((section) => formatWeekRange(section.week, section.range)).join(' · ');
  }

  if (hitSoulGroup?.weeksLabel) {
    return normalizeWeeksLabel(hitSoulGroup.weeksLabel);
  }

  return '';
}
