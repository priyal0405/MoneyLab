// Money Lab: historical data for the Investment Time Machine.
// One value per calendar year. "Investing in year Y" means buying at the
// END of year Y-1 (i.e. on the first day of Y) and holding to the end of 2025.
//
// Educational use only. Values are approximate; see notes per series.

const HISTORY = {
  lastYear: 2025,

  // Nifty 50 closing value on the last trading day of each year (price index,
  // dividends NOT included, so real returns were ~1-1.5% a year higher).
  // Source: NSE year-end closes (2009-2023 cross-checked against
  // stockpricearchive.com; 2024 and 2025 from NSE closes on 31 Dec).
  nifty: {
    2009: 5201.05, 2010: 6134.50, 2011: 4624.30, 2012: 5905.10,
    2013: 6304.00, 2014: 8282.70, 2015: 7946.35, 2016: 8185.80,
    2017: 10530.70, 2018: 10862.55, 2019: 12168.45, 2020: 13981.75,
    2021: 17354.05, 2022: 18105.30, 2023: 21731.40, 2024: 23644.90,
    2025: 26129.60
  },

  // 24K gold, ₹ per 10 grams, approximate price around the end of each year.
  // 2010-2015 from published year-end series; 2025 from late-Dec 2025 reports
  // (~₹1.38 lakh). Other years are approximate MCX/market levels.
  // TODO: verify against IBJA (ibja.co) year-end rates.
  gold: {
    2009: 16900, 2010: 20728, 2011: 27329, 2012: 30859,
    2013: 28422, 2014: 26703, 2015: 24931, 2016: 27450,
    2017: 29300, 2018: 31800, 2019: 39100, 2020: 50200,
    2021: 48100, 2022: 54900, 2023: 63200, 2024: 76600,
    2025: 138300
  },

  // Approximate SBI 1-year FD rate (% a year, general public) in force for most
  // of each year. The FD is assumed to be renewed every year at that year's rate,
  // compounded quarterly, before tax.
  // TODO: verify against SBI / RBI deposit rate archives.
  fdRate: {
    2010: 7.00, 2011: 9.25, 2012: 9.00, 2013: 8.75, 2014: 8.75,
    2015: 8.00, 2016: 7.00, 2017: 6.75, 2018: 6.70, 2019: 6.60,
    2020: 5.40, 2021: 5.00, 2022: 5.50, 2023: 6.80, 2024: 6.80,
    2025: 6.50
  },

  // India CPI inflation, % for each calendar year.
  // Source: World Bank (FP.CPI.TOTL.ZG); 2025 is provisional.
  inflation: {
    2010: 11.99, 2011: 8.86, 2012: 9.31, 2013: 10.91, 2014: 6.35,
    2015: 5.87, 2016: 4.94, 2017: 2.49, 2018: 4.86, 2019: 7.66,
    2020: 6.62, 2021: 5.13, 2022: 6.70, 2023: 5.65, 2024: 4.95,
    2025: 2.40
  }
};
