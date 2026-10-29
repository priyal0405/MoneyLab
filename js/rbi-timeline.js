// Major RBI announcements, Jan 2025 – Sep 2026, with ready-made explanations in
// English and Hindi (same shape as the AI's answers). Newest first.
//
// Sources: RBI policy statements as reported by Business Standard, Upstox,
// Forbes India, Free Press Journal, Business Today, Vision IAS (checked 2026-10-29).
// No RBI policy meeting fell in September 2026 (Aug 3–5, then Oct).
//
// tag: "cut" | "hold" | "liquidity" | "inflation"     major: shown with a ⭐

const REPO_HISTORY = [
  // [date, repo rate %] — every change from Jan 2025, plus today's level
  ["2025-01-01", 6.50], ["2025-02-07", 6.25], ["2025-04-09", 6.00],
  ["2025-06-06", 5.50], ["2025-12-05", 5.25], ["2026-09-30", 5.25]
];

const RBI_TIMELINE = [
  {
    date: "2026-08-05", tag: "hold", rate: "5.25%",
    title: "Repo rate held at 5.25% for the fourth meeting in a row",
    headline: "RBI keeps repo rate unchanged at 5.25%, retains neutral stance; projects FY27 GDP growth at 6.7% and CPI inflation at 5%.",
    en: {
      is_relevant: true,
      summary: "The RBI kept the repo rate at 5.25%, unchanged since December 2025. All MPC members agreed, and the stance stayed \"neutral\".",
      why: "Inflation has picked up in 2026 because of costlier crude oil, but the RBI expects it to stay around 5% this year, so it doesn't feel the need to raise rates yet. Growth is still healthy (6.7% expected), so there's no reason to cut either. Holding steady lets it wait and watch.",
      loans: { direction: "same", explanation: "No change in the repo rate means EMIs on loans linked to it stay the same for now." },
      savings: { direction: "same", explanation: "FD rates are likely to stay roughly where they are. With inflation near 5%, an FD paying about 6.5% only just beats rising prices." },
      prices: { direction: "unclear", explanation: "Prices are rising faster than in 2025 (crude oil, global tensions). The RBI expects about 5% inflation this year, but oil prices could push it either way." },
      key_terms: [
        { term: "MPC", meaning: "The Monetary Policy Committee: 6 people (3 from RBI, 3 outside experts) who vote on the repo rate." },
        { term: "Neutral stance", meaning: "The RBI isn't leaning towards cutting or raising. It will decide based on new data." }
      ],
      takeaway: "When the RBI pauses, nothing changes for your EMI, but watch inflation: if it keeps rising, the next move is more likely up than down."
    },
    hi: {
      is_relevant: true,
      summary: "RBI ने रेपो रेट (repo rate) 5.25% पर ही रखा, जो दिसंबर 2025 से नहीं बदला है। MPC के सभी सदस्य सहमत थे और रुख \"न्यूट्रल\" रहा।",
      why: "2026 में महँगा कच्चा तेल (crude oil) महँगाई बढ़ा रहा है, पर RBI को लगता है कि इस साल यह लगभग 5% रहेगी, इसलिए अभी रेट बढ़ाने की ज़रूरत नहीं। विकास दर भी ठीक है (6.7% का अनुमान), तो घटाने की भी वजह नहीं। इसलिए RBI रुककर देख रहा है।",
      loans: { direction: "same", explanation: "रेपो रेट नहीं बदला, तो इससे जुड़े लोन की EMI फ़िलहाल वैसी ही रहेगी।" },
      savings: { direction: "same", explanation: "FD दरें लगभग वहीं रहने की संभावना है। महँगाई लगभग 5% है, तो 6.5% वाली FD बढ़ते दामों से बस थोड़ा ही आगे है।" },
      prices: { direction: "unclear", explanation: "2025 के मुकाबले दाम तेज़ी से बढ़ रहे हैं (कच्चा तेल, दुनिया में तनाव)। RBI को इस साल लगभग 5% महँगाई की उम्मीद है, पर तेल के दाम इसे ऊपर-नीचे कर सकते हैं।" },
      key_terms: [
        { term: "MPC", meaning: "मौद्रिक नीति समिति: 6 लोग (3 RBI से, 3 बाहरी विशेषज्ञ) जो रेपो रेट पर वोट करते हैं।" },
        { term: "न्यूट्रल रुख (Neutral stance)", meaning: "RBI न घटाने की ओर झुका है, न बढ़ाने की ओर। फ़ैसला नए आँकड़ों पर होगा।" }
      ],
      takeaway: "RBI रुकता है तो आपकी EMI नहीं बदलती, पर महँगाई पर नज़र रखें: अगर यह बढ़ती रही तो अगला कदम रेट बढ़ाना हो सकता है।"
    }
  },
  {
    date: "2026-06-05", tag: "hold", rate: "5.25%",
    title: "Rate on hold; inflation forecast raised to 5.1% as oil and West Asia worries grow",
    headline: "RBI keeps repo rate at 5.25%, raises FY27 inflation forecast to 5.1% and cuts GDP forecast to 6.6% amid West Asia conflict and high crude prices.",
    en: {
      is_relevant: true,
      summary: "The RBI kept the repo rate at 5.25%, but warned that prices may rise faster. It raised its inflation forecast for this year to 5.1% (from 4.6%) and cut its growth forecast to 6.6% (from 6.9%).",
      why: "Conflict in West Asia pushed up crude oil prices, and India imports most of its oil. Costlier oil raises fuel and transport costs, which feeds into almost everything. Weather risks (monsoon, El Niño) could also push up food prices. The RBI chose to wait rather than react immediately.",
      loans: { direction: "same", explanation: "EMIs don't change with this decision. But the hopes of more rate cuts have faded, so don't expect EMIs to fall soon." },
      savings: { direction: "same", explanation: "FD rates stay about the same. With inflation expected near 5%, the \"real\" return on FDs (after inflation) is getting thinner." },
      prices: { direction: "up", explanation: "The RBI itself expects prices to rise faster: about 5.1% this year, versus around 2% in 2025. Fuel, travel and food are the ones to watch." },
      key_terms: [
        { term: "Crude oil", meaning: "Raw oil from the ground, used to make petrol and diesel. India buys most of it from abroad, so global oil prices matter a lot here." },
        { term: "FY27", meaning: "Financial year 2026–27, which runs from April 2026 to March 2027." }
      ],
      takeaway: "Events far away, like a war that raises oil prices, can change India's inflation and interest rates."
    },
    hi: {
      is_relevant: true,
      summary: "RBI ने रेपो रेट 5.25% पर रखा, लेकिन चेतावनी दी कि दाम तेज़ी से बढ़ सकते हैं। इस साल का महँगाई अनुमान 4.6% से बढ़ाकर 5.1% और विकास दर का अनुमान 6.9% से घटाकर 6.6% किया।",
      why: "पश्चिम एशिया (West Asia) में संघर्ष से कच्चे तेल के दाम बढ़े, और भारत अपना ज़्यादातर तेल बाहर से खरीदता है। महँगा तेल पेट्रोल-डीज़ल और ढुलाई महँगी करता है, जिसका असर लगभग हर चीज़ पर पड़ता है। मानसून और एल-नीनो (El Niño) से खाने के दाम भी बढ़ सकते हैं। RBI ने तुरंत कदम उठाने के बजाय इंतज़ार चुना।",
      loans: { direction: "same", explanation: "इस फ़ैसले से EMI नहीं बदलेगी। पर रेट और घटने की उम्मीद कम हो गई है, तो जल्द EMI घटने की उम्मीद न करें।" },
      savings: { direction: "same", explanation: "FD दरें लगभग वैसी ही रहेंगी। महँगाई लगभग 5% होने से FD का \"असली\" फ़ायदा (महँगाई के बाद) कम होता जा रहा है।" },
      prices: { direction: "up", explanation: "RBI ख़ुद मान रहा है कि दाम तेज़ी से बढ़ेंगे: इस साल लगभग 5.1%, जबकि 2025 में यह लगभग 2% थी। ईंधन, सफ़र और खाने पर नज़र रखें।" },
      key_terms: [
        { term: "कच्चा तेल (Crude oil)", meaning: "ज़मीन से निकला तेल जिससे पेट्रोल-डीज़ल बनता है। भारत इसका ज़्यादातर हिस्सा विदेश से खरीदता है।" },
        { term: "FY27", meaning: "वित्त वर्ष 2026–27, यानी अप्रैल 2026 से मार्च 2027 तक।" }
      ],
      takeaway: "दूर की घटनाएँ, जैसे तेल के दाम बढ़ाने वाला युद्ध, भारत की महँगाई और ब्याज दरें बदल सकती हैं।"
    }
  },
  {
    date: "2026-04-08", tag: "hold", rate: "5.25%", major: true,
    title: "The mood turns: rate held, but inflation risks rise with costlier oil and a weak rupee",
    headline: "RBI keeps repo rate unchanged at 5.25% in first policy of FY27; raises inflation forecast to 4.6% on higher crude prices and a record-low rupee.",
    en: {
      is_relevant: true,
      summary: "In its first meeting of the new financial year, the RBI kept the repo rate at 5.25%. It raised its inflation forecast for 2026–27 to 4.6% (from 4.2%) and trimmed its growth forecast to 6.9%.",
      why: "This is a turning point. In 2025 prices were rising very slowly, so the RBI kept cutting rates. Now crude oil has become costlier and the rupee hit a record low against the dollar in March. A weaker rupee makes imports like oil, electronics and gold more expensive in ₹. So the RBI stopped thinking about more cuts and started watching inflation closely.",
      loans: { direction: "same", explanation: "EMIs stay the same. The period of falling loan rates that began in 2025 has most likely ended." },
      savings: { direction: "same", explanation: "FD rates are steady. Banks had already lowered them during 2025, so they're unlikely to fall much more." },
      prices: { direction: "up", explanation: "Costlier oil and a weaker rupee mean imported goods and fuel get pricier. The RBI expects inflation to rise from very low levels in 2025." },
      key_terms: [
        { term: "Rupee at a record low", meaning: "One US dollar costs more rupees than ever before. Things India buys from abroad get more expensive." },
        { term: "Inflation forecast", meaning: "The RBI's estimate of how fast prices will rise over the next year." }
      ],
      takeaway: "Interest rates follow inflation. When prices start rising faster, the RBI stops cutting rates, even if it doesn't raise them yet."
    },
    hi: {
      is_relevant: true,
      summary: "नए वित्त वर्ष की पहली बैठक में RBI ने रेपो रेट 5.25% पर रखा। 2026–27 का महँगाई अनुमान 4.2% से बढ़ाकर 4.6% किया और विकास दर का अनुमान घटाकर 6.9% किया।",
      why: "यह एक मोड़ है। 2025 में दाम बहुत धीरे बढ़ रहे थे, इसलिए RBI रेट घटाता रहा। अब कच्चा तेल महँगा हुआ है और मार्च में रुपया डॉलर के मुकाबले रिकॉर्ड निचले स्तर पर पहुँचा। कमज़ोर रुपये से तेल, इलेक्ट्रॉनिक्स और सोने जैसी आयात की चीज़ें ₹ में महँगी हो जाती हैं। इसलिए RBI ने और कटौती का विचार छोड़कर महँगाई पर ध्यान देना शुरू किया।",
      loans: { direction: "same", explanation: "EMI वैसी ही रहेगी। 2025 में शुरू हुआ लोन सस्ते होने का दौर शायद अब ख़त्म हो गया है।" },
      savings: { direction: "same", explanation: "FD दरें स्थिर हैं। बैंक 2025 में ही इन्हें घटा चुके थे, तो अब और ज़्यादा घटने की संभावना कम है।" },
      prices: { direction: "up", explanation: "महँगा तेल और कमज़ोर रुपया मतलब आयात की चीज़ें और ईंधन महँगे होंगे। RBI को 2025 के बहुत निचले स्तर से महँगाई बढ़ने की उम्मीद है।" },
      key_terms: [
        { term: "रुपया रिकॉर्ड निचले स्तर पर", meaning: "एक डॉलर के लिए पहले से कहीं ज़्यादा रुपये देने पड़ते हैं, इसलिए विदेश से आने वाली चीज़ें महँगी हो जाती हैं।" },
        { term: "महँगाई अनुमान (Inflation forecast)", meaning: "अगले साल दाम कितनी तेज़ी से बढ़ेंगे, इसका RBI का अंदाज़ा।" }
      ],
      takeaway: "ब्याज दरें महँगाई के पीछे चलती हैं। जब दाम तेज़ी से बढ़ने लगते हैं, RBI रेट घटाना बंद कर देता है, भले ही अभी बढ़ाए नहीं।"
    }
  },
  {
    date: "2026-02-06", tag: "hold", rate: "5.25%",
    title: "First pause after the 2025 rate cuts",
    headline: "RBI MPC keeps repo rate unchanged at 5.25%, retains neutral stance by a 5:1 vote.",
    en: {
      is_relevant: true,
      summary: "After cutting rates four times in 2025, the RBI paused and kept the repo rate at 5.25%. Five of the six MPC members voted to keep the \"neutral\" stance; one wanted a softer, \"accommodative\" stance.",
      why: "The RBI had already lowered rates by 1.25% in 2025, and it takes months for that to fully reach loans and the economy. So it chose to wait and see the effect before doing more.",
      loans: { direction: "same", explanation: "No new change. But if your bank hasn't yet passed on all of 2025's cuts, your EMI may still drift down a little." },
      savings: { direction: "same", explanation: "FD rates stay around their new, lower levels after 2025's cuts." },
      prices: { direction: "same", explanation: "Inflation was low at this point, so the RBI wasn't worried about prices yet." },
      key_terms: [
        { term: "Pause", meaning: "Keeping the rate unchanged for now, usually to see how earlier changes are working." },
        { term: "Accommodative stance", meaning: "Leaning towards cutting rates further to support growth." }
      ],
      takeaway: "Rate changes work with a delay, so the RBI often pauses after a series of cuts to let them take effect."
    },
    hi: {
      is_relevant: true,
      summary: "2025 में चार बार रेट घटाने के बाद RBI रुका और रेपो रेट 5.25% पर रखा। MPC के छह में से पाँच सदस्यों ने \"न्यूट्रल\" रुख के पक्ष में वोट दिया; एक सदस्य नरम, \"अकॉमोडेटिव\" रुख चाहते थे।",
      why: "RBI 2025 में रेट 1.25% घटा चुका था, और इसका पूरा असर लोन और अर्थव्यवस्था तक पहुँचने में महीनों लगते हैं। इसलिए उसने और कदम उठाने से पहले असर देखने का फ़ैसला किया।",
      loans: { direction: "same", explanation: "कोई नया बदलाव नहीं। पर अगर आपके बैंक ने 2025 की पूरी कटौती अभी तक नहीं दी है, तो EMI थोड़ी और घट सकती है।" },
      savings: { direction: "same", explanation: "2025 की कटौतियों के बाद FD दरें अपने नए, कम स्तर पर बनी रहेंगी।" },
      prices: { direction: "same", explanation: "उस समय महँगाई कम थी, इसलिए RBI को दामों की चिंता नहीं थी।" },
      key_terms: [
        { term: "विराम (Pause)", meaning: "रेट फ़िलहाल न बदलना, आम तौर पर पिछले बदलावों का असर देखने के लिए।" },
        { term: "अकॉमोडेटिव रुख", meaning: "विकास को सहारा देने के लिए रेट और घटाने की ओर झुकाव।" }
      ],
      takeaway: "रेट बदलने का असर देर से दिखता है, इसलिए कई कटौतियों के बाद RBI अक्सर रुककर असर देखता है।"
    }
  },
  {
    date: "2025-12-23", tag: "liquidity", rate: "5.25%",
    title: "₹2 lakh crore bond purchases + $10 billion swap to add money to banks",
    headline: "RBI announces ₹2 lakh crore of OMO bond purchases and a $10 billion dollar-rupee swap to inject liquidity into the banking system.",
    en: {
      is_relevant: true,
      summary: "The RBI said it would buy ₹2 lakh crore of government bonds from banks in four parts (Dec 29 – Jan 22) and run a $10 billion dollar-rupee swap in January 2026. Both put more rupees into the banking system.",
      why: "Banks were running short of ready cash, partly because the RBI had sold dollars to support the falling rupee, which pulls rupees out of the system. Without enough cash, banks can't pass on rate cuts properly. Adding money helps December's rate cut actually reach borrowers.",
      loans: { direction: "down", explanation: "More cash with banks makes it easier for them to lend and to lower loan rates in line with the repo cut." },
      savings: { direction: "same", explanation: "Little direct effect on FDs. Banks with plenty of cash are less eager to raise deposit rates." },
      prices: { direction: "same", explanation: "A one-time cash boost to banks has little immediate effect on everyday prices." },
      key_terms: [
        { term: "OMO (Open Market Operation)", meaning: "The RBI buying or selling government bonds. When it buys, it pays banks in rupees, giving them more cash." },
        { term: "Dollar-rupee swap", meaning: "The RBI buys dollars from banks now (paying in rupees) and agrees to sell them back later. It's a temporary way to add rupees." }
      ],
      takeaway: "Besides the repo rate, the RBI can control how much cash banks have, and that also affects how cheap loans become."
    },
    hi: {
      is_relevant: true,
      summary: "RBI ने कहा कि वह बैंकों से ₹2 लाख करोड़ के सरकारी बॉन्ड चार हिस्सों में (29 दिसंबर – 22 जनवरी) खरीदेगा, और जनवरी 2026 में $10 अरब का डॉलर-रुपया स्वैप करेगा। दोनों से बैंकिंग सिस्टम में ज़्यादा रुपये आते हैं।",
      why: "बैंकों के पास नकदी कम पड़ रही थी। इसकी एक वजह यह थी कि RBI ने गिरते रुपये को सहारा देने के लिए डॉलर बेचे, जिससे सिस्टम से रुपये निकल जाते हैं। पर्याप्त नकदी के बिना बैंक रेट कटौती ठीक से आगे नहीं दे पाते। पैसा डालने से दिसंबर की कटौती कर्ज़ लेने वालों तक पहुँचती है।",
      loans: { direction: "down", explanation: "बैंकों के पास ज़्यादा नकदी होने से उनके लिए कर्ज़ देना और रेपो कटौती के हिसाब से लोन दरें घटाना आसान होता है।" },
      savings: { direction: "same", explanation: "FD पर सीधा असर कम। ज़्यादा नकदी वाले बैंक जमा दरें बढ़ाने को उत्सुक नहीं होते।" },
      prices: { direction: "same", explanation: "बैंकों को एक बार की नकदी मदद का रोज़ के दामों पर तुरंत असर कम होता है।" },
      key_terms: [
        { term: "OMO (ओपन मार्केट ऑपरेशन)", meaning: "RBI का सरकारी बॉन्ड खरीदना या बेचना। जब वह खरीदता है तो बैंकों को रुपये देता है, जिससे उनके पास ज़्यादा नकदी आती है।" },
        { term: "डॉलर-रुपया स्वैप", meaning: "RBI अभी बैंकों से डॉलर खरीदता है (रुपये देकर) और बाद में वापस बेचने का वादा करता है। रुपये डालने का अस्थायी तरीका।" }
      ],
      takeaway: "रेपो रेट के अलावा RBI यह भी तय कर सकता है कि बैंकों के पास कितनी नकदी हो, और इससे भी तय होता है कि लोन कितने सस्ते होंगे।"
    }
  },
  {
    date: "2025-12-05", tag: "cut", rate: "5.25%", major: true,
    title: "Fourth cut of 2025: repo rate down to 5.25%, plus ₹1 lakh crore cash boost",
    headline: "RBI cuts repo rate by 25 bps to 5.25%, keeps neutral stance; announces ₹1 lakh crore OMO purchases and a $5 billion dollar-rupee swap. FY26 growth seen at 7.3%.",
    en: {
      is_relevant: true,
      summary: "The RBI cut the repo rate by 0.25% to 5.25%. That brought 2025's total cut to 1.25% (from 6.50%). It also announced ₹1 lakh crore of bond purchases and a $5 billion swap to give banks more cash.",
      why: "Inflation was extremely low, close to record lows, while the economy was growing strongly (7.3% expected). With prices barely rising, the RBI had room to make loans cheaper. The rupee had also hit a record low, and the cash measures made sure banks had enough money despite that.",
      loans: { direction: "down", explanation: "Another 0.25% off. Together with the earlier cuts, a ₹30 lakh, 20-year home loan EMI could be about ₹2,300 a month lower than at the start of 2025, if fully passed on." },
      savings: { direction: "down", explanation: "FD rates fell through 2025 as banks followed the RBI. New FDs earn noticeably less than they did a year earlier." },
      prices: { direction: "same", explanation: "Prices were rising very slowly at this time, so the cut wasn't expected to cause much inflation." },
      key_terms: [
        { term: "125 basis points", meaning: "1.25%. That's the total amount the RBI cut the repo rate during 2025." },
        { term: "Liquidity", meaning: "How much ready cash banks have to lend." }
      ],
      takeaway: "2025 was a year of cheaper loans and lower FD returns, because inflation was low enough for the RBI to keep cutting."
    },
    hi: {
      is_relevant: true,
      summary: "RBI ने रेपो रेट 0.25% घटाकर 5.25% किया। इससे 2025 में कुल कटौती 1.25% हो गई (6.50% से)। साथ ही बैंकों को ज़्यादा नकदी देने के लिए ₹1 लाख करोड़ की बॉन्ड खरीद और $5 अरब के स्वैप की घोषणा की।",
      why: "महँगाई बेहद कम थी, लगभग रिकॉर्ड निचले स्तर पर, जबकि अर्थव्यवस्था तेज़ी से बढ़ रही थी (7.3% का अनुमान)। दाम मुश्किल से बढ़ रहे थे, तो RBI के पास कर्ज़ सस्ता करने की गुंजाइश थी। रुपया भी रिकॉर्ड निचले स्तर पर था, और नकदी के उपायों से यह पक्का किया गया कि बैंकों के पास फिर भी पर्याप्त पैसा रहे।",
      loans: { direction: "down", explanation: "0.25% और कम। पहले की कटौतियों को मिलाकर ₹30 लाख के 20 साल के होम लोन की EMI 2025 की शुरुआत से लगभग ₹2,300 महीना कम हो सकती है, अगर बैंक पूरा फ़ायदा दे।" },
      savings: { direction: "down", explanation: "2025 में बैंकों ने RBI के साथ-साथ FD दरें घटाईं। नई FD पर साल भर पहले से साफ़ तौर पर कम ब्याज मिलता है।" },
      prices: { direction: "same", explanation: "उस समय दाम बहुत धीरे बढ़ रहे थे, इसलिए इस कटौती से ज़्यादा महँगाई की उम्मीद नहीं थी।" },
      key_terms: [
        { term: "125 बेसिस पॉइंट", meaning: "1.25%। 2025 में RBI ने रेपो रेट में कुल इतनी कटौती की।" },
        { term: "लिक्विडिटी (Liquidity)", meaning: "बैंकों के पास कर्ज़ देने के लिए कितनी तैयार नकदी है।" }
      ],
      takeaway: "2025 सस्ते लोन और कम FD रिटर्न का साल था, क्योंकि महँगाई इतनी कम थी कि RBI रेट घटाता रहा।"
    }
  },
  {
    date: "2025-11-12", tag: "inflation", rate: "5.50%", major: true,
    title: "Inflation falls to a record low of 0.25% (October 2025)",
    headline: "India's retail inflation (CPI) falls to a record low of 0.25% in October 2025.",
    en: {
      is_relevant: true,
      summary: "Government data showed prices in October 2025 were just 0.25% higher than a year earlier, the lowest retail inflation on record. This wasn't an RBI decision, but it shaped what the RBI did next.",
      why: "Food prices (especially vegetables and pulses) fell sharply, and GST rates on many everyday goods were cut in September 2025. Together, these kept overall prices almost flat.",
      loans: { direction: "down", explanation: "Very low inflation gave the RBI room to cut rates again. It did so in December, which helped lower EMIs." },
      savings: { direction: "same", explanation: "Here's a silver lining for savers: with prices barely rising, even a lower FD rate of about 6.5% gave a strong \"real\" return after inflation." },
      prices: { direction: "down", explanation: "Prices were almost flat compared with a year before. Some foods were actually cheaper." },
      key_terms: [
        { term: "CPI inflation", meaning: "How much prices of a typical basket of household goods (food, fuel, clothes, rent…) rose compared with a year ago." },
        { term: "Real return", meaning: "What you earn after inflation. A 6.5% FD with 0.25% inflation gives about 6.25% real return." }
      ],
      takeaway: "What matters isn't just your FD rate, but your FD rate minus inflation. Low inflation can make even modest returns worthwhile."
    },
    hi: {
      is_relevant: true,
      summary: "सरकारी आँकड़ों के अनुसार अक्टूबर 2025 में दाम साल भर पहले से सिर्फ़ 0.25% ज़्यादा थे। यह अब तक की सबसे कम खुदरा महँगाई है। यह RBI का फ़ैसला नहीं था, पर इसी से RBI का अगला कदम तय हुआ।",
      why: "खाने की चीज़ों (ख़ासकर सब्ज़ियों और दालों) के दाम तेज़ी से गिरे, और सितंबर 2025 में कई रोज़मर्रा की चीज़ों पर GST घटाया गया। दोनों ने मिलकर कुल दामों को लगभग स्थिर रखा।",
      loans: { direction: "down", explanation: "बहुत कम महँगाई से RBI को फिर रेट घटाने की गुंजाइश मिली। दिसंबर में उसने ऐसा किया, जिससे EMI घटी।" },
      savings: { direction: "same", explanation: "बचत करने वालों के लिए अच्छी बात: दाम मुश्किल से बढ़ रहे थे, तो लगभग 6.5% की FD भी महँगाई के बाद अच्छा \"असली\" फ़ायदा दे रही थी।" },
      prices: { direction: "down", explanation: "दाम साल भर पहले के लगभग बराबर थे। कुछ खाने की चीज़ें तो सस्ती भी हुईं।" },
      key_terms: [
        { term: "CPI महँगाई", meaning: "घर की आम चीज़ों (खाना, ईंधन, कपड़े, किराया…) के दाम साल भर पहले के मुकाबले कितने बढ़े।" },
        { term: "असली रिटर्न (Real return)", meaning: "महँगाई के बाद की कमाई। 6.5% FD और 0.25% महँगाई = लगभग 6.25% असली रिटर्न।" }
      ],
      takeaway: "सिर्फ़ FD की दर नहीं, बल्कि FD दर में से महँगाई घटाकर देखें। कम महँगाई में साधारण रिटर्न भी अच्छा होता है।"
    }
  },
  {
    date: "2025-10-01", tag: "hold", rate: "5.50%",
    title: "Rate held at 5.50%; growth forecast raised to 6.8%",
    headline: "RBI keeps repo rate unchanged at 5.5%, maintains neutral stance; revises FY26 GDP growth forecast up to 6.8%.",
    en: {
      is_relevant: true,
      summary: "The RBI kept the repo rate at 5.50% for the second meeting in a row and raised its growth forecast for the year to 6.8%.",
      why: "The big June cuts were still working their way through to loans. The economy was doing well, and the September 2025 GST rate cuts were expected to lower prices. So the RBI chose to wait and see their combined effect.",
      loans: { direction: "same", explanation: "No change this time, but banks were still passing on the earlier cuts, so many borrowers saw EMIs ease." },
      savings: { direction: "same", explanation: "FD rates had already come down after June's cut and stayed at those lower levels." },
      prices: { direction: "down", explanation: "GST cuts on everyday items and cheaper food were pulling inflation down to very low levels." },
      key_terms: [
        { term: "GDP growth", meaning: "How fast the total value of everything India produces is growing. 6.8% is strong." },
        { term: "GST", meaning: "Goods and Services Tax, the tax added to most things you buy. Lower GST = lower prices." }
      ],
      takeaway: "The government (through taxes like GST) and the RBI (through interest rates) both affect the prices you pay."
    },
    hi: {
      is_relevant: true,
      summary: "RBI ने लगातार दूसरी बैठक में रेपो रेट 5.50% पर रखा और साल के लिए विकास दर का अनुमान बढ़ाकर 6.8% किया।",
      why: "जून की बड़ी कटौतियों का असर अभी लोन तक पहुँच रहा था। अर्थव्यवस्था अच्छा कर रही थी, और सितंबर 2025 में GST घटने से दाम कम होने की उम्मीद थी। इसलिए RBI ने इन सबका मिला-जुला असर देखने का फ़ैसला किया।",
      loans: { direction: "same", explanation: "इस बार कोई बदलाव नहीं, पर बैंक अभी भी पिछली कटौतियाँ आगे दे रहे थे, तो कई लोगों की EMI कम हुई।" },
      savings: { direction: "same", explanation: "जून की कटौती के बाद FD दरें पहले ही घट चुकी थीं और उसी कम स्तर पर रहीं।" },
      prices: { direction: "down", explanation: "रोज़ की चीज़ों पर GST कटौती और सस्ते खाने से महँगाई बहुत नीचे आ रही थी।" },
      key_terms: [
        { term: "GDP विकास दर", meaning: "भारत में बनने वाली हर चीज़ का कुल मूल्य कितनी तेज़ी से बढ़ रहा है। 6.8% अच्छी दर है।" },
        { term: "GST", meaning: "वस्तु एवं सेवा कर, जो ज़्यादातर चीज़ों पर लगता है। कम GST = कम दाम।" }
      ],
      takeaway: "सरकार (GST जैसे टैक्स से) और RBI (ब्याज दरों से), दोनों आपके चुकाए दामों पर असर डालते हैं।"
    }
  },
  {
    date: "2025-08-06", tag: "hold", rate: "5.50%",
    title: "Pause at 5.50% after three cuts in a row",
    headline: "RBI MPC unanimously keeps repo rate unchanged at 5.50%, retains neutral stance.",
    en: {
      is_relevant: true,
      summary: "After cutting rates by a total of 1% between February and June, the RBI kept the repo rate at 5.50%. All six MPC members agreed.",
      why: "The RBI had already moved fast, so it wanted time to see the full effect of its cuts. There was also uncertainty from new US tariffs (import taxes) on Indian goods, which made it sensible to wait.",
      loans: { direction: "same", explanation: "No new cut, but banks were still lowering loan rates to reflect the earlier 1% of cuts." },
      savings: { direction: "same", explanation: "FD rates had been falling since February and roughly settled here." },
      prices: { direction: "same", explanation: "Inflation was low and expected to stay low, so prices weren't a big concern." },
      key_terms: [
        { term: "Tariff", meaning: "A tax a country puts on goods imported from another country." },
        { term: "Unanimous", meaning: "Everyone on the committee voted the same way." }
      ],
      takeaway: "Rate cuts reach your EMI with a delay, so a pause doesn't mean loans stop getting cheaper straight away."
    },
    hi: {
      is_relevant: true,
      summary: "फ़रवरी से जून के बीच कुल 1% कटौती के बाद RBI ने रेपो रेट 5.50% पर रखा। MPC के सभी छह सदस्य सहमत थे।",
      why: "RBI पहले ही तेज़ी से कदम उठा चुका था, इसलिए वह कटौतियों का पूरा असर देखना चाहता था। भारतीय सामान पर अमेरिका के नए टैरिफ़ (आयात कर) से भी अनिश्चितता थी, इसलिए रुकना समझदारी थी।",
      loans: { direction: "same", explanation: "नई कटौती नहीं, पर बैंक पिछली 1% कटौती के हिसाब से लोन दरें अभी भी घटा रहे थे।" },
      savings: { direction: "same", explanation: "FD दरें फ़रवरी से घट रही थीं और अब लगभग यहीं ठहर गईं।" },
      prices: { direction: "same", explanation: "महँगाई कम थी और कम रहने की उम्मीद थी, इसलिए दामों की ज़्यादा चिंता नहीं थी।" },
      key_terms: [
        { term: "टैरिफ़ (Tariff)", meaning: "वह टैक्स जो कोई देश दूसरे देश से आने वाले सामान पर लगाता है।" },
        { term: "सर्वसम्मति (Unanimous)", meaning: "समिति के सभी सदस्यों ने एक जैसा वोट दिया।" }
      ],
      takeaway: "रेट कटौती का असर EMI तक देर से पहुँचता है, इसलिए विराम का मतलब यह नहीं कि लोन तुरंत सस्ते होना बंद हो जाएँ।"
    }
  },
  {
    date: "2025-06-06", tag: "cut", rate: "5.50%", major: true,
    title: "Surprise \"jumbo\" cut: repo rate down 0.50% to 5.50%, CRR cut from 4% to 3%",
    headline: "RBI cuts repo rate by 50 bps to 5.50% and CRR by 100 bps to 3% in four tranches; changes stance from accommodative to neutral.",
    en: {
      is_relevant: true,
      summary: "The RBI surprised everyone with a big 0.50% cut, taking the repo rate to 5.50%. It also cut the CRR (cash banks must park with the RBI) from 4% to 3% in four steps between September and November, freeing up about ₹2.5 lakh crore for lending. Its stance changed back to \"neutral\".",
      why: "Inflation had fallen well below the RBI's 4% target, so it chose to \"front-load\": make one big move instead of several small ones, to boost growth quickly. Switching to neutral was a signal that there may not be many more cuts after this.",
      loans: { direction: "down", explanation: "This was the biggest single drop of 2025. A ₹30 lakh, 20-year home loan EMI could fall by roughly ₹900 a month from this cut alone, if your bank passes it on." },
      savings: { direction: "down", explanation: "Banks cut FD rates soon after. Many 1-year FDs fell to around 6.25–6.75%. Locking in a longer FD before rates fell further helped some savers." },
      prices: { direction: "same", explanation: "Inflation was low, so the RBI wasn't worried that cheaper loans would push prices up much." },
      key_terms: [
        { term: "CRR (Cash Reserve Ratio)", meaning: "The % of deposits banks must keep with the RBI and can't lend. Lower CRR = more money for loans." },
        { term: "Front-loading", meaning: "Doing a big change all at once instead of spreading it out." }
      ],
      takeaway: "A big rate cut is good news for borrowers but not for FD savers. Both sides of the same decision matter."
    },
    hi: {
      is_relevant: true,
      summary: "RBI ने सबको चौंकाते हुए 0.50% की बड़ी कटौती की और रेपो रेट 5.50% कर दिया। साथ ही CRR (वह नकदी जो बैंकों को RBI के पास रखनी होती है) सितंबर से नवंबर के बीच चार हिस्सों में 4% से घटाकर 3% किया, जिससे कर्ज़ देने के लिए लगभग ₹2.5 लाख करोड़ मिले। रुख वापस \"न्यूट्रल\" किया गया।",
      why: "महँगाई RBI के 4% लक्ष्य से काफ़ी नीचे आ गई थी, इसलिए RBI ने कई छोटी कटौतियों के बजाय एक बड़ा कदम उठाया, ताकि विकास को जल्दी सहारा मिले। न्यूट्रल रुख का संकेत था कि इसके बाद शायद ज़्यादा कटौतियाँ न हों।",
      loans: { direction: "down", explanation: "यह 2025 की सबसे बड़ी एक-बार की कमी थी। ₹30 लाख के 20 साल के होम लोन की EMI सिर्फ़ इसी कटौती से लगभग ₹900 महीना घट सकती है, अगर बैंक फ़ायदा दे।" },
      savings: { direction: "down", explanation: "बैंकों ने जल्द ही FD दरें घटाईं। कई 1 साल की FD लगभग 6.25–6.75% पर आ गईं। दरें और गिरने से पहले लंबी FD करवाने वालों को फ़ायदा हुआ।" },
      prices: { direction: "same", explanation: "महँगाई कम थी, इसलिए RBI को चिंता नहीं थी कि सस्ते लोन से दाम ज़्यादा बढ़ेंगे।" },
      key_terms: [
        { term: "CRR (कैश रिज़र्व रेशियो)", meaning: "जमा का वह % जो बैंकों को RBI के पास रखना होता है और उधार नहीं दे सकते। CRR कम = कर्ज़ के लिए ज़्यादा पैसा।" },
        { term: "फ़्रंट-लोडिंग", meaning: "बदलाव को धीरे-धीरे करने के बजाय एक साथ बड़ा कदम उठाना।" }
      ],
      takeaway: "बड़ी रेट कटौती कर्ज़ लेने वालों के लिए अच्छी, पर FD वालों के लिए कम अच्छी ख़बर है। एक ही फ़ैसले के दोनों पहलू मायने रखते हैं।"
    }
  },
  {
    date: "2025-04-09", tag: "cut", rate: "6.00%",
    title: "Second cut: repo rate down to 6.00%, stance turns \"accommodative\"",
    headline: "RBI cuts repo rate by 25 bps to 6%, changes policy stance from neutral to accommodative.",
    en: {
      is_relevant: true,
      summary: "The RBI cut the repo rate by another 0.25%, to 6.00%, and changed its stance to \"accommodative\". That's a clear signal that more cuts could follow.",
      why: "Inflation was cooling, especially food prices, while new US tariffs threatened to slow global trade and India's exports. Cheaper loans were meant to keep India's economy growing despite the global worries.",
      loans: { direction: "down", explanation: "EMIs on repo-linked loans fell again, by roughly ₹450 a month on a ₹30 lakh, 20-year home loan." },
      savings: { direction: "down", explanation: "FD rates continued to slip as banks adjusted to lower rates." },
      prices: { direction: "same", explanation: "Inflation was falling, so this cut wasn't expected to push prices up." },
      key_terms: [
        { term: "Accommodative stance", meaning: "The RBI is ready to cut rates further to support growth." },
        { term: "Repo-linked loan", meaning: "A loan whose rate is tied to the repo rate, so it changes soon after RBI decisions." }
      ],
      takeaway: "The RBI's \"stance\" is a hint about its next moves. \"Accommodative\" means more cuts are likely."
    },
    hi: {
      is_relevant: true,
      summary: "RBI ने रेपो रेट 0.25% और घटाकर 6.00% किया और अपना रुख \"अकॉमोडेटिव\" कर दिया। यह साफ़ संकेत था कि आगे और कटौतियाँ हो सकती हैं।",
      why: "महँगाई, ख़ासकर खाने के दाम, कम हो रहे थे, जबकि अमेरिका के नए टैरिफ़ से दुनिया के व्यापार और भारत के निर्यात पर ख़तरा था। सस्ते कर्ज़ का मकसद था कि दुनिया की चिंताओं के बावजूद भारत की अर्थव्यवस्था बढ़ती रहे।",
      loans: { direction: "down", explanation: "रेपो से जुड़े लोन की EMI फिर घटी, ₹30 लाख के 20 साल के होम लोन पर लगभग ₹450 महीना।" },
      savings: { direction: "down", explanation: "बैंकों के कम दरों के हिसाब से ढलने पर FD दरें घटती रहीं।" },
      prices: { direction: "same", explanation: "महँगाई गिर रही थी, इसलिए इस कटौती से दाम बढ़ने की उम्मीद नहीं थी।" },
      key_terms: [
        { term: "अकॉमोडेटिव रुख", meaning: "विकास को सहारा देने के लिए RBI रेट और घटाने को तैयार है।" },
        { term: "रेपो-लिंक्ड लोन", meaning: "ऐसा लोन जिसकी दर रेपो रेट से जुड़ी होती है, इसलिए RBI के फ़ैसले के कुछ समय बाद बदल जाती है।" }
      ],
      takeaway: "RBI का \"रुख\" उसके अगले कदमों का इशारा है। \"अकॉमोडेटिव\" मतलब आगे कटौती की संभावना।"
    }
  },
  {
    date: "2025-02-07", tag: "cut", rate: "6.25%", major: true,
    title: "First rate cut in nearly 5 years: repo rate down to 6.25%",
    headline: "RBI cuts repo rate by 25 bps to 6.25% in Governor Sanjay Malhotra's first policy, the first cut in nearly five years.",
    en: {
      is_relevant: true,
      summary: "In new Governor Sanjay Malhotra's first policy meeting, the RBI cut the repo rate from 6.50% to 6.25%. It was the first cut since May 2020, after the rate had been held at 6.50% for about two years.",
      why: "Inflation was coming down from its 2024 highs, and economic growth had slowed. Lowering rates makes borrowing cheaper, which encourages spending and investment and supports growth.",
      loans: { direction: "down", explanation: "This started 2025's run of cheaper loans. EMIs on a ₹30 lakh, 20-year home loan could fall by roughly ₹450 a month from this cut." },
      savings: { direction: "down", explanation: "Banks slowly began trimming FD rates. People who had locked in FDs at 2024's higher rates kept earning those rates until maturity." },
      prices: { direction: "same", explanation: "Inflation was easing, and a small cut wasn't expected to push prices up much." },
      key_terms: [
        { term: "RBI Governor", meaning: "The head of the Reserve Bank of India. Sanjay Malhotra took over in December 2024." },
        { term: "Rate-cut cycle", meaning: "A series of rate cuts over months. This was the first in a cycle that cut 1.25% in total during 2025." }
      ],
      takeaway: "When the RBI starts cutting after a long pause, it usually signals a period of cheaper loans and lower FD returns ahead."
    },
    hi: {
      is_relevant: true,
      summary: "नए गवर्नर संजय मल्होत्रा की पहली नीति बैठक में RBI ने रेपो रेट 6.50% से घटाकर 6.25% किया। मई 2020 के बाद यह पहली कटौती थी; रेट लगभग दो साल से 6.50% पर था।",
      why: "महँगाई 2024 के ऊँचे स्तर से कम हो रही थी और आर्थिक विकास धीमा पड़ा था। रेट घटाने से कर्ज़ सस्ता होता है, जिससे खर्च और निवेश बढ़ता है और विकास को सहारा मिलता है।",
      loans: { direction: "down", explanation: "यहीं से 2025 में सस्ते लोन का दौर शुरू हुआ। ₹30 लाख के 20 साल के होम लोन की EMI इस कटौती से लगभग ₹450 महीना घट सकती है।" },
      savings: { direction: "down", explanation: "बैंकों ने धीरे-धीरे FD दरें घटानी शुरू कीं। जिन्होंने 2024 की ऊँची दरों पर FD करवाई थी, उन्हें मैच्योरिटी तक वही दर मिलती रही।" },
      prices: { direction: "same", explanation: "महँगाई कम हो रही थी, और छोटी कटौती से दाम ज़्यादा बढ़ने की उम्मीद नहीं थी।" },
      key_terms: [
        { term: "RBI गवर्नर", meaning: "भारतीय रिज़र्व बैंक के प्रमुख। संजय मल्होत्रा ने दिसंबर 2024 में पद संभाला।" },
        { term: "रेट-कट साइकिल", meaning: "महीनों में कई बार रेट घटाना। यह उस दौर की पहली कटौती थी जिसमें 2025 में कुल 1.25% कमी हुई।" }
      ],
      takeaway: "लंबे विराम के बाद जब RBI रेट घटाना शुरू करता है, तो आम तौर पर आगे सस्ते लोन और कम FD रिटर्न का दौर आता है।"
    }
  }
];
