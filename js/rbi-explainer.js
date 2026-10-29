// RBI Policy Explainer: sends pasted news to the backend (backend/worker.js).
// Real announcements from js/rbi-timeline.js have ready-made explanations, and
// js/rbi-quick.js gives a rule-based answer when the backend isn't connected.
// Every explanation opens in a pop-up.

const newsInput   = document.getElementById("news");
const explainBtn  = document.getElementById("explain");
const langButtons = document.querySelectorAll(".lang-toggle button");
const statusBox   = document.getElementById("explain-status");
const examplesBox = document.getElementById("examples");
const charCount   = document.getElementById("char-count");
const timelineBox = document.getElementById("timeline");
const filterBox   = document.getElementById("timeline-filters");
const modal       = document.getElementById("modal");
const modalBody   = document.getElementById("modal-body");

const DEMO = !EXPLAINER_API_URL;
let language = "en";
let filter = "all";
let shown = null;          // what the pop-up shows: { kind: "timeline", date } or { kind: "text", text }
let lastFocus = null;

const LABELS = {
  en: {
    loans: "🏠 Loans & EMIs", savings: "🐷 Savings & FDs", prices: "🛒 Everyday prices",
    up: "Likely to go up", down: "Likely to go down", same: "Likely no big change", unclear: "Hard to say",
    what: "What happened", why: "Why it happened", you: "What it means for you", terms: "Words to know", remember: "Remember this",
    ai: "🤖 Explained by AI. It can make mistakes, so check RBI's official statement for exact figures.",
    ready: "📚 Explanation written for learning, based on news reports of the RBI's announcement.",
    quick: "⚡ Quick explanation from built-in rules (not AI). It picks out key words like cut, hike, repo and bps, so check the details in the RBI's official statement.",
    explain: "Explain →", close: "Close", notAdvice: "Educational only, not investment advice."
  },
  hi: {
    loans: "🏠 लोन और EMI", savings: "🐷 बचत और FD", prices: "🛒 रोज़ के दाम",
    up: "बढ़ने की संभावना", down: "घटने की संभावना", same: "ख़ास बदलाव नहीं", unclear: "अभी कहना मुश्किल",
    what: "क्या हुआ", why: "ऐसा क्यों हुआ", you: "आपके लिए इसका मतलब", terms: "ज़रूरी शब्द", remember: "यह याद रखें",
    ai: "🤖 यह व्याख्या AI ने लिखी है। इसमें गलती हो सकती है, सही आँकड़ों के लिए RBI का आधिकारिक बयान देखें।",
    ready: "📚 RBI की घोषणा की ख़बरों के आधार पर, सीखने के लिए लिखी गई व्याख्या।",
    quick: "⚡ तय नियमों से बनी झटपट व्याख्या (AI नहीं)। यह cut, hike, repo, bps जैसे शब्द पहचानती है, इसलिए बारीकियाँ RBI के आधिकारिक बयान में देखें।",
    explain: "समझें →", close: "बंद करें", notAdvice: "सिर्फ़ सीखने के लिए, निवेश सलाह नहीं।"
  }
};
const TAGS = {
  cut:       { en: "Rate cut",     hi: "रेट कटौती" },
  hold:      { en: "Rate on hold", hi: "रेट स्थिर" },
  liquidity: { en: "Cash boost",   hi: "नकदी उपाय" },
  inflation: { en: "Inflation",    hi: "महँगाई" }
};
const ARROWS = { up: "↑", down: "↓", same: "→", unclear: "?" };

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const formatDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });

// ---------- Paste box ----------
examplesBox.innerHTML = RBI_TIMELINE.filter((e) => e.major).map((e) =>
  `<button type="button" data-date="${e.date}">⭐ ${formatDate(e.date)}</button>`).join("");
examplesBox.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-date]");
  if (btn) openTimelineEntry(btn.dataset.date);
});

function updateCount() {
  charCount.textContent = `${newsInput.value.length} / 4000`;
}
newsInput.addEventListener("input", updateCount);
newsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) explain();
});
explainBtn.addEventListener("click", () => explain());

function setLanguage(lang) {
  language = lang;
  document.documentElement.lang = lang;
  langButtons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  renderTimeline();
  // Re-show whatever is open in the pop-up in the new language.
  if (!modal.hidden && shown) {
    if (shown.kind === "timeline") openTimelineEntry(shown.date);
    else explain(shown.text);
  }
}
langButtons.forEach((btn) => btn.addEventListener("click", () => setLanguage(btn.dataset.lang)));

async function explain(text = newsInput.value.trim()) {
  if (text.length < 10) {
    showStatus("Paste a headline or a few lines about an RBI decision first.", "warn");
    return;
  }
  statusBox.hidden = true;

  const known = RBI_TIMELINE.find((e) => e.headline === text);
  if (known) return openTimelineEntry(known.date);

  if (DEMO) {
    const quick = quickExplain(text, language);
    if (!quick) {
      showStatus(language === "hi"
        ? "यह RBI या ब्याज दरों से जुड़ी ख़बर नहीं लगती। RBI की कोई हेडलाइन पेस्ट करें, जैसे \"RBI cuts repo rate by 25 bps\"।"
        : "This doesn't look like RBI or interest-rate news. Try pasting an RBI headline, e.g. \"RBI cuts repo rate by 25 bps to 5%\".", "warn");
      return;
    }
    shown = { kind: "text", text };
    openModal(modalHtml(quick, "quick", { headline: text }));
    return;
  }

  shown = { kind: "text", text };
  openModal(loadingHtml(text));
  explainBtn.disabled = true;

  try {
    const res = await fetch(EXPLAINER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.result) throw new Error(data.error || "Something went wrong. Please try again.");
    if (shown && shown.text === text) modalBody.innerHTML = modalHtml(data.result, true, { headline: text });
  } catch (err) {
    closeModal();
    showStatus(err.message === "Failed to fetch" ? "Couldn't reach the explainer. Check your internet and try again." : err.message, "warn");
  } finally {
    explainBtn.disabled = false;
  }
}

function showStatus(msg, kind) {
  statusBox.hidden = false;
  statusBox.className = `explain-status ${kind}`;
  statusBox.textContent = msg;
}

// ---------- Pop-up ----------
function openTimelineEntry(date) {
  const e = RBI_TIMELINE.find((x) => x.date === date);
  shown = { kind: "timeline", date };
  openModal(modalHtml(e[language], false, e));
}

function openModal(html) {
  modalBody.innerHTML = html;
  if (modal.hidden) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
  }
  modal.querySelector(".modal-card").scrollTop = 0;
  modal.querySelector(".modal-close").focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  shown = null;
  if (lastFocus) lastFocus.focus();
}

modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.closest(".modal-close") || e.target.closest(".modal-done")) closeModal();
  const langBtn = e.target.closest(".modal-lang button");
  if (langBtn) setLanguage(langBtn.dataset.lang);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

function langSwitchHtml() {
  return `<div class="view-toggle lang-toggle modal-lang">
    <button data-lang="en" class="${language === "en" ? "active" : ""}">English</button>
    <button data-lang="hi" class="${language === "hi" ? "active" : ""}">हिंदी</button>
  </div>`;
}

function loadingHtml(text) {
  return `
    <header class="modal-head">
      <div class="modal-head-top end">${langSwitchHtml()}</div>
      <h2>${escapeHtml(text)}</h2>
    </header>
    <div class="modal-loading">
      <div class="spinner"></div>
      <p>${language === "hi" ? "AI पढ़ रहा है… इसमें 10–20 सेकंड लग सकते हैं।" : "The AI is reading it… this can take 10–20 seconds."}</p>
    </div>`;
}

// source: true = AI, false = hand-written timeline entry, "quick" = built-in rules
// entry: a timeline entry (date, tag, title, rate, major) or just { headline }
function modalHtml(r, source, entry) {
  const L = LABELS[language];
  const badge = source === "quick" ? `<div class="ai-badge quick">${L.quick}</div>`
    : `<div class="ai-badge ${source ? "" : "ready"}">${source ? L.ai : L.ready}</div>`;

  const head = entry.date ? `
    <header class="modal-head ${entry.tag}">
      <div class="modal-head-top">
        <div class="t-meta">
          <span class="t-date">${formatDate(entry.date)}</span>
          <span class="t-tag ${entry.tag}">${TAGS[entry.tag][language]}</span>
          ${entry.major ? `<span class="t-major">⭐ Major</span>` : ""}
          <span class="t-rate">Repo ${entry.rate}</span>
        </div>
        ${langSwitchHtml()}
      </div>
      <h2>${escapeHtml(entry.title)}</h2>
      <p class="modal-sub">"${escapeHtml(entry.headline)}"</p>
    </header>` : `
    <header class="modal-head">
      <div class="modal-head-top end">${langSwitchHtml()}</div>
      <h2>${escapeHtml(entry.headline)}</h2>
    </header>`;

  if (!r.is_relevant) return `${head}<div class="modal-content">${badge}<p>${escapeHtml(r.summary)}</p></div>`;

  const impactCard = (key) => {
    const { direction, explanation } = r[key];
    return `
      <div class="impact-card ${key}">
        <div class="impact-top">
          <h3>${L[key]}</h3>
          <span class="arrow ${direction}">${ARROWS[direction] || "?"}</span>
        </div>
        <span class="impact-dir ${direction}">${L[direction] || direction}</span>
        <p>${escapeHtml(explanation)}</p>
      </div>`;
  };
  const step = (n, title, body) => `
    <section class="step">
      <div class="step-num">${n}</div>
      <div class="step-body"><h3>${title}</h3>${body}</div>
    </section>`;

  return `
    ${head}
    <div class="modal-content">
      ${badge}
      ${step(1, L.what, `<p class="big">${escapeHtml(r.summary)}</p>`)}
      ${step(2, L.why, `<p>${escapeHtml(r.why)}</p>`)}
      ${step(3, L.you, `<div class="impact-grid">${impactCard("loans")}${impactCard("savings")}${impactCard("prices")}</div>`)}
      ${r.key_terms && r.key_terms.length ? step(4, L.terms, `<dl class="terms">${r.key_terms.map((t) => `<div><dt>${escapeHtml(t.term)}</dt><dd>${escapeHtml(t.meaning)}</dd></div>`).join("")}</dl>`) : ""}
      <div class="takeaway"><strong>💡 ${L.remember}:</strong> ${escapeHtml(r.takeaway)}</div>
      <div class="modal-foot">
        <span class="muted small">${L.notAdvice}</span>
        <button type="button" class="btn btn-orange modal-done">${L.close}</button>
      </div>
    </div>`;
}

// ---------- Timeline ----------
filterBox.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  filterBox.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
  filter = btn.dataset.filter;
  renderTimeline();
});

timelineBox.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-date]");
  if (btn) openTimelineEntry(btn.dataset.date);
});

function renderTimeline() {
  const L = LABELS[language];
  const items = RBI_TIMELINE.filter((e) => filter === "all" || (filter === "major" ? e.major : e.tag === filter));
  let year = null;

  timelineBox.innerHTML = items.map((e) => {
    const y = e.date.slice(0, 4);
    const yearHead = y !== year ? `<div class="t-year">${(year = y)}</div>` : "";
    return `${yearHead}
      <article class="t-item ${e.tag} ${e.major ? "major" : ""}">
        <span class="t-dot"></span>
        <div class="t-card">
          <div class="t-meta">
            <span class="t-date">${formatDate(e.date)}</span>
            <span class="t-tag ${e.tag}">${TAGS[e.tag][language]}</span>
            ${e.major ? `<span class="t-major">⭐ Major</span>` : ""}
            <span class="t-rate">Repo ${e.rate}</span>
          </div>
          <h3>${escapeHtml(e.title)}</h3>
          <p class="t-headline">${escapeHtml(e.headline)}</p>
          <button type="button" class="t-btn" data-date="${e.date}">${L.explain}</button>
        </div>
      </article>`;
  }).join("") || `<p class="muted">Nothing here for this filter.</p>`;
}

// ---------- Repo rate chart ----------
function drawRepoChart() {
  if (typeof Chart === "undefined") return;
  const points = REPO_HISTORY.map(([d, r]) => ({ x: new Date(d + "T00:00:00").getTime(), y: r }));
  const label = (t) => new Date(t).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  new Chart(document.getElementById("repo-chart"), {
    type: "line",
    data: {
      datasets: [{
        label: "Repo rate",
        data: points,
        stepped: true,
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.12)",
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1400, easing: "easeOutQuart" },
      layout: { padding: { right: 24 } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { title: (c) => label(c[0].raw.x), label: (c) => `Repo rate: ${c.raw.y.toFixed(2)}%` } }
      },
      scales: {
        x: {
          type: "linear",
          min: points[0].x,
          max: points[points.length - 1].x,
          ticks: { callback: label, maxTicksLimit: 7, font: { family: "Poppins" } },
          grid: { display: false }
        },
        y: {
          min: 5, max: 6.75,
          ticks: { callback: (v) => v.toFixed(2) + "%", stepSize: 0.25, font: { family: "Poppins" } },
          grid: { color: "#f6efe8" }
        }
      }
    }
  });
}

updateCount();
renderTimeline();
drawRepoChart();
