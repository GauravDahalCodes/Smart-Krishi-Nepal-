
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppNameSuggestion, MarketPrice, WeatherAdvisory, WeatherData, GeminiGenerateContentResponse, GroundingChunkWeb, YieldRecord } from './types';
import { API_KEY_ERROR_MESSAGE, MOCK_MARKET_PRICES, MOCK_WEATHER_ADVISORIES, MOCK_WEATHER_FORECAST_TODAY, MOCK_INITIAL_YIELD_RECORDS, OFFLINE_ERROR_MESSAGE } from './constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

// --- Gemini Service Functions ---
export const suggestAppNamesWithGemini = async (): Promise<AppNameSuggestion[]> => {
  if (!navigator.onLine) {
    return [{ name: "Offline Error", reason: OFFLINE_ERROR_MESSAGE }];
  }
  if (!ai) {
    console.error(API_KEY_ERROR_MESSAGE);
    return [{ name: "Error: API Key Missing", reason: API_KEY_ERROR_MESSAGE }];
  }
  try {
    const prompt = `Suggest 5 culturally relevant and appealing names for an agricultural advisory app for Nepali farmers. The app focuses on modern techniques, pest control, weather, and market prices. Provide names in Nepali (Devanagari script) and a brief reason for each. Format as JSON array of objects with "name" and "reason" keys. Example: [{"name": "किसानको साथी", "reason": "Farmer's friend, approachable."}]`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const suggestions: AppNameSuggestion[] = JSON.parse(jsonStr);
    return suggestions;
  } catch (error) {
    console.error("Error fetching app name suggestions from Gemini:", error);
    return [{ name: "Error fetching names", reason: (error as Error).message }];
  }
};

export const getGeminiTextResponse = async (prompt: string, useSearchGrounding: boolean = false): Promise<GeminiGenerateContentResponse> => {
  if (!navigator.onLine) {
    throw new Error(OFFLINE_ERROR_MESSAGE);
  }
  if (!ai) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }
  try {
    const config: any = {
       // thinkingConfig: { thinkingBudget: 0 } // Example: Disable thinking for low latency if needed
    };
    if (useSearchGrounding) {
      config.tools = [{googleSearch: {}}];
    } else {
       // Default to enabling thinking for higher quality if not using search.
       // Omit thinkingConfig entirely if you want default (thinking enabled).
    }


    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined,
    });
    
    return {
        text: response.text,
        candidates: response.candidates
    };

  } catch (error) {
    console.error("Error getting text response from Gemini:", error);
    throw error;
  }
};

export const streamGeminiTextResponse = async (prompt: string, onChunk: (chunk: string) => void, onComplete: () => void, onError: (error: Error) => void): Promise<void> => {
    if (!navigator.onLine) {
        onError(new Error(OFFLINE_ERROR_MESSAGE));
        onComplete();
        return;
    }
    if (!ai) {
        onError(new Error(API_KEY_ERROR_MESSAGE));
        onComplete(); 
        return;
    }
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            onChunk(chunk.text);
        }
    } catch (error) {
        console.error("Error streaming text response from Gemini:", error);
        onError(error as Error);
    } finally {
        onComplete();
    }
};


// --- Mock Weather Service (Simulating a more realistic API structure) ---
// In a real app, this would call a weather API (e.g., OpenWeatherMap) using district coordinates.
// A real API would require an API key and careful handling of rate limits and data parsing.
// For OpenWeatherMap (example): API might be like: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=ne
export const fetchWeatherForecast = async (district: string, coordinates?: {lat: number, lon: number}): Promise<WeatherData[]> => {
  console.log(`Fetching weather for ${district}... (Simulated)`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));

  // If coordinates are provided, they would be used in a real API call.
  // For now, we'll generate mock data based on the district name for slight variation.
  
  const today = new Date();
  const generatedForecast: WeatherData[] = [];

  // Generate today's weather (similar to MOCK_WEATHER_FORECAST_TODAY but can be varied)
  generatedForecast.push({
    date: today.toISOString().split('T')[0],
    temp: 26 + (district.length % 5) - 2, // Slight variation based on district name length
    temp_min: 22 + (district.length % 4),
    temp_max: 28 + (district.length % 6),
    precipitation: Math.floor(Math.random() * 10), // Random precipitation
    humidity: 70 + Math.floor(Math.random() * 15) - 7,
    windSpeed: 8 + Math.floor(Math.random() * 7) - 3,
    description: Math.random() > 0.6 ? 'सफा आकाश' : (Math.random() > 0.3 ? 'हल्का बादल' : 'छिटपुट वर्षा'),
    icon: Math.random() > 0.6 ? '01d' : (Math.random() > 0.3 ? '02d' : '10d'), // Example OpenWeatherMap icons
    sunrise: new Date(today.setHours(5, 30, 0, 0)).getTime() / 1000,
    sunset: new Date(today.setHours(18, 45, 0, 0)).getTime() / 1000,
  });

  // Generate forecast for the next 6 days
  for (let i = 1; i <= 6; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    generatedForecast.push({
      date: nextDay.toISOString().split('T')[0],
      temp: 25 + Math.floor(Math.random() * 5) - 2 + (district.length % 3 -1),
      temp_min: 20 + Math.floor(Math.random() * 4),
      temp_max: 27 + Math.floor(Math.random() * 6),
      precipitation: Math.floor(Math.random() * 15),
      humidity: 65 + Math.floor(Math.random() * 20) - 10,
      windSpeed: 7 + Math.floor(Math.random() * 8) - 4,
      description: Math.random() > 0.5 ? 'सफा आकाश' : (Math.random() > 0.2 ? 'हल्का बादल लागेको' : 'वर्षाको सम्भावना'),
      icon: Math.random() > 0.5 ? '01d' : (Math.random() > 0.2 ? '03d' : '09d'),
    });
  }
  return generatedForecast;
};


export const fetchWeatherAdvisories = async (district: string): Promise<WeatherAdvisory[]> => {
  console.log(`Fetching advisories for ${district}... (Simulated)`);
  await new Promise(resolve => setTimeout(resolve, 300));
  // More varied advisories based on mock weather
  const advisories: WeatherAdvisory[] = [];
  const randomFactor = Math.random();
  if (randomFactor < 0.3) {
    advisories.push({id: 'adv_rain', message: 'आगामी २४ घण्टामा केही स्थानमा हल्का देखि मध्यम वर्षाको सम्भावना छ, आवश्यक तयारी गर्नुहोस्।', type: 'info'});
  } else if (randomFactor < 0.6) {
     advisories.push({id: 'adv_temp_rise', message: 'तापक्रममा सामान्य वृद्धि हुने देखिन्छ, बालीमा सिँचाइको अवस्था ख्याल गर्नुहोस्।', type: 'info'});
  }
  if (MOCK_WEATHER_FORECAST_TODAY.precipitation > 5) {
      advisories.push({id: 'adv_spray_stop', message: 'वर्षाको पूर्वानुमान भएकाले आज कीटनाशक वा मल छर्कने काम स्थगित गर्नुहोस्।', type: 'warning'});
  }
  if (advisories.length === 0) {
      advisories.push({id: 'adv_general', message: 'मौसम सामान्य रहने देखिन्छ। नियमित कृषि कार्य जारी राख्नुहोस्।', type: 'info'});
  }
  return [...MOCK_WEATHER_ADVISORIES, ...advisories].slice(0,2); // Return a mix for variety, max 2
};

// --- Mock Market Price Service ---
// Note: Real-time, localized agricultural market prices for Nepal are very difficult to find via free, public APIs.
// This service uses mock data. A production app would need a dedicated data source.
export const fetchMarketPrices = async (district?: string): Promise<MarketPrice[]> => {
  console.log(`Fetching market prices for ${district || 'all regions'}... (Mock Data)`);
  await new Promise(resolve => setTimeout(resolve, 600));
  if (district) {
    return MOCK_MARKET_PRICES.filter(p => p.market.toLowerCase().includes(district.toLowerCase()) || p.commodity.toLowerCase().includes(district.toLowerCase()) || district === "सबै जिल्ला");
  }
  return MOCK_MARKET_PRICES;
};

// --- Mock Pest/Disease Diagnosis Service ---
export const diagnoseCropIssue = async (imageFile: File, description?: string): Promise<string> => {
  console.log(`Diagnosing crop issue for image: ${imageFile.name}, description: ${description || 'N/A'} (Simulated AI)`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing
  
  // Simulate a slightly more "intelligent" mock response
  const keywords = (description || "").toLowerCase();
  if (keywords.includes("पहेँलो") && keywords.includes("पात")) {
    return "पात पहेँलो हुनु नाइट्रोजन वा आइरनको कमीको लक्षण हुन सक्छ। कृपया माटो परीक्षण वा विज्ञसँग थप जानकारी लिनुहोस्।";
  } else if (keywords.includes("थोप्ला") || keywords.includes("दाग")) {
    return "पात वा फलमा थोप्ला देखिनु ढुसीजन्य रोगको सङ्केत हुन सक्छ। धानको खैरो थोप्ले रोग वा गोलभेडाको डढुवा जस्ता रोगका लक्षणहरू मिलाउनुहोस्।";
  } else if (keywords.includes("किरा") || keywords.includes("प्वाल")) {
    return "डाँठ वा फलमा प्वाल देखिनु गवारो वा अन्य किराको प्रकोप हुन सक्छ। मकैको डाँठ गवारो वा फल कुहाउने औंसाको लक्षण विचार गर्नुहोस्।";
  }

  const mockDiagnoses = [
    "धानको पातमा खैरो थोप्ले रोग (Brown Spot) को शंका। लक्षणहरू मिलाउनुहोस्।",
    "मकैको डाँठमा गवारो किराको प्रकोप हुन सक्छ। थप निरीक्षण गर्नुहोस्।",
    "गोलभेडामा डढुवा रोगको प्रारम्भिक लक्षण जस्तो देखिन्छ। जैविक विषादी प्रयोग गर्ने विचार गर्नुहोस्।"
  ];
  return mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];
};

// --- Local Storage Service ---
export const saveDataToLocalStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
};

export const loadDataFromLocalStorage = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading from local storage:", error);
    return null;
  }
};

// --- Yield Records Service ---
const YIELD_RECORDS_KEY = 'yieldRecords';

export const getYieldRecords = (): YieldRecord[] => {
  return loadDataFromLocalStorage<YieldRecord[]>(YIELD_RECORDS_KEY) || MOCK_INITIAL_YIELD_RECORDS;
};

export const addYieldRecord = (record: Omit<YieldRecord, 'id'>): YieldRecord => {
  const records = getYieldRecords();
  const newRecord: YieldRecord = { ...record, id: `yr${new Date().getTime()}` };
  saveDataToLocalStorage(YIELD_RECORDS_KEY, [newRecord, ...records]);
  return newRecord;
};

export const updateYieldRecord = (updatedRecord: YieldRecord): YieldRecord[] => {
  let records = getYieldRecords();
  records = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
  saveDataToLocalStorage(YIELD_RECORDS_KEY, records);
  return records;
};

export const deleteYieldRecord = (recordId: string): YieldRecord[] => {
  let records = getYieldRecords();
  records = records.filter(r => r.id !== recordId);
  saveDataToLocalStorage(YIELD_RECORDS_KEY, records);
  return records;
};
