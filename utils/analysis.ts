export interface Incident {
  dateTime: Date;
  zipCode: string;
  naloxoneAdministered: boolean;
  naloxoneDoses: number;
  outcome: 'Fatal' | 'Non-Fatal' | string;
}

export interface ZipAnalysis {
  zip: string;
  totalIncidents: number;
  current7DayAvg: number;
  rolling28DayMean: number;
  rolling28DayStdDev: number;
  stdDevsFromMean: number;
  severity: 'Critical' | 'High' | 'Moderate' | 'Watch' | null;
  dailyCounts: { [date: string]: number };
}

export interface AnalysisResult {
  totalIncidents: number;
  totalLast7Days: number;
  percentChangeLast7Days: number;
  countyDailyCounts: { [date: string]: number };
  countyRolling28DayMean: number;
  countyRolling28DayStdDev: number;
  zipAnalyses: ZipAnalysis[];
}

// Helper to get date string 'YYYY-MM-DD'
const toDateString = (date: Date): string => date.toISOString().split('T')[0];

export const analyzeIncidents = (incidents: Incident[]): AnalysisResult => {
  if (incidents.length === 0) {
    return {
      totalIncidents: 0, totalLast7Days: 0, percentChangeLast7Days: 0,
      countyDailyCounts: {}, countyRolling28DayMean: 0, countyRolling28DayStdDev: 0,
      zipAnalyses: []
    };
  }

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 14);

  // County-wide stats
  const incidentsLast7Days = incidents.filter(i => i.dateTime >= sevenDaysAgo);
  const incidents7to14Days = incidents.filter(i => i.dateTime >= fourteenDaysAgo && i.dateTime < sevenDaysAgo);
  const totalLast7Days = incidentsLast7Days.length;
  const total7to14Days = incidents7to14Days.length;
  const percentChangeLast7Days = total7to14Days > 0 ? ((totalLast7Days - total7to14Days) / total7to14Days) * 100 : (totalLast7Days > 0 ? 100 : 0);

  const countyDailyCounts = getDailyCounts(incidents);
  const { mean: countyRolling28DayMean, stdDev: countyRolling28DayStdDev } = calculateRollingStats(countyDailyCounts, today);

  // Group incidents by ZIP code
  const incidentsByZip = incidents.reduce((acc, incident) => {
    acc[incident.zipCode] = acc[incident.zipCode] || [];
    acc[incident.zipCode].push(incident);
    return acc;
  }, {} as { [zip: string]: Incident[] });

  const zipAnalyses: ZipAnalysis[] = Object.entries(incidentsByZip).map(([zip, zipIncidents]) => {
    const dailyCounts = getDailyCounts(zipIncidents);
    const { mean: rolling28DayMean, stdDev: rolling28DayStdDev } = calculateRollingStats(dailyCounts, today);
    const current7DayAvg = calculateAverageForPeriod(dailyCounts, today, 7);

    // Spike Detection Logic (FR-2.1)
    const spikeThreshold = rolling28DayMean + (2 * rolling28DayStdDev);
    const isSpike = current7DayAvg > spikeThreshold;
    
    const stdDevsFromMean = rolling28DayStdDev > 0 ? (current7DayAvg - rolling28DayMean) / rolling28DayStdDev : 0;
    
    // Severity Classification (FR-2.3)
    const fatalIncidentsLast7Days = zipIncidents.filter(i => i.dateTime >= sevenDaysAgo && i.outcome === 'Fatal').length;
    const totalIncidentsLast7Days = zipIncidents.filter(i => i.dateTime >= sevenDaysAgo).length;
    const fatalOutcomePercent = totalIncidentsLast7Days > 0 ? (fatalIncidentsLast7Days / totalIncidentsLast7Days) * 100 : 0;
    
    let severity: ZipAnalysis['severity'] = null;
    if (stdDevsFromMean >= 3 || fatalOutcomePercent > 20) {
      severity = 'Critical';
    } else if (stdDevsFromMean >= 2) {
      severity = 'High';
    } else if (stdDevsFromMean >= 1.5) {
      severity = 'Moderate';
    } else if (stdDevsFromMean >= 1) {
      severity = 'Watch';
    }

    return {
      zip,
      totalIncidents: zipIncidents.length,
      current7DayAvg,
      rolling28DayMean,
      rolling28DayStdDev,
      stdDevsFromMean,
      severity,
      dailyCounts
    };
  });

  return {
    totalIncidents: incidents.length,
    totalLast7Days,
    percentChangeLast7Days,
    countyDailyCounts,
    countyRolling28DayMean,
    countyRolling28DayStdDev,
    zipAnalyses,
  };
};

const getDailyCounts = (incidents: Incident[]): { [date: string]: number } => {
  return incidents.reduce((acc, incident) => {
    const dateStr = toDateString(incident.dateTime);
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as { [date: string]: number });
};

const calculateRollingStats = (dailyCounts: { [date: string]: number }, endDate: Date, days: number = 28): { mean: number; stdDev: number } => {
  const values: number[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - i);
    const dateStr = toDateString(date);
    values.push(dailyCounts[dateStr] || 0);
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
};

const calculateAverageForPeriod = (dailyCounts: { [date: string]: number }, endDate: Date, days: number): number => {
    let sum = 0;
    for (let i = 0; i < days; i++) {
        const date = new Date(endDate);
        date.setDate(endDate.getDate() - i);
        const dateStr = toDateString(date);
        sum += dailyCounts[dateStr] || 0;
    }
    return sum / days;
};
