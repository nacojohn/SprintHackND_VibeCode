// This is a Web Worker, it will run in a separate thread.
import type { Incident, AnalysisResult, ZipAnalysis } from '../utils/analysis';

// Helper to get date string 'YYYY-MM-DD'
const toDateString = (date: Date): string => date.toISOString().split('T')[0];

const getDailyCounts = (incidents: Incident[]): { [date: string]: number } => {
  return incidents.reduce((acc, incident) => {
    // Ensure dateTime is a Date object
    const incidentDate = typeof incident.dateTime === 'string' ? new Date(incident.dateTime) : incident.dateTime;
    const dateStr = toDateString(incidentDate);
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

  if (values.length < 2) {
    return { mean, stdDev: 0 };
  }
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length -1);
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

const analyzeIncidents = (incidents: Incident[]): AnalysisResult => {
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
  const incidentsLast7Days = incidents.filter(i => new Date(i.dateTime) >= sevenDaysAgo);
  const incidents7to14Days = incidents.filter(i => new Date(i.dateTime) >= fourteenDaysAgo && new Date(i.dateTime) < sevenDaysAgo);
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

    // Spike Detection Logic
    const stdDevsFromMean = rolling28DayStdDev > 0 ? (current7DayAvg - rolling28DayMean) / rolling28DayStdDev : 0;
    
    // Severity Classification
    const fatalIncidentsLast7Days = zipIncidents.filter(i => new Date(i.dateTime) >= sevenDaysAgo && i.outcome === 'Fatal').length;
    const totalIncidentsLast7Days = zipIncidents.filter(i => new Date(i.dateTime) >= sevenDaysAgo).length;
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


// Listen for messages from the main thread
self.onmessage = (event: MessageEvent<Incident[]>) => {
  const incidents = event.data;
  const result = analyzeIncidents(incidents);
  // Send the result back to the main thread
  self.postMessage(result);
};
