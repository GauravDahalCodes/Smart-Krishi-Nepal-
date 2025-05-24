

export enum SupportedLanguage {
  Nepali = "ne",
  English = "en",
}

export enum FarmType {
  Crop = "वाली",
  Livestock = "पशुपन्छी",
  Mixed = "मिश्रित",
  Horticulture = "बागवानी",
}

export interface UserProfile {
  language: SupportedLanguage;
  location?: {
    district: string;
    municipality: string;
    coordinates?: { lat: number; lon: number };
  };
  farmType?: FarmType;
  primaryCrops: string[];
}

export interface WeatherData {
  date: string;
  temp: number; // Celsius
  temp_min?: number;
  temp_max?: number;
  precipitation: number; // mm
  humidity: number; // %
  windSpeed: number; // km/h
  description: string; // e.g., "बादल लागेको"
  icon?: string; // Weather icon identifier (e.g., OpenWeatherMap codes)
  sunrise?: number; // timestamp
  sunset?: number; // timestamp
}

export interface WeatherAdvisory {
  id: string;
  message: string; // Nepali
  type: 'warning' | 'info' | 'critical';
}

export interface MarketPrice {
  id:string;
  commodity: string; // e.g., "धान"
  market: string; // e.g., "कालिमाटी"
  price: number; // NPR per unit
  unit: string; // e.g., "प्रति क्विन्टल"
  date: string; // YYYY-MM-DD
}

export interface CropTask {
  id: string;
  plotName: string;
  cropName: string;
  taskName: string; // e.g., "सिंचाई"
  dueDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  details?: string; // e.g., "बिहान १० बजे"
}

export interface PestDisease {
  id: string;
  name: string; // Nepali
  scientificName?: string;
  type: 'pest' | 'disease';
  affectedCrops: string[]; // e.g., ["धान", "मकै"]
  description: string; // Nepali
  symptoms: string[]; // Nepali
  images: string[]; // URLs or base64 (placeholders for now)
  prevention: string[]; // Nepali
  organicControl: string[]; // Nepali
  chemicalControl?: {
    chemicalName: string; // Generic
    dosage: string;
    method: string;
    safety: string;
    phi: string; // Pre-Harvest Interval in days
  }[];
}

export interface SoilNutrientInfo {
  id: string;
  title: string;
  category: 'soilType' | 'phLevel' | 'nutrientDeficiency' | 'organicMatter' | 'fertilizerRec' | 'soilTesting';
  content: string; // Detailed textual content in Nepali
  visualAid?: string; // Image URL for placeholder
  details?: { // For structured data like nutrient deficiencies
    nutrient?: 'N' | 'P' | 'K' | 'Ca' | 'Mg' | 'S' | 'Fe' | 'Mn' | 'Zn' | 'Cu' | 'B' | 'Mo';
    cropSymptoms?: { crop: string, symptom: string }[];
    generalSymptoms?: string;
    // FIX: Added optional visualAid property to the details objects.
    visualAid?: string; 
  }[];
}

export interface LivestockAilment {
  id: string;
  name: string; // Nepali
  animalTypes: string[]; // e.g., ["गाई", "भैंसी", "बाख्रा"]
  symptoms: string[];
  prevention: string[];
  firstAid?: string[];
  treatmentNotes?: string; // General notes, not prescriptions
}

export interface LivestockCareInfo {
  id: string;
  topic: 'vaccination' | 'feedNutrition' | 'hygieneShelter' | 'breeding';
  animalTypes: string[];
  title: string; // Nepali
  content: string; // Detailed textual content
  schedule?: { vaccine: string, age: string, notes: string }[]; // For vaccination
}


export interface VideoLesson {
  title: string; // Nepali
  conceptOutline: string; // Nepali, detailed scene breakdown
  textSummary: string[]; // Nepali, bullet points
  furtherReading: string; // Nepali
  youtubeLinkPlaceholder?: string; // e.g., "A Nepali farmer demonstrates making compost..."
  videoUrl?: string; // Actual video URL if available
}

export interface EducationalModule {
  id: string;
  title: string; // Nepali
  lessons: VideoLesson[];
}

export interface FarmerSuccessStory {
  id: string;
  farmerName: string;
  location: string; // e.g., "चितवन"
  storyVideoUrl?: string;
  storyText: string; // Nepali
  keyLearnings: string[]; // Nepali
  image: string; // URL
}

export interface AppNameSuggestion {
  name: string;
  reason?: string;
}

export interface YieldRecord {
    id: string;
    cropName: string;
    plotName?: string;
    harvestDate: string; // YYYY-MM-DD
    quantity: number;
    unit: string; // e.g., "किलोग्राम", "क्विन्टल", "गोटा"
}

// For Gemini API responses
export interface GeminiResponseChunk {
  text: string;
}
export interface GeminiGenerateContentResponse {
  text: string;
  candidates?: {
    groundingMetadata?: {
      groundingChunks?: { web: { uri: string; title: string } }[];
    };
  }[];
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}