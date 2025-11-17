"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGemini = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
admin.initializeApp();
// The Gemini API key is expected to be set in Firebase config.
// Set it by running: firebase functions:config:set gemini.key="YOUR_API_KEY"
const API_KEY = functions.config().gemini?.key;
if (!API_KEY) {
    throw new Error("Gemini API Key is not set in Firebase Functions config. " +
        "Set it with: firebase functions:config:set gemini.key=\"YOUR_API_KEY\"");
}
const ai = new genai_1.GoogleGenAI({ apiKey: API_KEY });
const forecastSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        threeDay: { type: genai_1.Type.STRING, description: "A risk level for the next 3 days (e.g., 'High Risk', 'Moderate Risk')." },
        threeDaySummary: { type: genai_1.Type.STRING, description: "A brief (5-10 word) summary for the 3-day forecast." },
        sevenDay: { type: genai_1.Type.STRING, description: "A risk level for the next 7 days (e.g., 'Moderate Risk', 'Low Risk')." },
        sevenDaySummary: { type: genai_1.Type.STRING, description: "A brief (5-10 word) summary for the 7-day forecast." },
    },
    required: ["threeDay", "threeDaySummary", "sevenDay", "sevenDaySummary"],
};
const recommendationSchema = {
    type: genai_1.Type.ARRAY,
    items: {
        type: genai_1.Type.OBJECT,
        properties: {
            action: { type: genai_1.Type.STRING, description: "A specific, actionable recommendation (e.g., 'Deploy 2 mobile teams to ZIP 46619')." },
            rationale: { type: genai_1.Type.STRING, description: "A brief explanation for the recommendation (e.g., 'Incidents up 42% vs. baseline')." },
            priorityScore: { type: genai_1.Type.INTEGER, description: "A score from 1-100 indicating urgency." },
        },
        required: ["action", "rationale", "priorityScore"],
    },
};
const handleGetForecast = async (analysis) => {
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
    const text = response.text;
    if (!text) {
        throw new functions.https.HttpsError("internal", "Received an empty response from Gemini API for forecast.");
    }
    return JSON.parse(text);
};
const handleGetRecommendations = async (criticalZips) => {
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
    const text = response.text;
    if (!text) {
        throw new functions.https.HttpsError("internal", "Received an empty response from Gemini API for recommendations.");
    }
    const json = JSON.parse(text);
    return json.sort((a, b) => b.priorityScore - a.priorityScore);
};
exports.callGemini = functions
    .runWith({ timeoutSeconds: 120 })
    .https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { type, payload } = data;
    try {
        switch (type) {
            case "getForecast":
                return await handleGetForecast(payload);
            case "getRecommendations":
                return await handleGetRecommendations(payload);
            default:
                throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid 'type'.");
        }
    }
    catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while contacting the Gemini API.");
    }
});
//# sourceMappingURL=index.js.map