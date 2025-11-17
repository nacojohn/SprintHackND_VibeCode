import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { Incident, AnalysisResult } from '../utils/analysis';
import { getForecast, getRecommendations, Recommendation } from '../utils/gemini';
import { db } from '../firebase';
// FIX: The User type from 'firebase/auth' is for the v9 modular SDK. This project uses the v8 compat library.
import firebase from 'firebase/compat/app';

export interface RecommendationWithStatus extends Recommendation {
  completed: boolean;
}

interface Forecast {
  threeDay: string;
  threeDaySummary: string;
  sevenDay: string;
  sevenDaySummary: string;
}

export type ProcessingStep = 'idle' | 'parsing' | 'validating' | 'uploading' | 'analyzing' | 'generatingInsights';


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
  addIncidents: (newIncidents: (Omit<Incident, 'dateTime'> & { dateTime: any })[], setProcessingStep: (step: ProcessingStep) => void) => Promise<void>;
}

interface PersistedData {
  analysis: AnalysisResult;
  forecast: Forecast;
  recommendations: RecommendationWithStatus[];
  createdAt: firebase.firestore.Timestamp;
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

const runAnalysisInWorker = (data: Incident[]): Promise<AnalysisResult> => {
  return new Promise((resolve, reject) => {
    // Vite-specific syntax for creating a worker
    const worker = new Worker(new URL('../worker/analysis.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event) => {
      resolve(event.data as AnalysisResult);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      reject(new Error('Failed to analyze incidents in worker.'));
      worker.terminate();
    };

    worker.postMessage(data);
  });
};


// FIX: Use firebase.User which is the correct type for the v8 compat library user object.
export const DataProvider: React.FC<{ children: ReactNode; user: firebase.User }> = ({ children, user }) => {
  const [rawData, setRawData] = useState<Incident[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysis);
  const [recommendations, setRecommendations] = useState<RecommendationWithStatus[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState({ analysis: false, forecast: false, recommendations: false, data: true });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);

  const persistAnalysis = useCallback(async (
    analysisResult: AnalysisResult,
    forecastResult: Forecast | null,
    recommendationsResult: RecommendationWithStatus[]
  ) => {
    if (!user || !forecastResult) return;
    const analysisDocRef = db.collection('users').doc(user.uid).collection('analysis').doc('latest');
    const dataToPersist: Omit<PersistedData, 'createdAt'> & { createdAt: firebase.firestore.FieldValue } = {
      analysis: analysisResult,
      forecast: forecastResult,
      recommendations: recommendationsResult,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await analysisDocRef.set(dataToPersist, { merge: true });
  }, [user]);

  const processAndPersistData = useCallback(async (data: Incident[], setProcessingStep?: (step: ProcessingStep) => void) => {
    if (data.length === 0) {
      setRawData([]);
      setAnalysis(initialAnalysis);
      setRecommendations([]);
      setForecast(null);
      return;
    }
    
    // Update raw data state immediately for responsiveness
    setRawData(data);

    setLoading(prev => ({ ...prev, analysis: true, forecast: true, recommendations: true }));
    setProcessingStep?.('analyzing');
    
    try {
      const analysisResult = await runAnalysisInWorker(data);
      setAnalysis(analysisResult);
      setLoading(prev => ({ ...prev, analysis: false }));

      setProcessingStep?.('generatingInsights');
      const criticalZips = analysisResult.zipAnalyses.filter(z => z.severity === 'Critical' || z.severity === 'High');
      
      let forecastResult: Forecast;
      let recommendationsResult: RecommendationWithStatus[];

      if (criticalZips.length > 0) {
        const [forecastData, recommendationsData] = await Promise.all([
          getForecast(analysisResult),
          getRecommendations(criticalZips),
        ]);
        forecastResult = forecastData;
        recommendationsResult = recommendationsData.map(r => ({...r, completed: false}));
      } else {
        forecastResult = { 
          threeDay: 'Low Risk', threeDaySummary: 'No major spikes detected.', 
          sevenDay: 'Low Risk', sevenDaySummary: 'Trends appear stable.' 
        };
        recommendationsResult = [];
      }
      
      setForecast(forecastResult);
      setRecommendations(recommendationsResult);
      await persistAnalysis(analysisResult, forecastResult, recommendationsResult);

    } catch (error) {
       console.error("Error processing and persisting data:", error);
    } finally {
        setLoading(prev => ({ ...prev, forecast: false, recommendations: false }));
        setProcessingStep?.('idle');
    }
  }, [user, persistAnalysis]);
  
  const loadInitialData = useCallback(async () => {
    if (!user) return;
    setLoading(prev => ({ ...prev, data: true }));
    try {
      const analysisDocRef = db.collection('users').doc(user.uid).collection('analysis').doc('latest');
      const incidentsCollectionRef = db.collection('users').doc(user.uid).collection('incidents').orderBy('dateTime', 'desc');

      const [analysisSnapshot, incidentsSnapshot] = await Promise.all([
        analysisDocRef.get(),
        incidentsCollectionRef.get()
      ]);

      const incidents = incidentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          dateTime: data.dateTime.toDate(),
        } as Incident;
      });
     

      if (analysisSnapshot.exists && incidents.length > 0) {
        const persistedData = analysisSnapshot.data() as PersistedData;
        setRawData(incidents);
        setAnalysis(persistedData.analysis);
        setForecast(persistedData.forecast);
        setRecommendations(persistedData.recommendations || []);
      } else if (incidents.length > 0) {
        // If there's data but no analysis, run it
        await processAndPersistData(incidents);
      } else {
        // No data, no analysis
        setRawData([]);
        setAnalysis(initialAnalysis);
        setForecast(null);
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
       setRawData([]);
      setAnalysis(initialAnalysis);
      setForecast(null);
      setRecommendations([]);
    } finally {
      setLoading(prev => ({ ...prev, data: false, analysis: false, forecast: false, recommendations: false }));
    }
  }, [user, processAndPersistData]);


  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const addIncidents = useCallback(async (
    newIncidents: (Omit<Incident, 'dateTime'> & { dateTime: any })[],
    setProcessingStep: (step: ProcessingStep) => void
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    // Batch write new incidents to Firestore
    const incidentsCollection = db.collection('users').doc(user.uid).collection('incidents');
    const BATCH_SIZE = 500;
    for (let i = 0; i < newIncidents.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const chunk = newIncidents.slice(i, i + BATCH_SIZE);
        chunk.forEach(incident => {
            const docRef = incidentsCollection.doc();
            batch.set(docRef, incident);
        });
        await batch.commit();
    }
    
    // Combine new data with existing data in memory for analysis
    const combinedData = [
        ...rawData,
        ...newIncidents.map(inc => ({...inc, dateTime: new Date(inc.dateTime)} as Incident))
    ].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

    await processAndPersistData(combinedData, setProcessingStep);
    
  }, [user, rawData, processAndPersistData]);

  const toggleRecommendationCompleted = async (index: number) => {
    const updatedRecommendations = recommendations.map((rec, i) =>
      i === index ? { ...rec, completed: !rec.completed } : rec
    );
    setRecommendations(updatedRecommendations);

    if (!user) return;
    try {
      const analysisDocRef = db.collection('users').doc(user.uid).collection('analysis').doc('latest');
      await analysisDocRef.update({
        recommendations: updatedRecommendations
      });
    } catch (error) {
      console.error("Failed to update recommendation status in Firestore:", error);
      setRecommendations(recommendations); // Revert on failure
    }
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
  }), [rawData, analysis, recommendations, forecast, loading, isUploadModalOpen, selectedZip, addIncidents, toggleRecommendationCompleted]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};