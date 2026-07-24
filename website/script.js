/* ==========================================================================
   ClockTime Converter — shared script
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  setFooterYear();
  setupNavToggle();
  setupWorldClock();
  setupUnitConverter();
  setupContactForm();
});

/* ---------- Footer year ---------- */
function setFooterYear() {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Mobile nav toggle ---------- */
function setupNavToggle() {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

/* ==========================================================================
   WORLD CLOCK
   ========================================================================== */

// A curated list of major cities mapped to IANA time zones.
var CITY_LIST = [
  { city: "New York", region: "United States", zone: "America/New_York" },
  { city: "Los Angeles", region: "United States", zone: "America/Los_Angeles" },
  { city: "Chicago", region: "United States", zone: "America/Chicago" },
  { city: "Toronto", region: "Canada", zone: "America/Toronto" },
  { city: "Mexico City", region: "Mexico", zone: "America/Mexico_City" },
  { city: "São Paulo", region: "Brazil", zone: "America/Sao_Paulo" },
  { city: "Buenos Aires", region: "Argentina", zone: "America/Argentina/Buenos_Aires" },
  { city: "London", region: "United Kingdom", zone: "Europe/London" },
  { city: "Dublin", region: "Ireland", zone: "Europe/Dublin" },
  { city: "Lisbon", region: "Portugal", zone: "Europe/Lisbon" },
  { city: "Paris", region: "France", zone: "Europe/Paris" },
  { city: "Madrid", region: "Spain", zone: "Europe/Madrid" },
  { city: "Berlin", region: "Germany", zone: "Europe/Berlin" },
  { city: "Rome", region: "Italy", zone: "Europe/Rome" },
  { city: "Amsterdam", region: "Netherlands", zone: "Europe/Amsterdam" },
  { city: "Zurich", region: "Switzerland", zone: "Europe/Zurich" },
  { city: "Stockholm", region: "Sweden", zone: "Europe/Stockholm" },
  { city: "Athens", region: "Greece", zone: "Europe/Athens" },
  { city: "Istanbul", region: "Turkey", zone: "Europe/Istanbul" },
  { city: "Moscow", region: "Russia", zone: "Europe/Moscow" },
  { city: "Cairo", region: "Egypt", zone: "Africa/Cairo" },
  { city: "Lagos", region: "Nigeria", zone: "Africa/Lagos" },
  { city: "Nairobi", region: "Kenya", zone: "Africa/Nairobi" },
  { city: "Johannesburg", region: "South Africa", zone: "Africa/Johannesburg" },
  { city: "Dubai", region: "UAE", zone: "Asia/Dubai" },
  { city: "Riyadh", region: "Saudi Arabia", zone: "Asia/Riyadh" },
  { city: "Tehran", region: "Iran", zone: "Asia/Tehran" },
  { city: "Karachi", region: "Pakistan", zone: "Asia/Karachi" },
  { city: "Mumbai", region: "India", zone: "Asia/Kolkata" },
  { city: "Delhi", region: "India", zone: "Asia/Kolkata" },
  { city: "Dhaka", region: "Bangladesh", zone: "Asia/Dhaka" },
  { city: "Bangkok", region: "Thailand", zone: "Asia/Bangkok" },
  { city: "Jakarta", region: "Indonesia", zone: "Asia/Jakarta" },
  { city: "Singapore", region: "Singapore", zone: "Asia/Singapore" },
  { city: "Hong Kong", region: "Hong Kong", zone: "Asia/Hong_Kong" },
  { city: "Shanghai", region: "China", zone: "Asia/Shanghai" },
  { city: "Beijing", region: "China", zone: "Asia/Shanghai" },
  { city: "Taipei", region: "Taiwan", zone: "Asia/Taipei" },
  { city: "Seoul", region: "South Korea", zone: "Asia/Seoul" },
  { city: "Tokyo", region: "Japan", zone: "Asia/Tokyo" },
  { city: "Manila", region: "Philippines", zone: "Asia/Manila" },
  { city: "Perth", region: "Australia", zone: "Australia/Perth" },
  { city: "Adelaide", region: "Australia", zone: "Australia/Adelaide" },
  { city: "Sydney", region: "Australia", zone: "Australia/Sydney" },
  { city: "Melbourne", region: "Australia", zone: "Australia/Melbourne" },
  { city: "Brisbane", region: "Australia", zone: "Australia/Brisbane" },
  { city: "Auckland", region: "New Zealand", zone: "Pacific/Auckland" },
  { city: "Honolulu", region: "United States", zone: "Pacific/Honolulu" },
  { city: "Anchorage", region: "United States", zone: "America/Anchorage" },
  { city: "Denver", region: "United States", zone: "America/Denver" },
  { city: "Vancouver", region: "Canada", zone: "America/Vancouver" },
  { city: "Reykjavik", region: "Iceland", zone: "Atlantic/Reykjavik" },
  { city: "Helsinki", region: "Finland", zone: "Europe/Helsinki" },
  { city: "Warsaw", region: "Poland", zone: "Europe/Warsaw" },
  { city: "Vienna", region: "Austria", zone: "Europe/Vienna" },
  { city: "Kyiv", region: "Ukraine", zone: "Europe/Kyiv" },
  { city: "Tel Aviv", region: "Israel", zone: "Asia/Jerusalem" },
  { city: "Ho Chi Minh City", region: "Vietnam", zone: "Asia/Ho_Chi_Minh" },
  { city: "Kuala Lumpur", region: "Malaysia", zone: "Asia/Kuala_Lumpur" },
  { city: "UTC", region: "Coordinated Universal Time", zone: "UTC" }
];

var use24Hour = false;
var activeZones = []; // array of { city, region, zone, isLocal }
var clockInterval = null;

function setupWorldClock() {
  var zoneSelect = document.getElementById("zoneSelect");
  if (!zoneSelect) return; // not on this page

  var addBtn = document.getElementById("addZoneBtn");
  var formatBtn = document.getElementById("use24hBtn");

  populateZoneSelect(zoneSelect);
  initializeDefaultZones();

  addBtn.addEventListener("click", function () {
    var selected = zoneSelect.value;
    var option = CITY_LIST.find(function (c) {
      return c.zone === selected;
    });
    if (!option) return;
    if (activeZones.length >= 9) {
      alert("You can compare up to 8 cities alongside your local time.");
      return;
    }
    if (activeZones.some(function (z) { return z.zone === option.zone && z.city === option.city; })) {
      return; // already added
    }
    activeZones.push({ city: option.city, region: option.region, zone: option.zone, isLocal: false });
    renderZones();
  });

  formatBtn.addEventListener("click", function () {
    use24Hour = !use24Hour;
    formatBtn.textContent = use24Hour ? "Switch to 12-hour" : "Switch to 24-hour";
    renderZones();
  });

  renderZones();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(renderZones, 1000);
}

function populateZoneSelect(select) {
  CITY_LIST.forEach(function (item) {
    var opt = document.createElement("option");
    opt.value = item.zone;
    opt.textContent = item.city + " — " + item.region;
    select.appendChild(opt);
  });
}

function initializeDefaultZones() {
  var localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  var localLabel = guessLocalLabel(localZone);

  activeZones = [
    { city: localLabel.city, region: localLabel.region, zone: localZone, isLocal: true }
  ];

  // Add a couple of sensible defaults that differ from the local zone.
  var defaults = ["Europe/London", "Asia/Tokyo", "America/New_York"];
  defaults.forEach(function (zone) {
    if (zone !== localZone && activeZones.length < 4) {
      var match = CITY_LIST.find(function (c) { return c.zone === zone; });
      if (match) {
        activeZones.push({ city: match.city, region: match.region, zone: match.zone, isLocal: false });
      }
    }
  });
}

function guessLocalLabel(zone) {
  var match = CITY_LIST.find(function (c) { return c.zone === zone; });
  if (match) return { city: match.city, region: match.region };
  var parts = zone.split("/");
  var name = parts[parts.length - 1].replace(/_/g, " ");
  return { city: name, region: "Your local time zone" };
}

function renderZones() {
  var grid = document.getElementById("zoneGrid");
  var tbody = document.getElementById("diffTableBody");
  if (!grid || !tbody) return;

  grid.innerHTML = "";
  tbody.innerHTML = "";

  var now = new Date();
  var localZone = activeZones.find(function (z) { return z.isLocal; });
  var localOffsetMinutes = localZone ? getOffsetMinutes(now, localZone.zone) : 0;

  activeZones.forEach(function (zoneInfo, index) {
    var card = document.createElement("div");
    card.className = "zone-card" + (zoneInfo.isLocal ? " local" : "");

    var timeStr = formatTime(now, zoneInfo.zone, use24Hour);
    var dateStr = formatDate(now, zoneInfo.zone);
    var offsetMinutes = getOffsetMinutes(now, zoneInfo.zone);
    var diffMinutes = offsetMinutes - localOffsetMinutes;

    var removeBtn = "";
    if (!zoneInfo.isLocal) {
      removeBtn = '<button class="zone-remove" data-index="' + index + '" aria-label="Remove city">✕</button>';
    }

    var offsetLabel = zoneInfo.isLocal ? "Your time" : formatDiffLabel(diffMinutes);
    var offsetClass = "";
    if (!zoneInfo.isLocal) {
      offsetClass = diffMinutes > 0 ? "ahead" : diffMinutes < 0 ? "behind" : "";
    }

    card.innerHTML =
      removeBtn +
      '<div class="zone-city">' + escapeHtml(zoneInfo.city) + (zoneInfo.isLocal ? " (You)" : "") + "</div>" +
      '<div class="zone-region">' + escapeHtml(zoneInfo.region) + "</div>" +
      '<div class="zone-time">' + timeStr + "</div>" +
      '<div class="zone-date">' + dateStr + "</div>" +
      '<span class="zone-offset ' + offsetClass + '">' + offsetLabel + "</span>";

    grid.appendChild(card);

    // Table row
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + escapeHtml(zoneInfo.city) + (zoneInfo.isLocal ? " (You)" : "") + "</td>" +
      "<td>" + escapeHtml(shortZoneLabel(zoneInfo.zone)) + "</td>" +
      "<td>" + timeStr + " · " + dateStr + "</td>" +
      "<td>" + (zoneInfo.isLocal ? "—" : formatDiffLabel(diffMinutes)) + "</td>";
    tbody.appendChild(tr);
  });

  // Attach remove handlers
  grid.querySelectorAll(".zone-remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = parseInt(btn.getAttribute("data-index"), 10);
      activeZones.splice(idx, 1);
      renderZones();
    });
  });
}

function formatTime(date, timeZone, is24h) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !is24h
    }).format(date);
  } catch (e) {
    return "--:--:--";
  }
}

function formatDate(date, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      weekday: "short",
      month: "short",
      day: "numeric"
    }).format(date);
  } catch (e) {
    return "";
  }
}

function shortZoneLabel(timeZone) {
  try {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      timeZoneName: "short"
    }).formatToParts(new Date());
    var tzPart = parts.find(function (p) { return p.type === "timeZoneName"; });
    return tzPart ? tzPart.value : timeZone;
  } catch (e) {
    return timeZone;
  }
}

// Compute the UTC offset (in minutes) for a given date in a given time zone.
function getOffsetMinutes(date, timeZone) {
  try {
    var dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    var parts = dtf.formatToParts(date);
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var asUTC = Date.UTC(
      parseInt(map.year, 10),
      parseInt(map.month, 10) - 1,
      parseInt(map.day, 10),
      parseInt(map.hour, 10),
      parseInt(map.minute, 10),
      parseInt(map.second, 10)
    );
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch (e) {
    return 0;
  }
}

function formatDiffLabel(diffMinutes) {
  if (diffMinutes === 0) return "Same time";
  var sign = diffMinutes > 0 ? "+" : "−";
  var abs = Math.abs(diffMinutes);
  var hours = Math.floor(abs / 60);
  var mins = abs % 60;
  var str = sign + hours + "h";
  if (mins > 0) str += " " + mins + "m";
  return str;
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ==========================================================================
   UNIT CONVERTER
   ========================================================================== */

var LENGTH_TO_METERS = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344
};

var WEIGHT_TO_GRAMS = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
  st: 6350.29318,
  t: 1000000
};

function setupUnitConverter() {
  var tabs = document.querySelectorAll(".tab-btn");
  if (!tabs.length) return; // not on this page

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      document.querySelectorAll(".converter-panel").forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      document.getElementById("panel-" + tab.dataset.panel).classList.add("active");
    });
  });

  // Length
  bindConverter({
    fromValueId: "lengthFromValue",
    fromUnitId: "lengthFromUnit",
    toUnitId: "lengthToUnit",
    toValueId: "lengthToValue",
    resultId: "lengthResult",
    convert: function (value, fromUnit, toUnit) {
      var meters = value * LENGTH_TO_METERS[fromUnit];
      return meters / LENGTH_TO_METERS[toUnit];
    },
    unitLabel: function (unit) { return LENGTH_LABELS[unit]; },
    sigFigs: 6
  });

  // Weight
  bindConverter({
    fromValueId: "weightFromValue",
    fromUnitId: "weightFromUnit",
    toUnitId: "weightToUnit",
    toValueId: "weightToValue",
    resultId: "weightResult",
    convert: function (value, fromUnit, toUnit) {
      var grams = value * WEIGHT_TO_GRAMS[fromUnit];
      return grams / WEIGHT_TO_GRAMS[toUnit];
    },
    unitLabel: function (unit) { return WEIGHT_LABELS[unit]; },
    sigFigs: 6
  });

  // Temperature
  bindConverter({
    fromValueId: "tempFromValue",
    fromUnitId: "tempFromUnit",
    toUnitId: "tempToUnit",
    toValueId: "tempToValue",
    resultId: "tempResult",
    convert: convertTemperature,
    unitLabel: function (unit) { return TEMP_LABELS[unit]; },
    sigFigs: null,
    decimals: 2
  });

  // Swap buttons
  setupSwap("lengthSwap", "lengthFromUnit", "lengthToUnit", "lengthFromValue");
  setupSwap("weightSwap", "weightFromUnit", "weightToUnit", "weightFromValue");
  setupSwap("tempSwap", "tempFromUnit", "tempToUnit", "tempFromValue");
}

var LENGTH_LABELS = {
  mm: "millimeters", cm: "centimeters", m: "meters", km: "kilometers",
  in: "inches", ft: "feet", yd: "yards", mi: "miles"
};
var WEIGHT_LABELS = {
  mg: "milligrams", g: "grams", kg: "kilograms", oz: "ounces",
  lb: "pounds", st: "stone", t: "metric tons"
};
var TEMP_LABELS = { c: "Celsius", f: "Fahrenheit", k: "Kelvin" };

function convertTemperature(value, fromUnit, toUnit) {
  var celsius;
  if (fromUnit === "c") celsius = value;
  else if (fromUnit === "f") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  if (toUnit === "c") return celsius;
  if (toUnit === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

function bindConverter(cfg) {
  var fromValueEl = document.getElementById(cfg.fromValueId);
  var fromUnitEl = document.getElementById(cfg.fromUnitId);
  var toUnitEl = document.getElementById(cfg.toUnitId);
  var toValueEl = document.getElementById(cfg.toValueId);
  var resultEl = document.getElementById(cfg.resultId);
  if (!fromValueEl) return;

  function update() {
    var raw = parseFloat(fromValueEl.value);
    if (isNaN(raw)) {
      toValueEl.value = "";
      resultEl.textContent = "—";
      return;
    }
    var fromUnit = fromUnitEl.value;
    var toUnit = toUnitEl.value;
    var result = cfg.convert(raw, fromUnit, toUnit);
    var formatted = cfg.sigFigs
      ? formatSigFigs(result, cfg.sigFigs)
      : result.toFixed(cfg.decimals);

    toValueEl.value = formatted;
    resultEl.textContent =
      formatSigFigs(raw, 8) + " " + cfg.unitLabel(fromUnit) + " = " + formatted + " " + cfg.unitLabel(toUnit);
  }

  [fromValueEl, fromUnitEl, toUnitEl].forEach(function (el) {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  update();
}

function formatSigFigs(num, sig) {
  if (num === 0) return "0";
  var rounded = parseFloat(num.toPrecision(sig));
  return rounded.toString();
}

function setupSwap(btnId, fromUnitId, toUnitId, fromValueId) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", function () {
    var fromUnitEl = document.getElementById(fromUnitId);
    var toUnitEl = document.getElementById(toUnitId);
    var tmp = fromUnitEl.value;
    fromUnitEl.value = toUnitEl.value;
    toUnitEl.value = tmp;
    fromUnitEl.dispatchEvent(new Event("change"));
  });
}

/* ==========================================================================
   CONTACT FORM (UI-only, no backend)
   ========================================================================== */

function setupContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) return;
  var status = document.getElementById("formStatus");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var submitBtn = form.querySelector("button[type='submit']");
    var originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    setTimeout(function () {
      status.textContent = "Thanks — your message has been sent. We'll get back to you soon.";
      status.className = "form-status show success";
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 700);
  });
}
