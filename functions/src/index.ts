import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

admin.initializeApp();

// Get Gemini API Key from Firebase Functions config
// Run `firebase functions:config:set gemini.key="YOUR_API_KEY"` to set
const API_KEY = functions.config().gemini.key;

if (!API_KEY) {
  throw new Error("Gemini API Key is not set in Firebase Functions config.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Type definitions copied from client-side code for consistency
interface ZipAnalysis {
  zip: string;
  totalIncidents: number;
  current7DayAvg: number;
  rolling28DayMean: number;
  rolling28DayStdDev: number;
  stdDevsFromMean: number;
  severity: "Critical" | "High" | "Moderate" | "Watch" | null;
  dailyCounts: { [date: string]: number };
}

interface AnalysisResult {
  totalIncidents: number;
  totalLast7Days: number;
  percentChangeLast7Days: number;
  countyDailyCounts: { [date: string]: number };
  countyRolling28DayMean: number;
  countyRolling28DayStdDev: number;
  zipAnalyses: ZipAnalysis[];
}

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
    },
};


const handleGetForecast = async (analysis: AnalysisResult) => {
    const criticalZips = analysis.zipAnalyses
        .filter((z) => z.severity === "Critical" || z.severity === "High")
        .map((z) => `ZIP ${z.zip} is ${z.severity} with a 7-day average of ${z.current7DayAvg.toFixed(1)} incidents, which is ${z.stdDevsFromMean.toFixed(1)} standard deviations above the 28-day mean.`).join("\n");

    const prompt = `
        As a public health analyst, forecast the opioid overdose risk for a county.
        
        Current situation:
        - The county's total incidents in the last 7 days is ${analysis.totalLast7Days}.
        - This is a ${analysis.percentChangeLast7Days.toFixed(1)}% change from the previous week.
        - The following ZIP codes are currently experiencing spikes:
        ${criticalZips}

        Based on this data, provide a 3-day and 7-day risk forecast for the entire county.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: forecastSchema,
            temperature: 0.5,
        },
    });
    return JSON.parse(response.text);
};


const handleGetRecommendations = async (criticalZips: ZipAnalysis[]): Promise<Recommendation[]> => {
    const prompt = `
        As a public health AI agent, provide a ranked list of the top 3-5 intervention recommendations based on the following critical overdose spike data.

        Assume we have these available resources:
        - 4 Mobile Harm Reduction Teams
        - Ample supply of Naloxone kits
        - Community partners (shelters, treatment centers)
        - Law enforcement liaisons

        Current critical spikes:
        ${criticalZips.map((z) => `- ZIP Code ${z.zip}: Severity is ${z.severity}. Current 7-day average is ${z.current7DayAvg.toFixed(1)} incidents/day, which is ${z.stdDevsFromMean.toFixed(1)} SDs above the 28-day mean of ${z.rolling28DayMean.toFixed(1)}.`).join("\n")}

        Generate recommendations. Prioritize actions that are specific, impactful, and directly address the highest-risk areas.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: recommendationSchema,
            temperature: 0.7,
        },
    });
    const json: Recommendation[] = JSON.parse(response.text);
    return json.sort((a, b) => b.priorityScore - a.priorityScore);
};


export const callGemini = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  const {type, payload} = data;

  try {
    switch (type) {
      case "getForecast":
        return await handleGetForecast(payload as AnalysisResult);
      case "getRecommendations":
        return await handleGetRecommendations(payload as ZipAnalysis[]);
      default:
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with a valid 'type'.",
        );
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
        "internal",
        "An unexpected error occurred while contacting the Gemini API.",
    );
  }
});
