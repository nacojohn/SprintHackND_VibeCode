import { functions } from '../firebase';
import { AnalysisResult, ZipAnalysis } from './analysis';

export interface Recommendation {
    action: string;
    rationale: string;
    priorityScore: number;
}

const callGemini = functions.httpsCallable('callGemini');

export async function getForecast(analysis: AnalysisResult) {
    try {
        const result = await callGemini({ type: 'getForecast', payload: analysis });
        return result.data as { threeDay: string; threeDaySummary: string; sevenDay: string; sevenDaySummary: string; };
    } catch (error) {
        console.error("Error getting forecast from Firebase Function:", error);
        const errorMessage = (error as any).message || 'Could not fetch forecast';
        return { threeDay: 'Error', threeDaySummary: errorMessage, sevenDay: 'Error', sevenDaySummary: 'Please check logs.' };
    }
}

export async function getRecommendations(criticalZips: ZipAnalysis[]): Promise<Recommendation[]> {
    try {
        const result = await callGemini({ type: 'getRecommendations', payload: criticalZips });
        return result.data as Recommendation[];
    } catch (error) {
        console.error("Error getting recommendations from Firebase Function:", error);
        const errorMessage = (error as any).message || 'Please check the console for details.';
        return [{ action: 'Error fetching recommendations', rationale: errorMessage, priorityScore: 100 }];
    }
}
