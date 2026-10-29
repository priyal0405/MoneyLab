// Fund Face-Off: compares two mutual funds using free NAV data from
// mfapi.in (no key needed). Expense ratio isn't in the API, so the user may type it.

const API = "https://api.mfapi.in/mf";
const COLORS = { a: "#7c3aed", b: "#14b8a6" };
const DAY = 24 * 60 * 60 * 1000;

// One-click picks (Direct, Growth plans) and the pair shown when the page opens.
const POPULAR = [
  { code: 120716, label: "UTI Nifty 50 Index" },
  { code: 122639, label: "Parag Parikh Flexi Cap" },
  { code: 118955, label: "HDFC Flexi Cap" },
  { code: 118825, label: "Mirae Asset Large Cap" },
  { code: 118778, label: "Nippon India Small Cap" },
  { code: 120503, label: "Axis ELSS Tax Saver" }
];
const DEFAULTS = { a: 120716, b: 122639 };

const funds = { a: null, b: null };   // { code, name, meta, navs: [{t, nav}] oldest first }
let period = 3;                        // years shown on the chart ("max" = common history)
let chart = null;

const rupees = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const pct = (n) => (n == null || !isFinite(n) ? "–" : `${n.toFixed(1)}%`);
const shortName = (n) => n.replace(/\s*-\s*(Direct|Regular) Plan.*$/i, "").replace(/ Fund$/i, "");

const categoryName = (i) => (FUND_CATEGORIES[i] || "").replace(/^.* - /, "");

function parseDate(s) {
  const [d, m, y] = s.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

// ---------- Pickers ----------
document.querySelectorAll(".fund-picker").forEach((picker) => {
  const slot = picker.dataset.slot;
  const input = picker.querySelector(".search");
  const list = picker.querySelector(".suggestions");
  const chips = picker.querySelector(".quick-picks");

  chips.innerHTML = POPULAR.map((f) => `<button type="button" data-code="${f.code}">${f.label}</button>`).join("");
  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-code]");
    if (btn) loadFund(slot, btn.dataset.code);
  });

  // Search the built-in fund list (js/funds.js): instant, no network needed.
  // mfapi's own search can take 30+ seconds, so we don't use it.
  input.addEventListener("input", () => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length || input.value.trim().length < 2) { list.innerHTML = ""; return; }
    const items = FUND_LIST
      .filter(([, name]) => { const n = name.toLowerCase(); return words.every((w) => n.includes(w)); })
      .sort((x, y) => (x[2] === y[2] ? x[1].localeCompare(y[1]) : x[2] === "D" ? -1 : 1))
      .slice(0, 10);
    list.innerHTML = items.length
      ? items.map(([code, name, plan, cat]) => `
          <li data-code="${code}">
            <span class="s-name">${name}</span>
            <span class="s-meta"><b class="plan ${plan}">${plan === "D" ? "Direct" : "Regular"}</b>${categoryName(cat)}</span>
          </li>`).join("")
      : `<li class="none">No funds found. Try one word, e.g. "parikh".</li>`;
  });

  // Enter picks the first suggestion
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = list.querySelector("li[data-code]");
    if (first) first.click();
  });

  list.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-code]");
    if (!li) return;
    list.innerHTML = "";
    input.value = "";
    loadFund(slot, li.dataset.code);
  });

  document.addEventListener("click", (e) => {
    if (!picker.contains(e.target)) list.innerHTML = "";
  });
});

document.querySelectorAll(".expense input").forEach((inp) => inp.addEventListener("input", render));

document.getElementById("swap").addEventListener("click", () => {
  [funds.a, funds.b] = [funds.b, funds.a];
  const ea = document.getElementById("er-a"), eb = document.getElementById("er-b");
  [ea.value, eb.value] = [eb.value, ea.value];
  showPicked("a"); showPicked("b");
  render();
});

document.querySelectorAll(".period-toggle button").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".period-toggle button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    period = btn.dataset.years === "max" ? "max" : Number(btn.dataset.years);
    render();
  })
);

function showPicked(slot, message) {
  const box = document.querySelector(`.fund-picker[data-slot="${slot}"] .picked`);
  const f = funds[slot];
  if (message) { box.innerHTML = `<span class="muted">${message}</span>`; return; }
  if (!f) { box.innerHTML = `<span class="muted">No fund chosen yet</span>`; return; }
  const category = (f.meta.scheme_category || "").replace(/^.*Scheme - /, "");
  box.innerHTML = `<strong>${shortName(f.name)}</strong><span class="muted">${f.meta.fund_house || ""}${category ? " · " + category : ""}</span>`;
  document.querySelectorAll(`.fund-picker[data-slot="${slot}"] .quick-picks button`).forEach((b) =>
    b.classList.toggle("active", Number(b.dataset.code) === Number(f.code))
  );
}

// The free API sometimes drops a request, so try a few times before giving up.
async function fetchJson(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
}

async function loadFund(slot, code) {
  showPicked(slot, "Loading…");
  try {
    // The query string matters: mfapi's cached copies of /mf/<code> drop the CORS
    // header, so browsers block them. Adding a query string skips that cache.
    const json = await fetchJson(`${API}/${code}?startDate=2000-01-01`);
    const navs = (json.data || [])
      .map((d) => ({ t: parseDate(d.date), nav: Number(d.nav) }))
      .filter((d) => d.nav > 0 && !isNaN(d.t))
      .sort((x, y) => x.t - y.t);
    if (navs.length < 2) throw new Error("no data");
    funds[slot] = { code, name: json.meta.scheme_name, meta: json.meta, navs };
    showPicked(slot);
  } catch {
    funds[slot] = null;
    showPicked(slot, "Couldn't load this fund. Check your internet and try again.");
  }
  render();
}

// ---------- Maths ----------
// NAV on or just before time t (navs sorted oldest first); falls back to the first NAV.
function navAt(navs, t) {
  let lo = 0, hi = navs.length - 1, ans = navs[0];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (navs[mid].t <= t) { ans = navs[mid]; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
}

// Yearly return (CAGR) over the last `years`, or null if the fund is too young.
function cagr(navs, years) {
  const last = navs[navs.length - 1];
  const start = last.t - years * 365.25 * DAY;
  if (navs[0].t > start + 7 * DAY) return null;
  return (Math.pow(last.nav / navAt(navs, start).nav, 1 / years) - 1) * 100;
}

// Annualised volatility of daily returns over the last 3 years.
function volatility(navs) {
  const from = navs[navs.length - 1].t - 3 * 365.25 * DAY;
  const slice = navs.filter((d) => d.t >= from);
  const rets = [];
  for (let i = 1; i < slice.length; i++) rets.push(Math.log(slice[i].nav / slice[i - 1].nav));
  if (rets.length < 30) return null;
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(variance * 252) * 100;
}

// Biggest fall from a peak over the last 5 years (as a negative %).
function maxDrawdown(navs) {
  const from = navs[navs.length - 1].t - 5 * 365.25 * DAY;
  let peak = 0, worst = 0;
  for (const d of navs) {
    if (d.t < from) continue;
    peak = Math.max(peak, d.nav);
    worst = Math.min(worst, (d.nav - peak) / peak);
  }
  return worst * 100;
}

// Rough fees paid on ₹1 lakh over 10 years, assuming the market earns 12% a year.
function feeCost(er) {
  if (!(er >= 0)) return null;
  return 100000 * (Math.pow(1.12, 10) - Math.pow(1.12 - er / 100, 10));
}

// ---------- Render ----------
function render() {
  const slots = ["a", "b"].filter((s) => funds[s]);
  document.getElementById("compare-results").hidden = slots.length === 0;
  document.getElementById("compare-empty").hidden = slots.length > 0;
  if (!slots.length) return;

  renderTable();
  drawChart(slots);
}

function renderTable() {
  const stats = {};
  for (const s of ["a", "b"]) {
    if (!funds[s]) { stats[s] = {}; continue; }
    const n = funds[s].navs;
    const er = parseFloat(document.getElementById(`er-${s}`).value);
    stats[s] = {
      r1: cagr(n, 1), r3: cagr(n, 3), r5: cagr(n, 5),
      vol: volatility(n), dd: maxDrawdown(n),
      er: isNaN(er) ? null : er, fee: feeCost(er)
    };
  }

  // [label, key, higher is better?, formatter, help text]
  const rows = [
    ["1-year return", "r1", true, pct, "Growth over the last 12 months."],
    ["3-year return (a year)", "r3", true, pct, "Average yearly growth over 3 years."],
    ["5-year return (a year)", "r5", true, pct, "Average yearly growth over 5 years."],
    ["Ups and downs (volatility)", "vol", false, pct, "How much the NAV jumps around. Lower is calmer."],
    ["Worst fall (last 5 yrs)", "dd", true, pct, "The biggest drop from a high point. Closer to 0 is better."],
    ["Expense ratio", "er", false, (v) => (v == null ? `<a href="#what-is-er" class="muted">not entered</a>` : v.toFixed(2) + "%"), "The fund's yearly fee. See \"What is an expense ratio?\" below."],
    ["Fees on ₹1 lakh, 10 yrs", "fee", false, (v) => (v == null ? "–" : rupees(v)), "Roughly how much growth the fee eats over 10 years, if markets earn 12% a year."]
  ];

  document.getElementById("name-a").textContent = funds.a ? shortName(funds.a.name) : "Fund A";
  document.getElementById("name-b").textContent = funds.b ? shortName(funds.b.name) : "Fund B";

  document.getElementById("compare-body").innerHTML = rows.map(([label, key, higher, fmt, help]) => {
    const va = stats.a[key], vb = stats.b[key];
    let win = "";
    if (va != null && vb != null && va !== vb) win = (higher ? va > vb : va < vb) ? "a" : "b";
    const cell = (s, v) => (funds[s] ? fmt(v) : `<span class="muted">pick a fund</span>`);
    return `
      <tr>
        <th>${label}<small>${help}</small></th>
        <td class="${win === "a" ? "win a" : ""}">${cell("a", va)}</td>
        <td class="${win === "b" ? "win b" : ""}">${cell("b", vb)}</td>
      </tr>`;
  }).join("");
}

function drawChart(slots) {
  const note = document.getElementById("chart-note");
  if (typeof Chart === "undefined") {
    note.textContent = "The chart library didn't load. Check your internet connection and refresh.";
    return;
  }

  const lists = slots.map((s) => funds[s].navs);
  const end = Math.min(...lists.map((n) => n[n.length - 1].t));
  const commonStart = Math.max(...lists.map((n) => n[0].t));
  const wanted = period === "max" ? commonStart : end - period * 365.25 * DAY;
  const start = Math.max(commonStart, wanted);

  // One point a week keeps the chart light.
  const times = [];
  for (let t = start; t < end; t += 7 * DAY) times.push(t);
  times.push(end);

  const label = (t) => new Date(t).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  const datasets = slots.map((s) => {
    const navs = funds[s].navs;
    const base = navAt(navs, start).nav;
    return {
      label: shortName(funds[s].name),
      data: times.map((t) => Math.round((navAt(navs, t).nav / base) * 10000)),
      borderColor: COLORS[s],
      backgroundColor: COLORS[s] + "1f",
      fill: true,
      tension: 0.3,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5
    };
  });

  const finals = datasets.map((d) => `${d.label}: ${rupees(d.data[d.data.length - 1])}`).join("  ·  ");
  note.textContent = (start > wanted + 30 * DAY
    ? `One fund is younger, so the chart starts in ${label(start)}. `
    : "") + `Today: ${finals}`;

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("compare-chart"), {
    type: "line",
    data: { labels: times.map(label), datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: { duration: 1200, easing: "easeOutQuart" },
      plugins: {
        legend: { labels: { usePointStyle: true, font: { family: "Poppins" } } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${rupees(c.raw)}` } }
      },
      scales: {
        y: { ticks: { callback: (v) => rupees(v), font: { family: "Poppins" } }, grid: { color: "#f0ecf9" } },
        x: { ticks: { maxTicksLimit: 8, font: { family: "Poppins" } }, grid: { display: false } }
      }
    }
  });
}

// Start with a ready-made comparison so the page is never empty.
loadFund("a", DEFAULTS.a).then(() => loadFund("b", DEFAULTS.b));
