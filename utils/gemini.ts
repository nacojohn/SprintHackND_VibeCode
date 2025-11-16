import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, ZipAnalysis } from './analysis';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface Recommendation {
    action: string;
    rationale: string;
    priorityScore: number;
}

const forecastSchema = {
    type: Type.OBJECT,
    properties: {
        threeDay: { type: Type.STRING, description: "A risk level for the next 3 days (e.g., 'High Risk', 'Moderate Risk')." },
        threeDaySummary: { type: Type.STRING, description: "A brief (5-10 word) summary for the 3-day forecast." },
        sevenDay: { type: Type.STRING, description: "A risk level for the next 7 days (e.g., 'Moderate Risk', 'Low Risk')." },
        sevenDaySummary: { type: Type.STRING, description: "A brief (5-10 word) summary for the 7-day forecast." },
    },
    required: ["threeDay", "threeDaySummary", "sevenDay", "sevenDaySummary"],
};

const recommendationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            action: { type: Type.STRING, description: "A specific, actionable recommendation (e.g., 'Deploy 2 mobile teams to ZIP 46619')." },
            rationale: { type: Type.STRING, description: "A brief explanation for the recommendation (e.g., 'Incidents up 42% vs. baseline')." },
            priorityScore: { type: Type.INTEGER, description: "A score from 1-100 indicating urgency." },
        },
        required: ["action", "rationale", "priorityScore"],
    }
};

export async function getForecast(analysis: AnalysisResult) {
    const criticalZips = analysis.zipAnalyses
        .filter(z => z.severity === 'Critical' || z.severity === 'High')
        .map(z => `ZIP ${z.zip} is ${z.severity} with a 7-day average of ${z.current7DayAvg.toFixed(1)} incidents, which is ${z.stdDevsFromMean.toFixed(1)} standard deviations above the 28-day mean.`).join('\n');

    const prompt = `
        As a public health analyst, forecast the opioid overdose risk for a county.
        
        Current situation:
        - The county's total incidents in the last 7 days is ${analysis.totalLast7Days}.
        - This is a ${analysis.percentChangeLast7Days.toFixed(1)}% change from the previous week.
        - The following ZIP codes are currently experiencing spikes:
        ${criticalZips}

        Based on this data, provide a 3-day and 7-day risk forecast for the entire county.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: forecastSchema,
                temperature: 0.5,
            },
        });
        const text = response.text;
        if (!text) {
          throw new Error("Received empty response from Gemini API for forecast.");
        }
        const json = JSON.parse(text);
        return json;
    } catch (error) {
        console.error("Error getting forecast from Gemini:", error);
        return { threeDay: 'Error', threeDaySummary: 'Could not fetch forecast', sevenDay: 'Error', sevenDaySummary: 'Could not fetch forecast' };
    }
}

export async function getRecommendations(criticalZips: ZipAnalysis[]): Promise<Recommendation[]> {
    const prompt = `
        As a public health AI agent, provide a ranked list of the top 3-5 intervention recommendations based on the following critical overdose spike data.

        Assume we have these available resources:
        - 4 Mobile Harm Reduction Teams
        - Ample supply of Naloxone kits
        - Community partners (shelters, treatment centers)
        - Law enforcement liaisons

        Current critical spikes:
        ${criticalZips.map(z => `- ZIP Code ${z.zip}: Severity is ${z.severity}. Current 7-day average is ${z.current7DayAvg.toFixed(1)} incidents/day, which is ${z.stdDevsFromMean.toFixed(1)} SDs above the 28-day mean of ${z.rolling28DayMean.toFixed(1)}.`).join('\n')}

        Generate recommendations. Prioritize actions that are specific, impactful, and directly address the highest-risk areas.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
                temperature: 0.7,
            },
        });
        const text = response.text;
        if (!text) {
          throw new Error("Received empty response from Gemini API for recommendations.");
        }
        const json: Recommendation[] = JSON.parse(text);
        // Sort by priority score descending
        return json.sort((a, b) => b.priorityScore - a.priorityScore);
    } catch (error) {
        console.error("Error getting recommendations from Gemini:", error);
        return [{ action: 'Error fetching recommendations', rationale: 'Please check the console for details.', priorityScore: 100 }];
    }
}
