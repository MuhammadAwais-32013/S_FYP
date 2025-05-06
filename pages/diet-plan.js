import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getDietPlan, generateDietPlan } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function DietPlan() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [dietPlan, setDietPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMeal, setActiveMeal] = useState('all');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Try to get saved BMI from localStorage
    const storedBMI = localStorage.getItem('bmi');
    
    if (!storedBMI) {
      router.push('/bmi');
      return;
    }

    fetchDietPlan(parseFloat(storedBMI));
  }, [isLoggedIn, router]);

  const fetchDietPlan = async (bmi) => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getDietPlan(bmi);
      
      if (data.success) {
        setDietPlan(data.dietPlan);
      } else {
        setError(data.error || 'Failed to fetch diet plan');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePlan = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const storedBMI = localStorage.getItem('bmi');
      if (!storedBMI) {
        router.push('/bmi');
        return;
      }
      
      const data = await generateDietPlan(parseFloat(storedBMI));
      
      if (data.success) {
        setDietPlan(data.dietPlan);
      } else {
        setError(data.error || 'Failed to generate new diet plan');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const MealCard = ({ title, items, icon }) => (
    <div className="meal-card">
      <div className="meal-header">
        <div className="flex items-center">
          {icon}
          <h3 className="font-medium ml-2">{title}</h3>
        </div>
      </div>
      <div className="p-4">
        <ul className="list-none space-y-2 text-gray-700">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block bg-green-100 rounded-full p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const getMealIcon = (mealType) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'lunch':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'dinner':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'snacks':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      <Head>
        <title>Diet Plan | AI Diet Consultant</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl gradient-heading mb-4">Your Personalized Diet Plan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your BMI and health profile, we've created a customized diet plan 
            to help you achieve your nutrition goals.
          </p>
        </div>
        
        {error && (
          <div className="p-4 mb-6 rounded bg-red-100 text-red-700 border border-red-200">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="card text-center p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Preparing your personalized diet plan...</p>
            </div>
          </div>
        ) : dietPlan ? (
          <>
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-blue-800">Recommended Diet</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Personalized based on your health profile
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/bmi')} 
                    className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to BMI
                  </button>
                  
                  <button 
                    onClick={handleRegeneratePlan}
                    disabled={isGenerating}
                    className="btn text-sm py-1.5 px-3 flex items-center gap-1"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="meal-filter-tabs">
                <button 
                  onClick={() => setActiveMeal('all')} 
                  className={`meal-tab ${activeMeal === 'all' ? 'active' : ''}`}
                >
                  All Meals
                </button>
                <button 
                  onClick={() => setActiveMeal('breakfast')} 
                  className={`meal-tab ${activeMeal === 'breakfast' ? 'active' : ''}`}
                >
                  Breakfast
                </button>
                <button 
                  onClick={() => setActiveMeal('lunch')} 
                  className={`meal-tab ${activeMeal === 'lunch' ? 'active' : ''}`}
                >
                  Lunch
                </button>
                <button 
                  onClick={() => setActiveMeal('dinner')} 
                  className={`meal-tab ${activeMeal === 'dinner' ? 'active' : ''}`}
                >
                  Dinner
                </button>
                <button 
                  onClick={() => setActiveMeal('snacks')} 
                  className={`meal-tab ${activeMeal === 'snacks' ? 'active' : ''}`}
                >
                  Snacks
                </button>
              </div>
              
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(activeMeal === 'all' || activeMeal === 'breakfast') && (
                    <MealCard 
                      title="Breakfast" 
                      items={dietPlan.breakfast} 
                      icon={getMealIcon('breakfast')} 
                    />
                  )}
                  
                  {(activeMeal === 'all' || activeMeal === 'lunch') && (
                    <MealCard 
                      title="Lunch" 
                      items={dietPlan.lunch} 
                      icon={getMealIcon('lunch')} 
                    />
                  )}
                  
                  {(activeMeal === 'all' || activeMeal === 'dinner') && (
                    <MealCard 
                      title="Dinner" 
                      items={dietPlan.dinner} 
                      icon={getMealIcon('dinner')} 
                    />
                  )}
                  
                  {(activeMeal === 'all' || activeMeal === 'snacks') && (
                    <MealCard 
                      title="Snacks" 
                      items={dietPlan.snacks} 
                      icon={getMealIcon('snacks')} 
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-blue-800">Nutritional Tips</h2>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800 italic">
                  Always consult with a healthcare professional before making significant changes to your diet, 
                  especially if you have health conditions or are on medication.
                </p>
              </div>
              
              <ul className="space-y-3 text-gray-700">
                {dietPlan.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block text-green-500 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="card text-center p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No diet plan available</h3>
              <p className="text-gray-600 mb-6">Please calculate your BMI first to get a personalized diet plan.</p>
              <button 
                onClick={() => router.push('/bmi')}
                className="btn flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate BMI
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 