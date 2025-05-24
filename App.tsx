

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
// FIX: Corrected LivestockInfo to LivestockCareInfo
import { UserProfile, EducationalModule, AppNameSuggestion, WeatherData, MarketPrice, CropTask, PestDisease, SoilNutrientInfo, FarmType, YieldRecord, LivestockAilment, LivestockCareInfo } from './types';
import { NAV_LINKS, EDUCATIONAL_MODULES, APP_NAME_SUGGESTIONS, INITIAL_USER_PROFILE, API_KEY_ERROR_MESSAGE, MOCK_CROP_TASKS } from './constants';
import { 
    Navbar, Sidebar, Card, Button, LoadingSpinner, EducationalModuleCard, VideoLessonDisplay, 
    PestDiagnosisTool, WeatherWidget, TaskReminderWidget, MarketPriceDisplay, OnboardingWizard, 
    AskExpertComponent, SettingsComponent, YieldTracker, PestDiseaseDatabaseDisplay, 
    SoilNutrientInfoDisplay, LivestockAilmentDisplay, LivestockCareDisplay,
    HomeIcon, TractorIcon, BugIcon, SproutIcon, CowIcon, BookOpenIcon, DollarSignIcon, MessageSquareIcon, SettingsIcon, ThermometerIcon, PlusCircleIcon,
    // FIX: Import getWeatherIconUrl
    getWeatherIconUrl
} from './components';
import { suggestAppNamesWithGemini, saveDataToLocalStorage, loadDataFromLocalStorage, fetchWeatherForecast, getGeminiTextResponse } from './services';


// --- Pages / Route Components ---

const HomePage: React.FC<{ userProfile: UserProfile | null; appName: string }> = ({ userProfile, appName }) => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-3xl font-bold text-green-800 flex items-center"> <HomeIcon className="w-8 h-8 mr-2 text-green-600"/> स्वागत छ, {appName} मा!</h2>
      <p className="text-lg text-gray-700">तपाईंको व्यक्तिगत कृषि सहायक।</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <WeatherWidget userProfile={userProfile} />
        <TaskReminderWidget />
      </div>

      <Card title="द्रुत पहुँच">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {NAV_LINKS.filter(link => ["/my-farm", "/pest-disease", "/education", "/market-prices", "/ask-expert", "/soil-nutrient"].includes(link.path)).map(link => (
            <Link key={link.path} to={link.path} className="block p-4 bg-green-100 hover:bg-green-200 rounded-lg text-center transition-colors shadow-sm hover:shadow-md">
              <span className="text-green-700 font-semibold">{link.label}</span>
            </Link>
          ))}
        </div>
      </Card>
      
      <Card title="मुख्य शैक्षिक मोड्युलहरू" icon={<BookOpenIcon className="w-6 h-6 text-green-700"/>}>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EDUCATIONAL_MODULES.slice(0, 3).map(module => (
                <EducationalModuleCard key={module.id} module={module} />
            ))}
        </div>
        <Link to="/education" className="mt-4 inline-block text-green-600 hover:text-green-800 font-semibold">
            सबै मोड्युलहरू हेर्नुहोस् &rarr;
        </Link>
      </Card>
    </div>
  );
};

const MyFarmPage: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'weather' | 'yield'>('calendar');
  const [tasks, setTasks] = useState<CropTask[]>(MOCK_CROP_TASKS); // Using mock tasks for now
  const [weatherForecast, setWeatherForecast] = useState<WeatherData[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const loadWeather = async () => {
      if (userProfile?.location?.district) {
        setLoadingWeather(true);
        const forecast = await fetchWeatherForecast(userProfile.location.district, userProfile.location.coordinates);
        setWeatherForecast(forecast);
        setLoadingWeather(false);
      }
    };
    loadWeather();
  }, [userProfile?.location?.district, userProfile?.location?.coordinates]);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
    // In a real app, save this state to local storage or backend
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-bold text-green-800 flex items-center"><TractorIcon className="w-8 h-8 mr-2 text-green-600"/>मेरो खेत (ड्यास बोर्ड)</h2>
      <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'calendar' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-green-500'}`}>बाली पात्रो र योजना</button>
        <button id="weather-details" onClick={() => setActiveTab('weather')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'weather' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-green-500'}`}>मौसम पूर्वानुमान</button>
        <button onClick={() => setActiveTab('yield')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'yield' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-green-500'}`}>उत्पादन ट्र्याकिङ</button>
      </div>

      {activeTab === 'calendar' && (
        <Card title="बाली पात्रो र कार्यहरू" id="crop-calendar">
           <p className="mb-2 text-sm text-gray-600">तपाईंको चयन गरिएको बाली र स्थानको आधारमा यो पात्रो अनुकूलित हुन्छ। (अहिले नमूना कार्यहरू देखाइएको छ)</p>
           <div className="space-y-3">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className={`p-3 rounded-lg shadow-sm flex items-center justify-between ${task.isCompleted ? 'bg-green-100 opacity-70' : 'bg-white'}`}>
                <div>
                  <p className={`font-semibold ${task.isCompleted ? 'line-through text-gray-500' : 'text-green-800'}`}>{task.taskName}</p>
                  <p className="text-sm text-gray-600">{task.cropName} ({task.plotName}) - {new Date(task.dueDate).toLocaleDateString('ne-NP', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  {task.details && <p className="text-xs text-gray-500">{task.details}</p>}
                </div>
                <Button onClick={() => toggleTaskCompletion(task.id)} variant={task.isCompleted ? "secondary" : "primary"} size="sm">
                  {task.isCompleted ? "अपूर्ण" : "सम्पन्न"}
                </Button>
              </div>
            )) : <p>कुनै कार्यहरू छैनन्।</p>}
           </div>
           <Button className="mt-4 flex items-center" variant="ghost" size="sm"> <PlusCircleIcon className="w-4 h-4 mr-1"/> नयाँ कार्य थप्नुहोस्</Button>
        </Card>
      )}

      {activeTab === 'weather' && (
         <Card title="विस्तृत मौसम पूर्वानुमान" icon={<ThermometerIcon className="w-5 h-5 text-green-700"/>}>
          {loadingWeather && <LoadingSpinner />}
          {!loadingWeather && weatherForecast.length === 0 && <p>मौसम पूर्वानुमान उपलब्ध छैन। कृपया आफ्नो स्थान सेटिङमा गएर निश्चित गर्नुहोस्।</p>}
          {!loadingWeather && weatherForecast.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">मिति</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">तापक्रम</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">वर्षा (mm)</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">विवरण</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherForecast.map(day => (
                    <tr key={day.date} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm text-gray-700">{new Date(day.date).toLocaleDateString('ne-NP', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td className="py-2 px-3 text-sm text-gray-700">{day.temp}°C {day.temp_min && day.temp_max && `(${day.temp_min}-${day.temp_max}°C)`}</td>
                      <td className="py-2 px-3 text-sm text-gray-700">{day.precipitation}</td>
                      <td className="py-2 px-3 text-sm text-gray-700 flex items-center">
                        <img src={getWeatherIconUrl(day.icon)} alt={day.description} className="w-6 h-6 mr-1"/>
                        {day.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
      {activeTab === 'yield' && (
        <YieldTracker />
      )}
    </div>
  );
};

const PestDiseasePage: React.FC = () => (
  <div className="p-4 space-y-6">
    <h2 className="text-3xl font-bold text-green-800 flex items-center"><BugIcon className="w-8 h-8 mr-2 text-green-600"/>रोग तथा किरा व्यवस्थापन</h2>
    <PestDiagnosisTool />
    <PestDiseaseDatabaseDisplay />
  </div>
);

const SoilNutrientPage: React.FC = () => (
  <div className="p-4 space-y-6">
    <h2 className="text-3xl font-bold text-green-800 flex items-center"><SproutIcon className="w-8 h-8 mr-2 text-green-600"/>माटो र पोषक तत्व व्यवस्थापन</h2>
    <SoilNutrientInfoDisplay />
  </div>
);

const LivestockPage: React.FC = () => (
  <div className="p-4 space-y-6">
    <h2 className="text-3xl font-bold text-green-800 flex items-center"><CowIcon className="w-8 h-8 mr-2 text-green-600"/>पशुपन्छी स्वास्थ्य र व्यवस्थापन</h2>
    <LivestockAilmentDisplay />
    <LivestockCareDisplay />
  </div>
);

const EducationHubPage: React.FC = () => (
  <div className="p-4">
    <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center"><BookOpenIcon className="w-8 h-8 mr-2 text-green-600"/>शैक्षिक सामग्री</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {EDUCATIONAL_MODULES.map(module => (
        <EducationalModuleCard key={module.id} module={module} />
      ))}
    </div>
  </div>
);

const ModuleDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = EDUCATIONAL_MODULES.find(m => m.id === moduleId);
  const navigate = useNavigate();

  if (!module) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-xl mb-4">शैक्षिक मोड्युल फेला परेन।</p>
        <Button onClick={() => navigate('/education')}>सबै मोड्युलहरूमा फर्कनुहोस्</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <nav aria-label="breadcrumb">
        <ol className="flex space-x-2 text-sm text-gray-500">
          <li><Link to="/education" className="hover:underline hover:text-green-600">शैक्षिक सामग्री</Link></li>
          <li><span className="select-none">/</span></li>
          <li className="font-medium text-green-700 truncate max-w-xs sm:max-w-sm md:max-w-md" aria-current="page">{module.title}</li>
        </ol>
      </nav>
      <h2 className="text-4xl font-bold text-green-800 mb-2">{module.title}</h2>
      <p className="text-lg text-gray-600 mb-8">यस मोड्युलमा {module.lessons.length} वटा पाठहरू छन्।</p>
      
      <div className="space-y-12">
        {module.lessons.map((lesson, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <VideoLessonDisplay lesson={lesson} />
          </Card>
        ))}
      </div>
    </div>
  );
};

const MarketPricesPage: React.FC<{userProfile: UserProfile | null}> = ({userProfile}) => (
    <div className="p-4 space-y-6">
        <h2 className="text-3xl font-bold text-green-800 flex items-center"><DollarSignIcon className="w-8 h-8 mr-2 text-green-600"/>बजार मूल्य</h2>
        <MarketPriceDisplay userProfile={userProfile} />
    </div>
);

const AskExpertPage: React.FC = () => (
    <div className="p-4 space-y-6">
         <h2 className="text-3xl font-bold text-green-800 flex items-center"><MessageSquareIcon className="w-8 h-8 mr-2 text-green-600"/>विज्ञलाई सोध्नुहोस्</h2>
        <AskExpertComponent />
    </div>
);

const SettingsPage: React.FC<{userProfile: UserProfile | null, onUpdateProfile: (profile: UserProfile) => void}> = ({userProfile, onUpdateProfile}) => (
    <div className="p-4 space-y-6">
        <h2 className="text-3xl font-bold text-green-800 flex items-center"><SettingsIcon className="w-8 h-8 mr-2 text-green-600"/>सेटिङहरू</h2>
        <SettingsComponent userProfile={userProfile} onUpdateProfile={onUpdateProfile} />
    </div>
);


const AppNameSuggester: React.FC<{ onNamesSuggested: (names: AppNameSuggestion[]) => void }> = ({ onNamesSuggested }) => {
  const [suggestions, setSuggestions] = useState<AppNameSuggestion[]>(APP_NAME_SUGGESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        setError(API_KEY_ERROR_MESSAGE + " पूर्वनिर्धारित नामहरू प्रयोग गर्दै।");
        setSuggestions(APP_NAME_SUGGESTIONS); 
        onNamesSuggested(APP_NAME_SUGGESTIONS);
        return;
      }
      const geminiSuggestions = await suggestAppNamesWithGemini();
      if (geminiSuggestions.length > 0 && !geminiSuggestions[0].name.startsWith("Error")) {
         setSuggestions(geminiSuggestions);
         onNamesSuggested(geminiSuggestions);
      } else {
          setError(geminiSuggestions[0]?.reason || "Gemini बाट नामहरू ल्याउन असफल भयो। पूर्वनिर्धारित नामहरू प्रयोग गर्दै।");
          setSuggestions(APP_NAME_SUGGESTIONS);
          onNamesSuggested(APP_NAME_SUGGESTIONS);
      }
    } catch (e) {
      const errorMessage = (e as Error).message;
      setError(errorMessage + " पूर्वनिर्धारित नामहरू प्रयोग गर्दै।");
      if (errorMessage.includes("API कुञ्जी")) { // More specific error for API key issue
          setError(API_KEY_ERROR_MESSAGE + " पूर्वनिर्धारित नामहरू प्रयोग गर्दै।");
      }
      setSuggestions(APP_NAME_SUGGESTIONS);
      onNamesSuggested(APP_NAME_SUGGESTIONS);
    } finally {
      setLoading(false);
    }
  }, [onNamesSuggested]);

  useEffect(() => {
    // Load initially with default names, then try to fetch if API key might exist.
    onNamesSuggested(APP_NAME_SUGGESTIONS); 
    if (process.env.API_KEY) { // Attempt to fetch if API_KEY is perceived to be available
       // fetchNames(); // Optionally auto-fetch on load if API key seems present
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold text-gray-700 mb-3">एपको नाम सुझावहरू:</h3>
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 bg-red-100 p-2 rounded-md text-sm" role="alert">{error}</p>}
      {!loading && suggestions.length > 0 && (
        <ul className="space-y-2 mb-4">
          {suggestions.map((s, i) => (
            <li key={i} className="p-2 border rounded-md bg-gray-50">
              <p className="font-semibold text-green-700">{s.name}</p>
              {s.reason && <p className="text-xs text-gray-500">{s.reason}</p>}
            </li>
          ))}
        </ul>
      )}
      <Button onClick={fetchNames} disabled={loading || !process.env.API_KEY} variant="secondary">
        { !process.env.API_KEY ? "API Key आवश्यक" : (loading ? "लोड हुँदै..." : "थप नामहरू उत्पन्न गर्नुहोस् (Gemini)")}
      </Button>
       {!process.env.API_KEY && <p className="text-xs text-red-500 mt-1">{API_KEY_ERROR_MESSAGE}</p>}
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appName, setAppName] = useState<string>(APP_NAME_SUGGESTIONS[0].name); 
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadedProfile = loadDataFromLocalStorage<UserProfile>('userProfile');
    if (loadedProfile) {
      setUserProfile(loadedProfile);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
    setLoadingProfile(false);

    const storedAppName = loadDataFromLocalStorage<string>('appName');
    if(storedAppName) setAppName(storedAppName);

  }, []);

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    saveDataToLocalStorage('userProfile', profile);
    setShowOnboarding(false);
  };
  
  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveDataToLocalStorage('userProfile', profile);
  };

  const handleAppNameSuggested = (names: AppNameSuggestion[]) => {
      if(names.length > 0 && !names[0].name.startsWith("Error")) {
          const newName = names[0].name;
          setAppName(newName);
          saveDataToLocalStorage('appName', newName);
      } else if (names.length > 0) { 
          const defaultName = names[0].name.startsWith("Error") || names[0].name.startsWith("Offline Error") ? APP_NAME_SUGGESTIONS[0].name : names[0].name;
          setAppName(defaultName);
          saveDataToLocalStorage('appName', defaultName);
      }
  };

  if (loadingProfile) {
    return <div className="flex justify-center items-center min-h-screen bg-green-50"><LoadingSpinner size="w-16 h-16" /></div>;
  }
  
  if (showOnboarding && !userProfile) { 
    return <OnboardingWizard onComplete={handleProfileComplete} />;
  }

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} appName={appName} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-grow container mx-auto px-0 sm:px-4 py-6 bg-green-50">
          <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}>
            <Routes>
              <Route path="/" element={<HomePage userProfile={userProfile} appName={appName} />} />
              <Route path="/my-farm" element={<MyFarmPage userProfile={userProfile} />} />
              <Route path="/pest-disease" element={<PestDiseasePage />} />
              <Route path="/soil-nutrient" element={<SoilNutrientPage />} />
              <Route path="/livestock" element={<LivestockPage />} />
              <Route path="/education" element={<EducationHubPage />} />
              <Route path="/education/:moduleId" element={<ModuleDetailPage />} />
              <Route path="/market-prices" element={<MarketPricesPage userProfile={userProfile}/>} />
              <Route path="/ask-expert" element={<AskExpertPage />} />
              <Route path="/settings" element={<SettingsPage userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />} />
              <Route path="/suggest-names" element={<AppNameSuggester onNamesSuggested={handleAppNameSuggested} />} /> 
            </Routes>
          </Suspense>
        </main>
        <footer className="bg-green-800 text-white text-center p-4">
          <p>&copy; {new Date().getFullYear()} {appName}. सर्वाधिकार सुरक्षित।</p>
          <p className="text-xs mt-1">कृषि ज्ञान र प्रविधिको साथी।</p>
           <Link to="/suggest-names" className="text-xs text-green-300 hover:text-green-100 mt-1 block">एपको नाम परिवर्तन गर्ने? (AI सुझाव)</Link>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;