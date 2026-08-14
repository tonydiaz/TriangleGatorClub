const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// YAML front matter can hand us date_iso as either a plain string ("2026-08-29")
// or a native JS Date (YAML auto-casts unquoted ISO-looking scalars — which is
// what Decap CMS's date widget writes back on save). Normalize both cases here
// so sorting/filters never break regardless of which shape we get.
function toParts(isoDate) {
  if (isoDate instanceof Date) {
    return {
      y: isoDate.getUTCFullYear(),
      m: isoDate.getUTCMonth() + 1,
      d: isoDate.getUTCDate(),
    };
  }
  const [y, m, d] = String(isoDate).split("-").map((n) => parseInt(n, 10));
  return { y, m, d };
}

function toSortableString(isoDate) {
  const { y, m, d } = toParts(isoDate);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

module.exports = function (eleventyConfig) {
  // Static passthroughs
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/js");

  // Collections
  eleventyConfig.addCollection("events", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/events/*.md").sort((a, b) => {
      return toSortableString(a.data.date_iso).localeCompare(toSortableString(b.data.date_iso));
    });
  });

  // Filters — all tolerant of date_iso being a String or a Date.
  eleventyConfig.addFilter("monthShort", (isoDate) => {
    return MONTHS[toParts(isoDate).m - 1] || "";
  });
  eleventyConfig.addFilter("dayNum", (isoDate) => {
    return toParts(isoDate).d || "";
  });
  eleventyConfig.addFilter("isoDate", (isoDate) => {
    return toSortableString(isoDate);
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
