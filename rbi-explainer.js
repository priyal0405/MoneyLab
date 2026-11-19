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
if (!DEMO) {
  document.getElementById("hero-text").textContent = "Ask about any RBI policy, in a few words or a full headline. We read RBI's own website live and explain it in plain words: what it is, who it affects, and what it means for your loans, savings and prices.";
  document.getElementById("news-label").textContent = "Ask about any RBI policy";
  newsInput.placeholder = "e.g. gold loan rules · KYC for students · latest repo rate decision · digital lending apps";
}

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

const liveCache = new Map();   // "language|question" → answer, so switching language back is instant

async function explain(text = newsInput.value.trim()) {
  if (text.length < (DEMO ? 10 : 3)) {
    showStatus(DEMO ? "Paste a headline or a few lines about an RBI decision first."
      : "Type a few words about the RBI policy you're looking for, e.g. \"gold loan rules\".", "warn");
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
  const key = `${language}|${text}`;
  if (liveCache.has(key)) return openModal(liveHtml(liveCache.get(key), text));

  openModal(loadingHtml(text));
  explainBtn.disabled = true;
  const lang = language;

  try {
    const data = await liveAnswer(text, lang, (step) => showProgress(text, lang, step));
    liveCache.set(`${lang}|${text}`, data);
    // Only show it if the visitor is still waiting for this question in this language.
    if (shown && shown.text === text && language === lang) {
      modalBody.innerHTML = liveHtml(data, text);
      modal.querySelector(".modal-card").scrollTop = 0;
    }
  } catch (err) {
    if (shown && shown.text === text) closeModal();
    showStatus(err.message === "Failed to fetch" ? "Couldn't reach the explainer. Check your internet and try again." : err.message, "warn");
  } finally {
    explainBtn.disabled = false;
  }
}

// Ticks off the loading steps as the live search moves along.
function showProgress(text, lang, step) {
  if (!shown || shown.text !== text || language !== lang) return;
  modalBody.querySelectorAll(".progress-steps li").forEach((li, i) => {
    li.classList.toggle("done", i < step);
    li.classList.toggle("active", i === step);
  });
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
  const tryBtn = e.target.closest("button[data-query]");
  if (tryBtn) {
    newsInput.value = tryBtn.dataset.query;
    updateCount();
    explain(tryBtn.dataset.query);
  }
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

const LIVE = {
  en: {
    steps: ["Checking RBI's Master Directions, press releases and notifications live", "Reading the official RBI document", "Writing the explanation"],
    wait: "This usually takes 5–20 seconds.",
    excerptNote: "📄 Our free AI helper isn't available right now. It has a daily limit that resets at 5:30 am IST. So here are the most relevant parts in RBI's own words. Open the source for the full document.",
    excerptTitle: "What RBI's document says",
    kinds: { master_direction: "Master Direction", press_release: "Press release", notification: "Notification", rbi_search: "RBI website" },
    source: "Source", checked: "Read live from rbi.org.in", pdf: "PDF", partial: "This document is long, so only its first part was read.",
    what: "What it is", why: "Why RBI did this",
    who: "Who it affects", points: "Key points", notFound: "Exact policy not found",
    notFoundText: "We searched RBI's Master Directions, latest press releases and notifications, and the rest of rbi.org.in, but couldn't find a policy that exactly matches. Try changing your keywords.",
    similar: "Similar RBI policies", alsoSee: "Related on RBI's website", tryThis: "Explain this →", open: "Open on RBI ↗",
    noSimilar: "No close matches either. Try a broader term like \"KYC\", \"repo rate\", \"gold loan\" or \"UPI\".",
    notRelevant: "This doesn't look like a question about RBI or Indian banking rules. Try something like \"repo rate\", \"KYC rules\" or \"digital lending\"."
  },
  hi: {
    steps: ["RBI के Master Directions, प्रेस रिलीज़ और नोटिफ़िकेशन अभी देखे जा रहे हैं", "RBI का आधिकारिक दस्तावेज़ पढ़ा जा रहा है", "व्याख्या लिखी जा रही है"],
    wait: "इसमें आम तौर पर 5–20 सेकंड लगते हैं।",
    excerptNote: "📄 हमारा मुफ़्त AI सहायक अभी उपलब्ध नहीं है। इसकी रोज़ की एक सीमा है, जो सुबह 5:30 बजे IST फिर शुरू होती है। इसलिए यहाँ RBI के अपने शब्दों में सबसे काम के हिस्से हैं (अंग्रेज़ी में)। पूरा दस्तावेज़ स्रोत पर देखें।",
    excerptTitle: "RBI के दस्तावेज़ में क्या लिखा है",
    kinds: { master_direction: "Master Direction", press_release: "प्रेस रिलीज़", notification: "नोटिफ़िकेशन", rbi_search: "RBI वेबसाइट" },
    source: "स्रोत", checked: "अभी rbi.org.in से पढ़ा गया", pdf: "PDF", partial: "यह दस्तावेज़ लंबा है, इसलिए सिर्फ़ इसका पहला हिस्सा पढ़ा गया।",
    what: "यह क्या है", why: "RBI ने ऐसा क्यों किया",
    who: "किन पर असर", points: "मुख्य बातें", notFound: "ठीक यही नीति नहीं मिली",
    notFoundText: "हमने RBI के Master Directions, ताज़ा प्रेस रिलीज़ और नोटिफ़िकेशन, और बाकी rbi.org.in में खोजा, पर ठीक मेल खाती नीति नहीं मिली। कृपया दूसरे शब्दों से कोशिश करें।",
    similar: "मिलती-जुलती RBI नीतियाँ", alsoSee: "RBI वेबसाइट पर इससे जुड़ा", tryThis: "समझें →", open: "RBI पर खोलें ↗",
    noSimilar: "कोई मिलती-जुलती नीति भी नहीं मिली। \"KYC\", \"repo rate\", \"gold loan\" या \"UPI\" जैसे आम शब्द आज़माएँ।",
    notRelevant: "यह RBI या भारतीय बैंकिंग नियमों से जुड़ा सवाल नहीं लगता। \"repo rate\", \"KYC rules\" या \"digital lending\" जैसा कुछ आज़माएँ।"
  }
};

function loadingHtml(text) {
  if (DEMO) return "";
  const T = LIVE[language];
  return `
    <header class="modal-head">
      <div class="modal-head-top end">${langSwitchHtml()}</div>
      <h2>${escapeHtml(text)}</h2>
    </header>
    <div class="modal-loading">
      <div class="spinner"></div>
      <ol class="progress-steps">${T.steps.map((s, i) => `<li class="${i === 0 ? "active" : ""}">${s}</li>`).join("")}</ol>
      <p class="small">${T.wait}</p>
    </div>`;
}

const safeUrl = (u) => (/^https:\/\/([a-z0-9-]+\.)*rbi\.org\.in\//i.test(u) ? u : "https://www.rbi.org.in/");
const checkedTime = (iso) => new Date(iso).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function similarListHtml(items) {
  const T = LIVE[language];
  return `<ul class="similar-list">${items.map((s) => `
    <li>
      <div>
        <span class="similar-kind">${T.kinds[s.kind] || s.kind}${s.date ? ` · ${escapeHtml(s.date)}` : ""}</span>
        <strong>${escapeHtml(s.title)}</strong>
      </div>
      <div class="similar-actions">
        <button type="button" class="t-btn" data-query="${escapeHtml(s.title)}">${T.tryThis}</button>
        <a href="${escapeHtml(safeUrl(s.url))}" target="_blank" rel="noopener">${T.open}</a>
      </div>
    </li>`).join("")}</ul>`;
}

// data: the Worker's answer { status, source, similar, result, checked_at }
function liveHtml(data, text) {
  const L = LABELS[language];
  const T = LIVE[language];
  const foot = `
    <div class="modal-foot">
      <span class="muted small">${L.notAdvice}</span>
      <button type="button" class="btn btn-orange modal-done">${L.close}</button>
    </div>`;
  const plainHead = (title, sub = "") => `
    <header class="modal-head">
      <div class="modal-head-top end">${langSwitchHtml()}</div>
      <h2>${escapeHtml(title)}</h2>
      ${sub ? `<p class="modal-sub">"${escapeHtml(sub)}"</p>` : ""}
    </header>`;

  if (data.status === "not_relevant") {
    return `${plainHead(text)}<div class="modal-content"><p>${T.notRelevant}</p>${foot}</div>`;
  }
  if (data.status === "not_found") {
    return `${plainHead(text)}
      <div class="modal-content">
        <div class="not-found">
          <h3>🔍 ${T.notFound}</h3>
          <p>${T.notFoundText}</p>
          <p class="muted small">${T.checked}: ${checkedTime(data.checked_at)}</p>
        </div>
        ${data.similar && data.similar.length ? `<h3>${T.similar}</h3>${similarListHtml(data.similar)}` : `<p class="muted">${T.noSimilar}</p>`}
        ${foot}
      </div>`;
  }

  const s = data.source;
  const sourceBox = `
      <div class="source-box">
        <span class="source-live">🔗 ${T.checked} · ${checkedTime(data.checked_at)}</span>
        <div><strong>${T.source}:</strong> ${T.kinds[s.kind] || s.kind}${s.date ? `, ${escapeHtml(s.date)}` : ""}</div>
        <a href="${escapeHtml(safeUrl(s.url))}" target="_blank" rel="noopener">${escapeHtml(s.title)} ↗</a>
        ${s.pdf_url ? ` · <a href="${escapeHtml(safeUrl(s.pdf_url))}" target="_blank" rel="noopener">${T.pdf} ↗</a>` : ""}
        ${s.partial ? `<p class="muted small">${T.partial}</p>` : ""}
      </div>`;
  const related = data.similar && data.similar.length ? `<h3>${T.alsoSee}</h3>${similarListHtml(data.similar)}` : "";

  if (data.mode === "excerpt") {
    return `
    ${plainHead(s.title, text)}
    <div class="modal-content">
      ${sourceBox}
      <div class="ai-badge ready">${T.excerptNote}</div>
      <h3>${T.excerptTitle}</h3>
      <div class="excerpts">${data.excerpts.map((p) => `<blockquote>${escapeHtml(p)}</blockquote>`).join("")}</div>
      ${related}
      ${foot}
    </div>`;
  }

  const r = data.result;
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
  const impacts = ["loans", "savings", "prices"].filter((k) => r[k] && r[k].direction !== "not_affected");
  const steps = [
    [T.what, `<p class="big">${escapeHtml(r.summary)}</p>`],
    [T.why, `<p>${escapeHtml(r.why)}</p>`],
    [T.who, `<p>${escapeHtml(r.who_it_affects)}</p>`],
    r.key_points && r.key_points.length ? [T.points, `<ul class="key-points">${r.key_points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`] : null,
    impacts.length ? [L.you, `<div class="impact-grid">${impacts.map(impactCard).join("")}</div>`] : null,
    r.key_terms && r.key_terms.length ? [L.terms, `<dl class="terms">${r.key_terms.map((t) => `<div><dt>${escapeHtml(t.term)}</dt><dd>${escapeHtml(t.meaning)}</dd></div>`).join("")}</dl>`] : null
  ].filter(Boolean);

  return `
    ${plainHead(r.plain_title || s.title, text)}
    <div class="modal-content">
      ${sourceBox}
      <div class="ai-badge">${L.ai}</div>
      ${steps.map(([title, body], i) => `
        <section class="step">
          <div class="step-num">${i + 1}</div>
          <div class="step-body"><h3>${title}</h3>${body}</div>
        </section>`).join("")}
      ${r.takeaway ? `<div class="takeaway"><strong>💡 ${L.remember}:</strong> ${escapeHtml(r.takeaway)}</div>` : ""}
      ${related}
      ${foot}
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
