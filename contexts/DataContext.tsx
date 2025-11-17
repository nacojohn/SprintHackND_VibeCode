
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { Incident, AnalysisResult, analyzeIncidents } from '../utils/analysis';
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
  // FIX: Corrected the type for newIncidents to be an array of objects.
  addIncidents: (newIncidents: (Omit<Incident, 'dateTime'> & { dateTime: any })[]) => Promise<void>;
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

  const processAndPersistData = useCallback(async (data: Incident[]) => {
    setRawData(data);
    if (data.length === 0) {
      setAnalysis(initialAnalysis);
      setRecommendations([]);
      setForecast(null);
      return;
    }

    setLoading(prev => ({ ...prev, analysis: true, forecast: true, recommendations: true }));
    
    try {
      const analysisResult = analyzeIncidents(data);
      setAnalysis(analysisResult);
      setLoading(prev => ({ ...prev, analysis: false }));

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
      setRawData(incidents);

      if (analysisSnapshot.exists && incidents.length > 0) {
        const persistedData = analysisSnapshot.data() as PersistedData;
        setAnalysis(persistedData.analysis);
        setForecast(persistedData.forecast);
        setRecommendations(persistedData.recommendations || []);
      } else if (incidents.length > 0) {
        await processAndPersistData(incidents);
      } else {
        setAnalysis(initialAnalysis);
        setForecast(null);
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
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
  
  const addIncidents = useCallback(async (newIncidents: (Omit<Incident, 'dateTime'> & { dateTime: any })[]) => {
    if (!user) throw new Error("User not authenticated");
    
    setLoading(prev => ({ ...prev, data: true }));
    const batch = db.batch();
    const incidentsCollection = db.collection('users').doc(user.uid).collection('incidents');
    
    newIncidents.forEach(incident => {
      const docRef = incidentsCollection.doc();
      batch.set(docRef, incident);
    });
    
    await batch.commit();
    
    const allIncidentsSnapshot = await incidentsCollection.orderBy('dateTime', 'desc').get();
    const allIncidents = allIncidentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, dateTime: data.dateTime.toDate() } as Incident;
    });

    await processAndPersistData(allIncidents);
    setLoading(prev => ({ ...prev, data: false }));
  }, [user, processAndPersistData]);

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
