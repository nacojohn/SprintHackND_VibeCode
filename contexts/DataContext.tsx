import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { Incident, AnalysisResult, analyzeIncidents } from '../utils/analysis';
import { getForecast, getRecommendations, Recommendation } from '../utils/gemini';
import { db } from '../firebase';
import { User } from 'firebase/auth';

export interface RecommendationWithStatus extends Recommendation {
  completed: boolean;
}

interface Forecast {
  threeDay: string;
  threeDaySummary: string;
  sevenDay: string;
  sevenDaySummary: string;
}

interface DataContextType {
  rawData: Incident[];
  analysis: AnalysisResult;
  recommendations: RecommendationWithStatus[];
  toggleRecommendationCompleted: (index: number) => void;
  forecast: Forecast | null;
  loading: {
    analysis: boolean;
    forecast: boolean;
    recommendations: boolean;
    data: boolean;
  };
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  selectedZip: string | null;
  setSelectedZip: (zip: string | null) => void;
  addIncidents: (newIncidents: Omit<Incident, 'dateTime'> & { dateTime: any }[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialAnalysis: AnalysisResult = {
  totalIncidents: 0,
  totalLast7Days: 0,
  percentChangeLast7Days: 0,
  countyDailyCounts: {},
  countyRolling28DayMean: 0,
  countyRolling28DayStdDev: 0,
  zipAnalyses: [],
};

export const DataProvider: React.FC<{ children: ReactNode; user: User }> = ({ children, user }) => {
  const [rawData, setRawData] = useState<Incident[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysis);
  const [recommendations, setRecommendations] = useState<RecommendationWithStatus[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState({ analysis: false, forecast: false, recommendations: false, data: true });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);

  const processData = useCallback(async (data: Incident[]) => {
    setRawData(data);
    if (data.length === 0) {
      setAnalysis(initialAnalysis);
      setRecommendations([]);
      setForecast(null);
      return;
    }

    setLoading(prev => ({ ...prev, analysis: true, forecast: true, recommendations: true }));
    
    const analysisResult = analyzeIncidents(data);
    setAnalysis(analysisResult);
    setLoading(prev => ({ ...prev, analysis: false }));

    const criticalZips = analysisResult.zipAnalyses.filter(z => z.severity === 'Critical' || z.severity === 'High');
    
    if (criticalZips.length > 0) {
      getForecast(analysisResult).then(setForecast).finally(() => setLoading(prev => ({ ...prev, forecast: false })));
      getRecommendations(criticalZips).then(recs => {
        setRecommendations(recs.map(r => ({...r, completed: false})));
      }).finally(() => setLoading(prev => ({ ...prev, recommendations: false })));
    } else {
      setForecast({ 
        threeDay: 'Low Risk', threeDaySummary: 'No major spikes detected.', 
        sevenDay: 'Low Risk', sevenDaySummary: 'Trends appear stable.' 
      });
      setRecommendations([]);
      setLoading(prev => ({ ...prev, forecast: false, recommendations: false }));
    }
  }, []);

  const fetchIncidents = useCallback(async () => {
    if (!user) return;
    setLoading(prev => ({ ...prev, data: true }));
    try {
      const snapshot = await db.collection('users').doc(user.uid).collection('incidents').orderBy('dateTime', 'desc').get();
      const incidents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          dateTime: data.dateTime.toDate(), // Convert Firestore Timestamp to JS Date
        } as Incident;
      });
      await processData(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  }, [user, processData]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);
  
  const addIncidents = async (newIncidents: Omit<Incident, 'dateTime'> & { dateTime: any }[]) => {
    if (!user) throw new Error("User not authenticated");
    
    const batch = db.batch();
    const incidentsCollection = db.collection('users').doc(user.uid).collection('incidents');
    
    newIncidents.forEach(incident => {
      const docRef = incidentsCollection.doc();
      batch.set(docRef, incident);
    });
    
    await batch.commit();
    await fetchIncidents(); // Refetch all data to re-run analysis
  };

  const toggleRecommendationCompleted = (index: number) => {
    setRecommendations(currentRecommendations =>
      currentRecommendations.map((rec, i) =>
        i === index ? { ...rec, completed: !rec.completed } : rec
      )
    );
  };

  const value = useMemo(() => ({
    rawData,
    analysis,
    recommendations,
    toggleRecommendationCompleted,
    forecast,
    loading,
    isUploadModalOpen,
    setIsUploadModalOpen,
    selectedZip,
    setSelectedZip,
    addIncidents,
  }), [rawData, analysis, recommendations, forecast, loading, isUploadModalOpen, selectedZip, addIncidents]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};