const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getTaipeiTargetDate(referenceDate = new Date()) {
  const current = new Date(referenceDate);
  const yesterday = new Date(current.getTime() - ONE_DAY_MS);
  return yesterday;
}

export function formatDateInTimeZone(date, locale = "zh-TW", options = {}, timeZone = "Asia/Taipei") {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    ...options
  }).format(date);
}

export function formatTargetDateLabel(date, locale = "zh-TW", timeZone = "Asia/Taipei") {
  return formatDateInTimeZone(
    date,
    locale,
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    },
    timeZone
  );
}

export function toDateKey(date, timeZone = "Asia/Taipei") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function isSameTaipeiDate(dateLike, dateKey, timeZone = "Asia/Taipei") {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return toDateKey(date, timeZone) === dateKey;
}

export function formatPublishedAt(dateLike, locale = "zh-TW", timeZone = "Asia/Taipei") {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return "時間未提供";
  }
  return formatDateInTimeZone(
    date,
    locale,
    {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    },
    timeZone
  );
}
