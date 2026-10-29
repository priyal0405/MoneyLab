// Built-in "quick explainer" for the RBI Explainer: reads a pasted headline with
// simple rules (cut / hike / hold, repo / CRR, how many bps, inflation…) and
// builds an explanation in the same shape as the AI's answer. Used when the AI
// backend isn't connected. No network needed.

function quickExplain(text, lang) {
  const t = text.toLowerCase();
  const has = (...words) => words.some((w) => t.includes(w));

  const aboutRbi = has("rbi", "reserve bank", "repo", "crr", "mpc", "monetary policy", "rate cut", "rate hike", "basis point", "bps", "inflation", "liquidity", "omo", "रेपो", "आरबीआई");
  if (!aboutRbi) return null;

  // What changed?
  const cut  = has("cut", "cuts", "reduce", "lower", "slash", "trim", "eases", "घटा");
  const hike = has("hike", "raise", "increase", "hikes", "tighten", "बढ़ा");
  const hold = has("unchanged", "hold", "holds", "keeps", "kept", "pause", "steady", "status quo", "maintain", "स्थिर");
  const action = hike && !cut ? "hike" : cut && !hike ? "cut" : hold ? "hold" : cut ? "cut" : "unclear";

  const crr = has("crr", "cash reserve");
  const repo = has("repo", "policy rate", "interest rate", "रेपो") || !crr;
  // Is the change itself to the CRR (e.g. "cuts CRR by 50 bps, keeps repo unchanged")?
  const crrMove = crr && /(cut|reduce|lower|raise|hike|increase)\w*\s+(the\s+)?(crr|cash reserve)|(crr|cash reserve ratio)\s+(cut|reduced|lowered|raised|hiked|increased)/.test(t);
  const repoHeld = crrMove && /repo[^.,;]*(unchanged|steady|hold|kept|keeps)|(unchanged|keeps|kept|holds)[^.,;]*repo/.test(t);
  const liquidity = has("liquidity", "omo", "open market", "swap", "lakh crore", "crore", "trillion");
  const inflationUp = /inflation[^.]*\b(rise|rising|rises|high|higher|up|surge|stubborn|sticky|risk)/.test(t);
  const inflationDown = /inflation[^.]*\b(cool|cools|cooling|ease|eases|easing|low|lower|fall|falls|soft)/.test(t);
  const rupee = has("rupee", "रुपया");
  const oil = has("crude", "oil");
  const stance = t.match(/\b(neutral|accommodative|tightening|withdrawal of accommodation)\b/);

  // How much? "25 bps", "50 basis points", "by 0.25%"
  let bps = null;
  const m1 = t.match(/(\d+)\s*(bps|basis\s*points?|bp)\b/);
  const m2 = t.match(/by\s*(\d+(?:\.\d+)?)\s*(%|per\s*cent|percent)/);
  if (m1) bps = Number(m1[1]);
  else if (m2) bps = Math.round(Number(m2[1]) * 100);
  const toRate = crrMove ? null : (t.match(/\bto\s*(\d+(?:\.\d+)?)\s*(%|per\s*cent|percent)/) || [])[1];

  // Rough EMI change on a ₹30 lakh, 20-year loan at about 8.5%.
  const emi = (rate) => { const r = rate / 1200, n = 240; return 3000000 * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1); };
  const emiDiff = bps && !crrMove ? Math.round(Math.abs(emi(8.5) - emi(8.5 + (action === "cut" ? -1 : 1) * bps / 100)) / 10) * 10 : null;
  const pct = bps ? `${bps / 100}%` : null;

  return lang === "hi" ? hindi() : english();

  function english() {
    const what = crrMove || (crr && !t.includes("repo")) ? "the CRR (the share of deposits banks must keep with the RBI)" : "the repo rate (the rate at which the RBI lends to banks)";
    const summary = {
      cut:  `The RBI lowered ${what}${pct ? ` by ${pct}` : ""}${toRate ? `, to ${toRate}%` : ""}.`,
      hike: `The RBI raised ${what}${pct ? ` by ${pct}` : ""}${toRate ? `, to ${toRate}%` : ""}.`,
      hold: `The RBI kept ${what} unchanged${toRate ? ` at ${toRate}%` : ""}.`,
      unclear: `This news is about RBI policy, but it doesn't clearly say whether rates were cut, raised or kept the same.`
    }[action] + (repoHeld ? " The repo rate stays the same." : "")
              + (liquidity && action !== "unclear" ? " It also involves adding or managing money (liquidity) in the banking system." : "")
              + (stance ? ` Its stance is "${stance[1]}".` : "");

    const whyParts = crrMove ? {
      cut:  "Cutting the CRR frees up money that banks had to park with the RBI, so they have more to lend. The RBI does this when it wants loans to flow more easily without changing the headline interest rate.",
      hike: "Raising the CRR locks up more of banks' money with the RBI, leaving less to lend. It's a way to cool lending and spending.",
      hold: "The RBI kept the CRR where it was.",
      unclear: "Look for words like \"cut\" or \"hike\" next to CRR to see which way it moved."
    }[action] : {
      cut:  "The RBI cuts rates when it wants borrowing to be cheaper, so people and businesses spend and invest more. It usually does this when inflation is under control or growth needs a push.",
      hike: "The RBI raises rates to slow down rising prices. Costlier loans mean people and businesses borrow and spend less, which cools demand.",
      hold: "The RBI keeps rates steady when it wants to wait and see, for example to let earlier changes take effect, or because the outlook for prices and growth is uncertain.",
      unclear: "Look for words like \"cut\", \"hike\" or \"unchanged\" to see which way the RBI moved."
    }[action];
    const extra = [
      inflationUp && "The text mentions inflation rising, which usually makes the RBI more careful about cutting rates.",
      inflationDown && "The text mentions inflation easing, which gives the RBI room to cut rates.",
      oil && "Crude oil prices matter because India imports most of its oil. Costlier oil raises fuel and transport costs.",
      rupee && "A weaker rupee makes imports (oil, electronics, gold) more expensive in ₹."
    ].filter(Boolean).join(" ");

    const loans = crrMove ? {
      cut:  { direction: "down", explanation: "With more money to lend, banks may trim loan rates slightly or approve loans more easily. The effect on EMIs is usually smaller and slower than a repo rate cut." },
      hike: { direction: "up", explanation: "With less money to lend, banks may raise loan rates slightly or become stricter about giving loans." },
      hold: { direction: "same", explanation: "No change for loans from this." },
      unclear: { direction: "unclear", explanation: "Depends on which way the CRR moved." }
    }[action] : {
      cut:  { direction: "down", explanation: `Loan rates and EMIs usually fall over the next few months.${emiDiff ? ` On a ₹30 lakh, 20-year home loan, a ${pct} cut is roughly ₹${emiDiff.toLocaleString("en-IN")} less per month, if your bank passes it on.` : ""}` },
      hike: { direction: "up",   explanation: `Loan rates and EMIs on floating-rate loans usually rise within a few months.${emiDiff ? ` On a ₹30 lakh, 20-year home loan, a ${pct} hike is roughly ₹${emiDiff.toLocaleString("en-IN")} more per month.` : ""}` },
      hold: { direction: "same", explanation: "No change for now, so EMIs on repo-linked loans stay the same." },
      unclear: { direction: "unclear", explanation: "Depends on whether rates were cut or raised." }
    }[action];
    const savings = crrMove ? {
      cut:  { direction: "same", explanation: "Little direct effect on FDs. With plenty of cash, banks are less eager to raise deposit rates, and some may trim them a little over time." },
      hike: { direction: "up", explanation: "Banks may offer a bit more on FDs to attract deposits they now need." },
      hold: { direction: "same", explanation: "No change for FDs from this." },
      unclear: { direction: "unclear", explanation: "Depends on which way the CRR moved." }
    }[action] : {
      cut:  { direction: "down", explanation: "Banks usually lower interest on new FDs too, so savers earn a bit less. FDs already opened keep their rate until maturity." },
      hike: { direction: "up",   explanation: "Banks usually offer more interest on new FDs, so savers can earn more." },
      hold: { direction: "same", explanation: "FD rates are likely to stay about where they are." },
      unclear: { direction: "unclear", explanation: "Depends on which way rates moved." }
    }[action];
    const prices = inflationUp
      ? { direction: "up", explanation: "The text points to rising inflation, so everyday prices may keep climbing for a while." }
      : action === "hike"
        ? { direction: "down", explanation: "Higher rates are meant to slow price rises over the next 6–12 months. Things don't get cheaper, but they rise more slowly." }
        : action === "cut"
          ? { direction: inflationDown ? "same" : "unclear", explanation: inflationDown ? "Inflation is easing, so this cut isn't expected to push prices up much." : "Cheaper loans can push spending, and prices, up a little later on." }
          : { direction: "same", explanation: "No big change to prices from this decision on its own." };

    const key_terms = [
      repo && { term: "Repo rate", meaning: "The interest rate at which the RBI lends money to banks. When it moves, loan and FD rates usually follow." },
      crr && { term: "CRR (Cash Reserve Ratio)", meaning: "The % of deposits banks must keep with the RBI and can't lend. Lower CRR = more money for loans." },
      bps && { term: "Basis points (bps)", meaning: `100 bps = 1%. So ${bps} bps = ${pct}.` },
      liquidity && { term: "Liquidity", meaning: "How much ready cash banks have to lend." },
      stance && { term: `"${stance[1]}" stance`, meaning: { neutral: "The RBI isn't leaning towards cuts or hikes; it will decide based on data.", accommodative: "The RBI is open to cutting rates further to support growth.", tightening: "The RBI is leaning towards raising rates to control inflation.", "withdrawal of accommodation": "The RBI is slowly pulling back the support it gave earlier." }[stance[1]] }
    ].filter(Boolean).slice(0, 4);

    return {
      is_relevant: true, summary, why: (whyParts + " " + extra).trim(), loans, savings, prices, key_terms,
      takeaway: { cut: "Rate cuts make borrowing cheaper and FDs a little less rewarding, with a delay of a few months.", hike: "Rate hikes make borrowing costlier and saving more rewarding. They're the RBI's brake on rising prices.", hold: "A pause means no change to your EMI for now. Watch inflation for the next move.", unclear: "Check the full RBI statement on rbi.org.in for the exact decision." }[action]
    };
  }

  function hindi() {
    const what = crrMove || (crr && !t.includes("repo")) ? "CRR (जमा का वह हिस्सा जो बैंकों को RBI के पास रखना होता है)" : "रेपो रेट (वह दर जिस पर RBI बैंकों को उधार देता है)";
    const summary = {
      cut:  `RBI ने ${what}${pct ? ` ${pct}` : ""} घटाया${toRate ? `, अब यह ${toRate}% है` : ""}।`,
      hike: `RBI ने ${what}${pct ? ` ${pct}` : ""} बढ़ाया${toRate ? `, अब यह ${toRate}% है` : ""}।`,
      hold: `RBI ने ${what} नहीं बदला${toRate ? `, यह ${toRate}% पर है` : ""}।`,
      unclear: "यह ख़बर RBI नीति के बारे में है, पर साफ़ नहीं है कि रेट घटा, बढ़ा या वहीं रहा।"
    }[action] + (repoHeld ? " रेपो रेट वही रहा।" : "")
              + (liquidity && action !== "unclear" ? " इसमें बैंकिंग सिस्टम में पैसा (लिक्विडिटी) डालने या संभालने की बात भी है।" : "")
              + (stance ? ` RBI का रुख "${stance[1]}" है।` : "");

    const whyParts = crrMove ? {
      cut:  "CRR घटाने से वह पैसा छूट जाता है जो बैंकों को RBI के पास रखना पड़ता था, तो उनके पास कर्ज़ देने को ज़्यादा पैसा होता है। RBI ऐसा तब करता है जब वह ब्याज दर बदले बिना कर्ज़ आसानी से पहुँचाना चाहता है।",
      hike: "CRR बढ़ाने से बैंकों का ज़्यादा पैसा RBI के पास बंद हो जाता है और कर्ज़ देने को कम बचता है। इससे कर्ज़ और खर्च ठंडे होते हैं।",
      hold: "RBI ने CRR नहीं बदला।",
      unclear: "CRR के साथ \"cut\" या \"hike\" जैसे शब्द देखें।"
    }[action] : {
      cut:  "RBI रेट तब घटाता है जब वह कर्ज़ सस्ता करना चाहता है, ताकि लोग और कंपनियाँ ज़्यादा खर्च और निवेश करें। आम तौर पर ऐसा तब होता है जब महँगाई काबू में हो या विकास को सहारा चाहिए।",
      hike: "RBI बढ़ते दामों को धीमा करने के लिए रेट बढ़ाता है। महँगे कर्ज़ से लोग कम उधार और कम खर्च करते हैं, जिससे माँग ठंडी होती है।",
      hold: "RBI रेट तब स्थिर रखता है जब वह रुककर देखना चाहता है, जैसे पिछले बदलावों का असर देखने के लिए, या जब आगे का हाल साफ़ न हो।",
      unclear: "\"cut\", \"hike\" या \"unchanged\" जैसे शब्द देखें, उनसे पता चलेगा कि RBI ने क्या किया।"
    }[action];
    const extra = [
      inflationUp && "ख़बर में महँगाई बढ़ने की बात है, जिससे RBI रेट घटाने में सावधानी बरतता है।",
      inflationDown && "ख़बर में महँगाई कम होने की बात है, जिससे RBI को रेट घटाने की गुंजाइश मिलती है।",
      oil && "कच्चे तेल के दाम अहम हैं क्योंकि भारत ज़्यादातर तेल बाहर से खरीदता है। महँगा तेल ईंधन और ढुलाई महँगी करता है।",
      rupee && "कमज़ोर रुपये से आयात (तेल, इलेक्ट्रॉनिक्स, सोना) ₹ में महँगा हो जाता है।"
    ].filter(Boolean).join(" ");

    const loans = crrMove ? {
      cut:  { direction: "down", explanation: "कर्ज़ देने को ज़्यादा पैसा होने से बैंक लोन दरें थोड़ी घटा सकते हैं या आसानी से लोन दे सकते हैं। EMI पर असर आम तौर पर रेपो कटौती से कम और धीमा होता है।" },
      hike: { direction: "up", explanation: "कर्ज़ देने को कम पैसा होने से बैंक लोन दरें थोड़ी बढ़ा सकते हैं या लोन देने में सख़्ती कर सकते हैं।" },
      hold: { direction: "same", explanation: "इससे लोन पर कोई बदलाव नहीं।" },
      unclear: { direction: "unclear", explanation: "यह इस पर निर्भर है कि CRR किस ओर गया।" }
    }[action] : {
      cut:  { direction: "down", explanation: `अगले कुछ महीनों में लोन दरें और EMI आम तौर पर घटती हैं।${emiDiff ? ` ₹30 लाख के 20 साल के होम लोन पर ${pct} कटौती से EMI लगभग ₹${emiDiff.toLocaleString("en-IN")} महीना कम हो सकती है, अगर बैंक फ़ायदा दे।` : ""}` },
      hike: { direction: "up",   explanation: `फ़्लोटिंग रेट लोन की EMI कुछ महीनों में आम तौर पर बढ़ती है।${emiDiff ? ` ₹30 लाख के 20 साल के होम लोन पर ${pct} बढ़ोतरी से EMI लगभग ₹${emiDiff.toLocaleString("en-IN")} महीना ज़्यादा हो सकती है।` : ""}` },
      hold: { direction: "same", explanation: "फ़िलहाल कोई बदलाव नहीं, इसलिए रेपो से जुड़े लोन की EMI वैसी ही रहेगी।" },
      unclear: { direction: "unclear", explanation: "यह इस पर निर्भर है कि रेट घटा या बढ़ा।" }
    }[action];
    const savings = crrMove ? {
      cut:  { direction: "same", explanation: "FD पर सीधा असर कम। ज़्यादा नकदी वाले बैंक जमा दरें बढ़ाने को उत्सुक नहीं होते, कुछ समय के साथ थोड़ा घटा भी सकते हैं।" },
      hike: { direction: "up", explanation: "बैंक जमा जुटाने के लिए FD पर थोड़ा ज़्यादा ब्याज दे सकते हैं।" },
      hold: { direction: "same", explanation: "इससे FD पर कोई बदलाव नहीं।" },
      unclear: { direction: "unclear", explanation: "यह इस पर निर्भर है कि CRR किस ओर गया।" }
    }[action] : {
      cut:  { direction: "down", explanation: "बैंक आम तौर पर नई FD पर ब्याज भी घटाते हैं। पहले से खुली FD पर पुरानी दर मिलती रहती है।" },
      hike: { direction: "up",   explanation: "बैंक आम तौर पर नई FD पर ज़्यादा ब्याज देते हैं, यानी बचत पर कमाई बढ़ सकती है।" },
      hold: { direction: "same", explanation: "FD दरें लगभग वहीं रहने की संभावना है।" },
      unclear: { direction: "unclear", explanation: "यह इस पर निर्भर है कि रेट किस ओर गया।" }
    }[action];
    const prices = inflationUp
      ? { direction: "up", explanation: "ख़बर बढ़ती महँगाई की ओर इशारा करती है, तो रोज़ के दाम कुछ समय तक बढ़ सकते हैं।" }
      : action === "hike"
        ? { direction: "down", explanation: "ऊँचे रेट का मकसद अगले 6–12 महीनों में दाम बढ़ने की रफ़्तार कम करना है। चीज़ें सस्ती नहीं होतीं, पर धीरे बढ़ती हैं।" }
        : action === "cut"
          ? { direction: inflationDown ? "same" : "unclear", explanation: inflationDown ? "महँगाई कम हो रही है, इसलिए इस कटौती से दाम ज़्यादा बढ़ने की उम्मीद नहीं।" : "सस्ते कर्ज़ से बाद में खर्च और दाम थोड़े बढ़ सकते हैं।" }
          : { direction: "same", explanation: "सिर्फ़ इस फ़ैसले से दामों में बड़ा बदलाव नहीं।" };

    const key_terms = [
      repo && { term: "रेपो रेट (Repo rate)", meaning: "वह ब्याज दर जिस पर RBI बैंकों को पैसा उधार देता है। यह बदलती है तो लोन और FD दरें भी आम तौर पर बदलती हैं।" },
      crr && { term: "CRR (कैश रिज़र्व रेशियो)", meaning: "जमा का वह % जो बैंकों को RBI के पास रखना होता है। CRR कम = कर्ज़ के लिए ज़्यादा पैसा।" },
      bps && { term: "बेसिस पॉइंट (bps)", meaning: `100 bps = 1%। यानी ${bps} bps = ${pct}।` },
      liquidity && { term: "लिक्विडिटी (Liquidity)", meaning: "बैंकों के पास कर्ज़ देने के लिए कितनी तैयार नकदी है।" },
      stance && { term: `"${stance[1]}" रुख`, meaning: { neutral: "RBI न घटाने की ओर झुका है, न बढ़ाने की ओर; फ़ैसला आँकड़ों पर होगा।", accommodative: "विकास के लिए RBI रेट और घटाने को तैयार है।", tightening: "महँगाई काबू करने के लिए RBI रेट बढ़ाने की ओर झुका है।", "withdrawal of accommodation": "RBI पहले दी गई ढील धीरे-धीरे वापस ले रहा है।" }[stance[1]] }
    ].filter(Boolean).slice(0, 4);

    return {
      is_relevant: true, summary, why: (whyParts + " " + extra).trim(), loans, savings, prices, key_terms,
      takeaway: { cut: "रेट कटौती से कर्ज़ सस्ता और FD थोड़ी कम फ़ायदेमंद होती है, कुछ महीनों की देरी से।", hike: "रेट बढ़ने से कर्ज़ महँगा और बचत ज़्यादा फ़ायदेमंद होती है। यह महँगाई पर RBI का ब्रेक है।", hold: "विराम का मतलब फ़िलहाल EMI में बदलाव नहीं। अगले कदम के लिए महँगाई पर नज़र रखें।", unclear: "सही फ़ैसले के लिए rbi.org.in पर RBI का पूरा बयान देखें।" }[action]
    };
  }
}
