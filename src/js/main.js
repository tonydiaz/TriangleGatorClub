(function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".site-nav--mobile");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Event tab filtering (home page timeline)
  var tabs = document.querySelectorAll(".events-tab");
  var items = document.querySelectorAll(".timeline-item");
  function applyFilter(filter) {
    var visible = [];
    items.forEach(function (item) {
      var show = filter === "all" || item.getAttribute("data-tab") === filter;
      item.style.display = show ? "" : "none";
      item.classList.remove("is-last-visible");
      if (show) visible.push(item);
    });
    if (visible.length) visible[visible.length - 1].classList.add("is-last-visible");
  }
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      applyFilter(tab.getAttribute("data-filter"));
    });
  });
  if (items.length) applyFilter("all");

  // Countdown to next event (data-countdown is a full "YYYY-MM-DDTHH:mm:ss",
  // parsed here as local time — i.e. the event's wall-clock start time).
  var countdownEl = document.querySelector("[data-countdown]");
  if (countdownEl) {
    var target = new Date(countdownEl.getAttribute("data-countdown"));
    function tick() {
      var now = new Date();
      var diff = target - now;
      if (diff <= 0) {
        countdownEl.textContent = "Happening now";
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      countdownEl.textContent = days + "d " + String(hours).padStart(2, "0") + ":" +
        String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    }
    tick();
    setInterval(tick, 1000);
  }

  // Expand/collapse long event descriptions. CSS clamps every description to
  // 8 lines by default; here we detect which ones actually got clipped and
  // give those a "Read more" toggle (short descriptions get no button at all).
  var descs = document.querySelectorAll(".timeline-card__desc, .event-card__desc");
  descs.forEach(function (desc) {
    if (desc.scrollHeight <= desc.clientHeight + 1) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "desc-toggle is-visible";
    btn.textContent = "Read more";
    btn.addEventListener("click", function () {
      var expanded = desc.classList.toggle("is-expanded");
      btn.textContent = expanded ? "Show less" : "Read more";
    });
    desc.insertAdjacentElement("afterend", btn);
  });
})();
