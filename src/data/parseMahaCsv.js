// Browser-friendly CSV loader and parser for Maharashtra MGNREGA (2024-2025)
// Exports loadMaharashtraData(): Promise<Array<DistrictData>>

import csvUrl from './mgnrega_maharashtra_2024_25.csv';

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = splitCsvLine(line);
    const row = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}

// Convert month name to index (0-11)
function monthIndex(m) {
  const map = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    January: 0, February: 1, March: 2, April: 3, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
  };
  return map[m] !== undefined ? map[m] : -1;
}

function toNumber(v) {
  if (v === undefined || v === null || v === '' || v === 'NA') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function groupByDistrict(rows) {
  const acc = new Map();
  rows.forEach(r => {
    const dist = (r.district_name || '').trim();
    if (!dist) return;
    if (!acc.has(dist)) acc.set(dist, []);
    acc.get(dist).push(r);
  });
  return acc;
}

function structureDistrict(dist, records) {
  const sorted = [...records].sort((a, b) => {
    if (a.fin_year !== b.fin_year) return b.fin_year.localeCompare(a.fin_year);
    return monthIndex(b.month) - monthIndex(a.month);
  });
  const historicalData = sorted.slice(0, 12).map(r => ({
    month: r.month,
    year: r.fin_year,
    jobCardsIssued: toNumber(r.Total_No_of_JobCards_issued),
    workersRegistered: toNumber(r.Total_No_of_Workers),
    householdsEmployed: toNumber(r.Total_Households_Worked),
    personDaysGenerated: toNumber(r.Persondays_of_Central_Liability_so_far),
    averageWageRate: toNumber(r.Average_Wage_rate_per_day_per_person),
    totalExpenditure: toNumber(r.Total_Exp),
    womenParticipation: toNumber(r.Women_Persondays),
    scParticipation: toNumber(r.SC_persondays),
    stParticipation: toNumber(r.ST_persondays),
    completedWorks: toNumber(r.Number_of_Completed_Works),
    ongoingWorks: toNumber(r.Number_of_Ongoing_Works)
  }));
  const currentMonthData = historicalData[0] || {
    month: '', year: '', jobCardsIssued: 0, workersRegistered: 0,
    householdsEmployed: 0, personDaysGenerated: 0, averageWageRate: 0,
    totalExpenditure: 0, womenParticipation: 0, scParticipation: 0,
    stParticipation: 0, completedWorks: 0, ongoingWorks: 0
  };
  return {
    districtName: dist,
    stateName: 'Maharashtra',
    currentMonthData,
    historicalData,
    performanceIndicators: {
      employmentGeneration: 4,
      wagePaymentEfficiency: 4,
      inclusionOfMarginalized: 3,
      workCompletion: 4,
      overallPerformance: 4
    }
  };
}

let cachedData = null;

export async function loadMaharashtraData() {
  if (cachedData) return cachedData;
  const res = await fetch(csvUrl);
  const text = await res.text();
  const rows = parseCsv(text);
  const mahaRows = rows.filter(r => (r.state_name || '').trim() === 'MAHARASHTRA' && r.fin_year === '2024-2025');
  const grouped = groupByDistrict(mahaRows);
  const districts = Array.from(grouped.entries()).map(([dist, recs]) => structureDistrict(dist, recs));
  cachedData = districts;
  return districts;
}
