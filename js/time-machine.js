// Investment Time Machine: works out what ₹x invested at the start of a year
// would be worth at the end of each year up to HISTORY.lastYear.

const ASSETS = {
  nifty: { label: "Nifty 50", color: "#7c3aed", fill: "rgba(124, 58, 237, 0.12)" },
  gold:  { label: "Gold",     color: "#f59e0b", fill: "rgba(245, 158, 11, 0.12)" },
  fd:    { label: "Fixed Deposit", color: "#14b8a6", fill: "rgba(20, 184, 166, 0.12)" }
};

const amountInput = document.getElementById("amount");
const yearSelect  = document.getElementById("start-year");
const assetChips  = document.querySelectorAll(".chip input");
const viewButtons = document.querySelectorAll(".view-toggle button");
const resultsBox  = document.getElementById("results");
const insightBox  = document.getElementById("insight");

let view = "nominal";
let chart = null;

// Fill the year dropdown
for (let y = 2010; y <= HISTORY.lastYear; y++) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}
yearSelect.value = 2010;

const rupees = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// Returns [{year, value}] from the start of startYear to the end of lastYear.
function growth(asset, amount, startYear) {
  const points = [{ year: startYear - 1, value: amount }];
  let value = amount;
  for (let y = startYear; y <= HISTORY.lastYear; y++) {
    if (asset === "fd") {
      value *= Math.pow(1 + HISTORY.fdRate[y] / 400, 4);
    } else {
      value *= HISTORY[asset][y] / HISTORY[asset][y - 1];
    }
    points.push({ year: y, value });
  }
  return points;
}

// Cumulative price level, so ₹1 at the start = 1.
function priceLevels(startYear) {
  const levels = [1];
  let level = 1;
  for (let y = startYear; y <= HISTORY.lastYear; y++) {
    level *= 1 + HISTORY.inflation[y] / 100;
    levels.push(level);
  }
  return levels;
}

function render() {
  const amount = Math.max(0, Number(amountInput.value) || 0);
  const startYear = Number(yearSelect.value);
  const chosen = [...assetChips].filter((c) => c.checked).map((c) => c.value);
  const levels = priceLevels(startYear);
  const years = HISTORY.lastYear - startYear + 1;

  const series = chosen.map((asset) => {
    const points = growth(asset, amount, startYear).map((p, i) => ({
      year: p.year,
      value: view === "real" ? p.value / levels[i] : p.value
    }));
    return { asset, points, final: points[points.length - 1].value };
  });

  // Result cards
  resultsBox.innerHTML = series.map(({ asset, final }) => {
    const gain = amount ? ((final - amount) / amount) * 100 : 0;
    const cagr = amount ? (Math.pow(final / amount, 1 / years) - 1) * 100 : 0;
    return `
      <div class="result-card ${asset}">
        <span class="result-label">${ASSETS[asset].label}</span>
        <span class="result-value">${rupees(final)}</span>
        <span class="result-meta">${gain >= 0 ? "+" : ""}${gain.toFixed(0)}% total · ${cagr.toFixed(1)}% a year</span>
      </div>`;
  }).join("") || `<p class="empty">Pick at least one investment above.</p>`;

  // Insight line
  const keep = rupees(amount * levels[levels.length - 1]);
  if (view === "real") {
    const beat = series.filter((s) => s.final > amount).map((s) => ASSETS[s.asset].label);
    insightBox.textContent = beat.length
      ? `In today's money: ${beat.join(" and ")} beat inflation. Anything below ${rupees(amount)} lost buying power.`
      : `In today's money, none of these kept up with inflation.`;
  } else {
    insightBox.textContent = `Prices rose so much that you'd need ${keep} at the end of ${HISTORY.lastYear} to buy what ${rupees(amount)} bought at the start of ${startYear}.`;
  }

  drawChart(series, startYear, amount);
}

function drawChart(series, startYear, amount) {
  const labels = [];
  for (let y = startYear - 1; y <= HISTORY.lastYear; y++) labels.push(y === startYear - 1 ? `Start ${startYear}` : String(y));

  const datasets = series.map(({ asset, points }) => ({
    label: ASSETS[asset].label,
    data: points.map((p) => Math.round(p.value)),
    borderColor: ASSETS[asset].color,
    backgroundColor: ASSETS[asset].fill,
    fill: true,
    tension: 0.35,
    borderWidth: 3,
    pointRadius: 3,
    pointHoverRadius: 6
  }));

  datasets.push({
    label: "What you put in",
    data: labels.map(() => amount),
    borderColor: "#a8a3c4",
    borderDash: [6, 6],
    borderWidth: 2,
    pointRadius: 0,
    fill: false
  });

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("growth-chart"), {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: { duration: 1400, easing: "easeOutQuart" },
      plugins: {
        legend: { labels: { usePointStyle: true, font: { family: "Poppins" } } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${rupees(c.raw)}` } }
      },
      scales: {
        y: { ticks: { callback: (v) => rupees(v), font: { family: "Poppins" } }, grid: { color: "#f0ecf9" } },
        x: { ticks: { font: { family: "Poppins" } }, grid: { display: false } }
      }
    }
  });
}

amountInput.addEventListener("input", render);
yearSelect.addEventListener("change", render);
assetChips.forEach((c) => c.addEventListener("change", render));
viewButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    viewButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    view = btn.dataset.view;
    render();
  })
);

render();
