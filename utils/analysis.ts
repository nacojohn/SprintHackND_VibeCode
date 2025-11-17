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
