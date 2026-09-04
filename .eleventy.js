const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// Events store one field, event_start, via Decap's "datetime" widget (format:
// "YYYY-MM-DD[T]HH:mm", no timezone offset — see admin/config.yml). YAML front
// matter can hand that back to us as either a plain string, or a native JS Date
// (YAML auto-casts unquoted ISO-looking scalars, and — since there's no offset —
// js-yaml parses it as UTC, so reading it back with the UTC getters recovers the
// exact wall-clock numbers that were typed in, with no timezone math involved).
// Normalize both shapes here so every filter/sort works regardless of which we get.
function toParts(eventStart) {
  if (eventStart instanceof Date) {
    return {
      y: eventStart.getUTCFullYear(),
      m: eventStart.getUTCMonth() + 1,
      d: eventStart.getUTCDate(),
      h: eventStart.getUTCHours(),
      mi: eventStart.getUTCMinutes(),
    };
  }
  const [datePart, timePart] = String(eventStart).split("T");
  const [y, m, d] = datePart.split("-").map((n) => parseInt(n, 10));
  const [h, mi] = (timePart || "0:0").split(":").map((n) => parseInt(n, 10));
  return { y, m, d, h: h || 0, mi: mi || 0 };
}

function toSortableString(eventStart) {
  const { y, m, d, h, mi } = toParts(eventStart);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

// Reliable weekday-of-date: builds the date via Date.UTC and reads it back with
// the UTC getter, so it never drifts based on the machine's local timezone.
function weekdayName(y, m, d) {
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

function formatTime12h(h, mi) {
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(mi).padStart(2, "0")} ${period}`;
}

// "Now" as wall-clock digits in the club's own timezone (US Eastern — every
// event_start is typed as a local Eastern kickoff/start time with no offset).
// Using Intl here, rather than the server's own local time, keeps the
// comparison correct no matter what timezone the build machine runs in.
// Newsletters store one field, issue_date, via Decap's plain "date" widget
// (format: "YYYY-MM-DD", no time component). Same Date-vs-string ambiguity as
// event_start above, so normalize the same way.
function toDateParts(isoDate) {
  if (isoDate instanceof Date) {
    return { y: isoDate.getUTCFullYear(), m: isoDate.getUTCMonth() + 1, d: isoDate.getUTCDate() };
  }
  const [y, m, d] = String(isoDate).split("-").map((n) => parseInt(n, 10));
  return { y, m, d };
}

function nowSortableStringEastern() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  // Midnight can format as "24" under hour12:false — normalize to "00".
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

module.exports = function (eleventyConfig) {
  // Static passthroughs
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/files");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  // Collections
  eleventyConfig.addCollection("events", function (collectionApi) {
    // Auto-hide events once their start time has passed, so the homepage
    // timeline, next-event badge, and sponsor page only ever show what's
    // still upcoming.
    const now = nowSortableStringEastern();
    return collectionApi
      .getFilteredByGlob("src/events/*.md")
      .filter((event) => toSortableString(event.data.event_start) >= now)
      .sort((a, b) => {
        return toSortableString(a.data.event_start).localeCompare(toSortableString(b.data.event_start));
      });
  });

  // Newest issue first — unlike events, nothing is ever filtered out; older
  // issues just render smaller, in the archive section of newsletters.njk.
  eleventyConfig.addCollection("newsletters", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/newsletters/*.md")
      .sort((a, b) => new Date(b.data.issue_date) - new Date(a.data.issue_date));
  });

  // Filters — all tolerant of event_start being a String or a Date.
  eleventyConfig.addFilter("monthShort", (eventStart) => {
    return MONTHS[toParts(eventStart).m - 1] || "";
  });
  eleventyConfig.addFilter("dayNum", (eventStart) => {
    return toParts(eventStart).d || "";
  });
  // "Saturday, 3:00 PM" — replaces the old hand-typed time_label field.
  eleventyConfig.addFilter("dayTimeLabel", (eventStart) => {
    const { y, m, d, h, mi } = toParts(eventStart);
    return `${weekdayName(y, m, d)}, ${formatTime12h(h, mi)}`;
  });
  // "YYYY-MM-DDTHH:mm:ss" for the homepage countdown badge's data attribute.
  eleventyConfig.addFilter("isoDateTime", (eventStart) => {
    return toSortableString(eventStart) + ":00";
  });
  // "September 2026" — used on the newsletters page.
  eleventyConfig.addFilter("monthYear", (isoDate) => {
    const { y, m } = toDateParts(isoDate);
    return `${MONTHS_FULL[m - 1] || ""} ${y}`;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
