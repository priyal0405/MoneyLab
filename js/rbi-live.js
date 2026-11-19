// RBI live search, run in the visitor's browser. Free: no paid services.
//
// For each question:
//   1. Read RBI's Master Directions, this month's press releases and the latest
//      notifications live from rbi.org.in, through the free Worker (RBI blocks
//      direct browser requests).
//   2. Match the question against their titles, preferring a Master Direction.
//   3. No match → use RBI's own site search (rbi.org.in/Scripts/SearchResults.aspx).
//   4. Download the matching RBI page (or its PDF) and ask the free Workers AI to explain it.
//      If the AI's free daily allowance is used up, show RBI's own words instead.
//   5. Still nothing → "not found", with the closest RBI policies to try.

const RBI_SCRIPTS = "https://www.rbi.org.in/Scripts/";
const RBI_LISTS = [
  { kind: "master_direction", url: RBI_SCRIPTS + "BS_ViewMasDirections.aspx" },
  { kind: "press_release",    url: RBI_SCRIPTS + "BS_PressReleaseDisplay.aspx" },
  { kind: "notification",     url: RBI_SCRIPTS + "NotificationUser.aspx" }
];
const AI_TEXT_CHARS = 24000;
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";

const workerUrl = (path) => EXPLAINER_API_URL.replace(/\/+$/, "") + path;

async function rbiGet(url) {
  const res = await fetch(workerUrl("/rbi?url=" + encodeURIComponent(url)), { cache: "no-store" });
  if (!res.ok) throw new Error("RBI's website didn't respond. Please try again in a minute.");
  return res;
}

// ---------- Reading RBI's HTML ----------
const HTML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };
function decodeHtml(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return HTML_ENTITIES[e.toLowerCase()] ?? m;
  });
}
const cleanHtml = (s) => decodeHtml(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// The page's own content sits between the "right_blue_border" column and the footer.
function rbiMain(html) {
  const marker = html.indexOf("right_blue_border");
  const start = marker > 0 ? html.indexOf(">", marker) + 1 : 0;
  const end = html.indexOf("<footer", start);
  return html.slice(start, end > start ? end : undefined);
}

// List pages are tables: header rows hold a date (or group name), then rows with <a class="link2"> links.
function parseRbiList(html, kind) {
  const re = /class=["']?tableheader["']?[^>]*>\s*<b>([^<]*)|<a\s+class=["']?link2["']?\s+href=["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi;
  const part = rbiMain(html);
  const items = [], seen = new Set();
  let date = "", group = "", m;
  while ((m = re.exec(part))) {
    if (m[1] !== undefined) {
      const text = cleanHtml(m[1]);
      if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(text)) date = text;
      else if (text) { group = text; date = ""; }
      continue;
    }
    const url = new URL(decodeHtml(m[2]), RBI_SCRIPTS).href;
    const title = cleanHtml(m[3]);
    if (!title || seen.has(url)) continue;
    seen.add(url);
    items.push({ kind, title, url, date, group });
  }
  return items;
}

// RBI's site search: <a class="sub_title2_link" href=… onclick="add('id','Section')"><h3>Title</h3></a><div class="sub_title2_detail">Date</div>
function parseRbiSearch(html) {
  const re = /<a\s+class="sub_title2_link"\s+href="([^"]+)"[^>]*?(?:onclick="add\('[^']*','([^']*)'\)")?[^>]*>\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*<\/a>\s*<div class="sub_title2_detail">([^<]*)/gi;
  const kinds = { pressreleases: "press_release", notifications: "notification", masterdirections: "master_direction" };
  const items = [];
  let m;
  while ((m = re.exec(html))) {
    const url = decodeHtml(m[1]);
    if (!/\?.*=\d+/.test(url) && !/\.pdf$/i.test(url)) continue;   // skip general pages like "Right to Information"
    items.push({ kind: kinds[(m[2] || "").toLowerCase()] || "rbi_search", title: cleanHtml(m[3]), url, date: cleanHtml(m[4]), group: "" });
  }
  return items;
}

function rbiPageText(html) {
  const text = decodeHtml(
    rbiMain(html)
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>|<\/(p|div|tr|li|h[1-6]|table|ul|ol)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
  return text.replace(/[ \t ]+/g, " ").replace(/\s*\n\s*/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

let pdfjsReady = null;
function loadPdfJs() {
  if (!pdfjsReady) {
    pdfjsReady = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PDFJS + "pdf.min.js";
      s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js"; resolve(); };
      s.onerror = () => { pdfjsReady = null; reject(new Error("Couldn't load the PDF reader.")); };
      document.head.appendChild(s);
    });
  }
  return pdfjsReady;
}

async function pdfText(bytes, maxPages = 25) {
  await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];
  for (let p = 1; p <= Math.min(pdf.numPages, maxPages); p++) {
    const content = await (await pdf.getPage(p)).getTextContent();
    pages.push(content.items.map((i) => i.str + (i.hasEOL ? "\n" : " ")).join(""));
  }
  return { text: pages.join("\n\n").replace(/[ \t]+/g, " ").trim(), cut: pdf.numPages > maxPages };
}

// Downloads an RBI page live. Uses its PDF when the page itself only links to one.
async function readRbiDocument(url) {
  const res = await rbiGet(url);
  const type = res.headers.get("content-type") || "";
  if (type.includes("pdf") || /\.pdf$/i.test(url)) {
    const { text, cut } = await pdfText(new Uint8Array(await res.arrayBuffer()));
    return { text, pdfUrl: url, cut };
  }
  const html = await res.text();
  const pdfMatch = html.match(/https:\/\/rbidocs\.rbi\.org\.in\/[^"'\s>]+\.pdf/i);
  const pdfUrl = pdfMatch ? pdfMatch[0] : "";
  const text = rbiPageText(html);
  if (text.length < 600 && pdfUrl) {
    try {
      const pdf = await pdfText(new Uint8Array(await (await rbiGet(pdfUrl)).arrayBuffer()));
      return { text: pdf.text, pdfUrl, cut: pdf.cut };
    } catch { /* fall back to the short page text */ }
  }
  return { text, pdfUrl, cut: false };
}

// ---------- Matching the question ----------
const STOP = new Set(("a an the of for on in to and or is are was were be what whats which who how why when does do did can could should " +
  "i me my we our you your it its this that these those with by from about under over into as at any all new latest recent current " +
  "rbi reserve bank india indian rule rules direction directions master guideline guidelines regulation regulations policy policies " +
  "explain tell know please kya hai").split(" "));

// Words people type → words RBI uses in titles. Each group counts as one idea.
const SYNONYMS = {
  kyc: ["kyc", "know your customer"], upi: ["upi", "unified payments"], nbfc: ["nbfc", "non-banking", "non banking"],
  loan: ["loan", "lending", "credit", "advance", "borrow"], emi: ["emi", "loan", "interest"], fd: ["fd", "fixed deposit", "deposit"],
  deposit: ["deposit"], interest: ["interest", "rate"], card: ["card"], forex: ["forex", "foreign exchange"],
  wallet: ["wallet", "prepaid payment"], ppi: ["ppi", "prepaid payment"], nri: ["nri", "non-resident", "non resident"],
  repo: ["repo", "monetary policy", "mpc"], mpc: ["mpc", "monetary policy"], inflation: ["inflation", "monetary policy"],
  fraud: ["fraud"], cyber: ["cyber"], digital: ["digital"], gold: ["gold"], atm: ["atm"], cheque: ["cheque"],
  pension: ["pension"], microfinance: ["microfinance"], housing: ["housing"], cooperative: ["co-operative", "cooperative"],
  ombudsman: ["ombudsman", "complaint", "grievance"], complaint: ["complaint", "grievance", "ombudsman"]
};
const HINDI = {
  "रेपो": "repo", "ब्याज": "interest", "लोन": "loan", "ऋण": "loan", "कर्ज": "loan", "क़र्ज़": "loan", "सोना": "gold", "गोल्ड": "gold",
  "केवाईसी": "kyc", "महँगाई": "inflation", "महंगाई": "inflation", "यूपीआई": "upi", "जमा": "deposit", "कार्ड": "card",
  "धोखाधड़ी": "fraud", "शिकायत": "complaint", "डिजिटल": "digital", "विदेशी": "forex", "पेंशन": "pension", "चेक": "cheque"
};

const stem = (w) => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
function words(s) {
  return s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, " ").split(" ").filter(Boolean).map((w) => HINDI[w] || w).map(stem);
}

// The question as a list of ideas, each a list of acceptable title words or phrases.
function questionIdeas(question) {
  const seen = new Set();
  return words(question)
    .filter((w) => !STOP.has(w) && (w.length > 1 || /\d/.test(w)) && !seen.has(w) && seen.add(w))
    .map((w) => ({ word: w, forms: SYNONYMS[w] || [w] }));
}

function scoreTitles(ideas, items) {
  const titles = items.map((i) => " " + words(i.title + " " + (i.group || "")).join(" ") + " ");
  const has = (t, form) => t.includes(" " + words(form).join(" ") + " ") || (form.length > 4 && t.includes(" " + stem(form)));
  // Rarer ideas count more (like a search engine's IDF).
  const weights = ideas.map((idea) => {
    const df = titles.filter((t) => idea.forms.some((f) => has(t, f))).length;
    return Math.log(1 + items.length / (1 + df));
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  return items.map((item, n) => {
    let got = 0;
    ideas.forEach((idea, k) => { if (idea.forms.some((f) => has(titles[n], f))) got += weights[k]; });
    const coverage = got / total;
    const bonus = item.kind === "master_direction" ? 1.1 : 1;
    return { item, coverage, score: coverage * bonus };
  }).sort((a, b) => b.score - a.score || dateValue(b.item.date) - dateValue(a.item.date));
}
const dateValue = (d) => Date.parse(d) || 0;

function pickBest(scored, wantsLatest) {
  const good = scored.filter((s) => s.coverage >= 0.6);
  if (!good.length) return null;
  if (wantsLatest) return good.slice().sort((a, b) => dateValue(b.item.date) - dateValue(a.item.date))[0].item;
  return good[0].item;
}

function searchTerms(question, ideas) {
  if (/repo|mpc|monetary policy|policy rate|rate (cut|hike)|रेपो/i.test(question)) return "Monetary Policy Statement Resolution";
  return ideas.map((i) => i.word).slice(0, 6).join(" ");
}

// ---------- Fallback: RBI's own words ----------
function bestParagraphs(text, ideas, count = 5) {
  const paras = text.split(/\n+/).map((p) => p.trim()).filter((p) => p.length >= 60 && !/^(table of contents|contents)$/i.test(p));
  const scored = paras.map((p, i) => {
    const t = " " + words(p).join(" ") + " ";
    const hits = ideas.filter((idea) => idea.forms.some((f) => t.includes(" " + words(f).join(" ")))).length;
    return { p, i, hits };
  });
  let chosen = scored.filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits).slice(0, count);
  if (!chosen.length) chosen = scored.slice(0, count);
  return chosen.sort((a, b) => a.i - b.i).map((s) => (s.p.length > 450 ? s.p.slice(0, 450) + "…" : s.p));
}

// The AI gets the start of the document plus the paragraphs that best match the question.
function textForAi(text, ideas) {
  if (text.length <= AI_TEXT_CHARS) return text;
  const head = text.slice(0, AI_TEXT_CHARS / 2);
  const extra = bestParagraphs(text.slice(AI_TEXT_CHARS / 2), ideas, 30).join("\n");
  return (head + "\n…\n" + extra).slice(0, AI_TEXT_CHARS);
}

// ---------- Main ----------
const publicItem = (i) => ({ kind: i.kind, title: i.title, url: i.url, date: i.date || "" });

// Asks the free AI which item the question means. Returns null if the AI is
// unavailable (daily free allowance used up, busy, or not set up).
async function aiPick(question, items) {
  try {
    const res = await fetch(workerUrl("/pick"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, items: items.map((i) => ({ kind: i.kind, date: i.date, title: i.title })) })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.best !== "number") {
      console.log("AI pick unavailable:", data.error, data.detail || "");
      return null;
    }
    return {
      item: data.best ? items[data.best - 1] : null,
      similar: (data.similar || []).map((n) => items[n - 1]).filter(Boolean),
      searches: Array.isArray(data.searches) ? data.searches : []
    };
  } catch (err) {
    console.log("AI pick failed:", err);
    return null;
  }
}

async function rbiSearch(terms) {
  if (!terms) return [];
  try {
    return parseRbiSearch(await (await rbiGet(RBI_SCRIPTS + "SearchResults.aspx?search=" + encodeURIComponent(terms))).text());
  } catch (err) {
    console.log("RBI search failed:", err);
    return [];
  }
}

const sameUrl = (a, b) => a.url.toLowerCase() === b.url.toLowerCase();
const dedupe = (list) => list.filter((x, i) => x && list.findIndex((y) => y && sameUrl(x, y)) === i);

async function liveAnswer(question, language, onStep = () => {}) {
  const checkedAt = new Date().toISOString();
  const ideas = questionIdeas(question);
  const wantsLatest = /latest|recent|new|current|today|this (week|month)|ताज़ा|नया|नई/i.test(question);

  // 1. RBI's lists, live.
  onStep(0);
  const lists = await Promise.allSettled(RBI_LISTS.map(async (l) => parseRbiList(await (await rbiGet(l.url)).text(), l.kind)));
  const items = lists.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (!items.length) throw new Error("RBI's website didn't respond. Please try again in a minute.");

  let item = null, similar = [];

  // 2. The free AI picks the matching item by meaning, like a chatbot.
  const ai = await aiPick(question, items);
  if (ai) {
    item = ai.item;
    similar = ai.similar;
    // Not in the lists: search RBI's site with the AI's suggested wording, then let the AI pick again.
    if (!item) {
      const terms = ai.searches.length ? ai.searches : [searchTerms(question, ideas)];
      const results = dedupe((await Promise.all(terms.map(rbiSearch))).flat()).filter((r) => !items.some((i) => sameUrl(i, r)));
      if (results.length) {
        const again = await aiPick(question, results);
        if (again) {
          item = again.item;
          similar = again.similar.concat(similar);
        }
      }
    }
  } else if (ideas.length) {
    // 3. AI unavailable: keyword matching. It's less clever, but free and always works.
    let pool = items;
    let scored = scoreTitles(ideas, pool);
    item = pickBest(scored, wantsLatest);
    if (!item) {
      pool = pool.concat((await rbiSearch(searchTerms(question, ideas))).filter((r) => !items.some((i) => sameUrl(i, r))));
      scored = scoreTitles(ideas, pool);
      item = pickBest(scored, wantsLatest);
    }
    similar = scored.filter((s) => s.coverage > 0).map((s) => s.item);
  }

  similar = dedupe(similar).filter((s) => !item || !sameUrl(s, item)).slice(0, 5).map(publicItem);
  if (!item) return { status: "not_found", similar, checked_at: checkedAt };

  // 3. Read the RBI document, live.
  onStep(1);
  const doc = await readRbiDocument(item.url);
  const source = { ...publicItem(item), pdf_url: doc.pdfUrl, partial: doc.cut || doc.text.length > AI_TEXT_CHARS };
  const base = { status: "found", checked_at: checkedAt, source, similar: similar.slice(0, 3) };

  // 4. Explain it with the free AI. If that's unavailable, show RBI's own words.
  onStep(2);
  try {
    const res = await fetch(workerUrl("/explain"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, language, title: item.title, url: item.url, date: item.date, text: textForAi(doc.text, ideas) })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.result) return { ...base, mode: "ai", result: data.result };
    console.log("AI unavailable:", data.error, data.detail || "");
  } catch (err) {
    console.log("AI request failed:", err);
  }
  const excerpts = bestParagraphs(doc.text, ideas, 7).filter((p) => p.trim() !== item.title.trim()).slice(0, 5);
  return { ...base, mode: "excerpt", excerpts };
}
