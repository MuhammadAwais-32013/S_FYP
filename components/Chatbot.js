import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { getMedicalRecords } from '../utils/api';

const Chatbot = ({ isOpen, onClose }) => {
  const { isLoggedIn, userId } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([
    { text: 'Hello! I am your AI Diet Assistant. How can I help you today?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [userInfo, setUserInfo] = useState({
    age: null,
    gender: null,
    weight: null,
    height: null,
    activityLevel: null,
    healthConditions: [],
    dietaryPreferences: [],
    goal: null
  });
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState(false);
  const [isCollectingInfo, setIsCollectingInfo] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API configuration from environment variables
  const API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY;
  const API_ENDPOINT = process.env.NEXT_PUBLIC_LLM_API_ENDPOINT;

  const questions = [
    { key: 'age', question: 'What is your age?' },
    { key: 'gender', question: 'What is your gender? (male/female/other)' },
    { key: 'weight', question: 'What is your current weight in kg?' },
    { key: 'height', question: 'What is your height in cm?' },
    { key: 'activityLevel', question: 'What is your activity level? (sedentary/lightly active/moderately active/very active)' },
    { key: 'healthConditions', question: 'Do you have any health conditions? (Type "none" if not applicable)' },
    { key: 'dietaryPreferences', question: 'Do you have any dietary preferences or restrictions? (e.g., vegetarian, vegan, gluten-free, etc.)' },
    { key: 'goal', question: 'What is your main goal? (weight loss/muscle gain/maintenance)' }
  ];

  const fetchMedicalRecords = async () => {
    if (!isLoggedIn) return null;
    
    setIsLoadingMedicalRecords(true);
    try {
      const response = await getMedicalRecords();
      if (response.success) {
        setMedicalRecords(response.records);
        return response.records;
      } else {
        console.error('Error fetching medical records:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      return null;
    } finally {
      setIsLoadingMedicalRecords(false);
    }
  };

  // Generate medical record summary for the AI
  const generateMedicalRecordSummary = (records) => {
    if (!records || records.length === 0) {
      return "No medical records available.";
    }

    // Sort records by date (newest first)
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Get the most recent record
    const latestRecord = sortedRecords[0];
    
    // Generate summary of all records
    const recordSummary = sortedRecords.map(record => {
      return `Date: ${new Date(record.date).toLocaleDateString()}
Blood Pressure: ${record.bloodPressure}
Blood Sugar: ${record.bloodSugar} mmol/L
Notes: ${record.notes || 'None'}`
    }).join('\n\n');

    return `User's Medical Records Summary:
Latest Record (${new Date(latestRecord.date).toLocaleDateString()}):
- Blood Pressure: ${latestRecord.bloodPressure}
- Blood Sugar: ${latestRecord.bloodSugar} mmol/L
- Notes: ${latestRecord.notes || 'None'}

Medical History:
${recordSummary}`;
  };

  // Redirect to login if not logged in
  const handleRedirectToLogin = () => {
    router.push('/login');
    onClose();
  };

  const handleUserInfo = (input) => {
    const currentKey = questions[currentQuestion].key;
    let value = input;

    // Process different types of inputs
    if (currentKey === 'age' || currentKey === 'weight' || currentKey === 'height') {
      value = parseFloat(input);
    } else if (currentKey === 'healthConditions' || currentKey === 'dietaryPreferences') {
      value = input.toLowerCase() === 'none' ? [] : input.split(',').map(item => item.trim());
    }

    setUserInfo(prev => ({
      ...prev,
      [currentKey]: value
    }));

    // Move to next question or finish
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setMessages(prev => [...prev, { text: questions[currentQuestion + 1].question, isBot: true }]);
    } else {
      setIsCollectingInfo(false);
      setCurrentQuestion(null);
      // Generate personalized response
      generatePersonalizedResponse();
    }
  };

  const generatePersonalizedResponse = async () => {
    const userInfoText = `
      User Information:
      Age: ${userInfo.age}
      Gender: ${userInfo.gender}
      Weight: ${userInfo.weight} kg
      Height: ${userInfo.height} cm
      Activity Level: ${userInfo.activityLevel}
      Health Conditions: ${userInfo.healthConditions.join(', ') || 'None'}
      Dietary Preferences: ${userInfo.dietaryPreferences.join(', ') || 'None'}
      Goal: ${userInfo.goal}
    `;

    // Fetch medical records for personalized diet plan
    let medicalRecordText = "No medical records available.";
    const records = await fetchMedicalRecords();
    if (records && records.length > 0) {
      medicalRecordText = generateMedicalRecordSummary(records);
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{
                text: `Based on the following user information and medical records, provide a personalized diet and health plan. Focus on practical, actionable advice that considers their specific circumstances and health status:

                ${userInfoText}

                ${medicalRecordText}

                Please provide:
                1. A brief analysis of their current situation considering their medical records
                2. Specific dietary recommendations with food examples tailored to their health status
                3. Detailed exercise suggestions appropriate for their fitness level and medical conditions
                4. Workout routines that complement their dietary goals and are safe given their health status
                5. Pre and post-workout nutrition recommendations
                6. Lifestyle modifications for better adherence and health management
                7. Important precautions or considerations based on their medical records
                
                Keep the response clear, practical, and easy to follow. Pay special attention to any health concerns indicated in their medical records.`
              }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          model: 'gemini-1.5-flash',
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I encountered an error while generating your personalized plan. Please try again.", 
        isBot: true 
      }]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { text: inputText, isBot: false }];
    setMessages(updatedMessages);
    setInputText('');

    // Show typing indicator
    setMessages(prev => [...prev, { isBot: true, isTyping: true }]);

    try {
      if (isCollectingInfo) {
        handleUserInfo(inputText);
        setMessages(prev => prev.filter(msg => !msg.isTyping));
        return;
      }

      // Check if it's just a greeting
      const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
      const isGreeting = greetings.some(greeting => 
        inputText.toLowerCase().trim() === greeting || 
        inputText.toLowerCase().trim().startsWith(`${greeting} `)
      );

      if (isGreeting) {
        // Respond with a simple greeting without fetching medical records
        const greetingResponse = "Hello! I'm your Diet Assistant. I can help you with nutrition advice, meal planning, and personalized diet recommendations. How can I assist you today?";
        
        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.isTyping);
          return [...filtered, { text: greetingResponse, isBot: true }];
        });
        return;
      }

      // Check if the message requires personalized information
      const personalizedKeywords = [
        'diet plan', 'meal plan', 'weight loss plan', 'weight gain plan',
        'personalized diet', 'custom diet', 'specific diet', 'my diet',
        'weight management', 'nutrition plan', 'eating plan', 'workout plan',
        'exercise routine', 'fitness plan', 'training program', 'my workout',
        'personal fitness', 'custom workout', 'sports nutrition', 'exercise recommendation',
        'my medical', 'my health', 'my condition', 'based on my health'
      ];
      
      // Check if this is a diet query that needs personalization based on medical records
      const needsMedicalRecords = personalizedKeywords.some(keyword => 
        inputText.toLowerCase().includes(keyword)
      );
      
      // Check if this is any diet-related query
      const isDietRelatedQuery = needsMedicalRecords || 
        inputText.toLowerCase().includes('diet') || 
        inputText.toLowerCase().includes('nutrition') ||
        inputText.toLowerCase().includes('food') ||
        inputText.toLowerCase().includes('eating') ||
        inputText.toLowerCase().includes('meal');

      if (personalizedKeywords.some(keyword => inputText.toLowerCase().includes(keyword))) {
        setIsCollectingInfo(true);
        setCurrentQuestion(0);
        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.isTyping);
          return [...filtered, { 
            text: "I'll help you create a personalized plan. Let's start by gathering some information about you.\n\n" + questions[0].question, 
            isBot: true 
          }];
        });
        return;
      }

      // For personalized diet queries, fetch medical records only if needed
      let medicalRecordText = "No medical records available.";
      if (needsMedicalRecords) {
        const records = await fetchMedicalRecords();
        if (records && records.length > 0) {
          medicalRecordText = generateMedicalRecordSummary(records);
        }
      }

      // For general nutrition queries, use the regular conversation flow
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{
                text: `You are a specialized Nutrition and Diet Assistant. Your role is strictly focused on providing guidance related to:
                - Personalized diet plans
                - Nutritional advice and recommendations
                - Meal planning and recipes
                - Dietary restrictions and preferences
                - Food groups and their benefits
                - Caloric intake and macronutrients
                - Healthy eating habits
                - Weight management through diet
                - Exercise recommendations and fitness tips
                - Workout routines that complement diet plans
                - Pre and post-workout nutrition
                - Sports nutrition and hydration guidance
                - Lifestyle modifications for better health
                - Tips for maintaining healthy habits
                - Supplements and their nutritional impact
                
                ${needsMedicalRecords ? `IMPORTANT: This is a personalized diet query that requires consideration of the user's medical records.
                The user has the following medical information that should inform your recommendations:
                ${medicalRecordText}
                
                If the records show high blood pressure or high blood sugar, adjust your dietary recommendations accordingly.` : 
                "This is a general query that doesn't require personalized medical information. Provide general nutrition information without referring to user's specific medical records."}
                
                For ANY queries not related to nutrition or diet (including other medical topics), you must ONLY respond with:
                "I apologize, but I'm specifically designed to assist with nutrition and diet-related questions only. For other medical concerns, please consult with a qualified healthcare professional. I'd be happy to help you with any questions about diet planning, nutrition, or healthy eating habits."

                DO NOT provide any information about medical conditions, diseases, or health issues beyond their dietary aspects.

                User Query: ${inputText}
                
                ${needsMedicalRecords ? `Remember: Your recommendations should be tailored to the user's specific health profile indicated in their medical records.
                If they have high blood pressure, recommend a low-sodium diet.
                If they have high blood sugar, recommend a low-glycemic index diet.
                Always prioritize their safety and health.` : ""}

                RESPONSE FORMAT INSTRUCTIONS:
                Always structure your responses using this exact format:

                1. [MAIN HEADING]
                   • Brief overview point
                   • Key context point

                2. [MAIN HEADING]
                   2.1 [Subheading]
                       • Detailed point
                       • Specific recommendation
                   
                   2.2 [Subheading]
                       • Action item
                       • Implementation step

                3. [MAIN HEADING]
                   3.1 [Subheading]
                       • Important note
                       • Key consideration`
              }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          model: 'gemini-1.5-flash',
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from API');
      }

      const botResponse = data.candidates[0].content.parts[0].text;

      // Remove typing indicator and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, { text: botResponse, isBot: true }];
      });
    } catch (error) {
      console.error('Error details:', error);
      // Remove typing indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, { 
          text: "I apologize for the technical difficulty. Let me try to help you with your nutrition query. Please rephrase your question or try again.", 
          isBot: true 
        }];
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessage = (text) => {
    const paragraphs = text.split('\n\n');
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          // Main numbered sections (e.g., "1. NUTRITIONAL STRATEGY")
          if (/^\d+\.\s+[A-Z\s]+/.test(paragraph)) {
            const [number, ...titleParts] = paragraph.split(/\.\s+/);
            const title = titleParts.join('. ');
            return (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border-l-4 border-blue-500">
                <h2 className="font-bold text-blue-800 text-base flex items-center">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                    {number}
                  </span>
                  {title}
                </h2>
              </div>
            );
          }
          
          // Subsections (e.g., "2.1 Core Food Groups")
          if (/^\d+\.\d+\s+[A-Z][a-z\s]+/.test(paragraph)) {
            const [number, ...titleParts] = paragraph.split(/\s+/);
            const title = titleParts.join(' ');
            return (
              <div key={index} className="mt-3 ml-4">
                <h3 className="font-medium text-gray-700 text-sm flex items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-blue-600 font-semibold mr-2">{number}</span>
                  {title}
                </h3>
              </div>
            );
          }
          
          // Bullet points
          if (paragraph.includes('•')) {
            const items = paragraph.split('•').filter(item => item.trim());
            return (
              <div key={index} className="bg-white rounded-lg p-3 ml-8">
                <ul className="space-y-2.5">
                  {items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3"></span>
                      <span className="text-sm text-gray-600 leading-relaxed">{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          
          // Regular paragraph
          return (
            <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  // If user is not logged in, show login prompt instead of chat interface
  if (!isLoggedIn) {
    return (
      <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 z-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AI Diet Assistant</h2>
              <p className="text-blue-100 text-sm">Login Required</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
            aria-label="Close chatbot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">To access our AI Diet Assistant and get personalized nutrition advice, please log in to your account.</p>
          
          <div className="w-full space-y-3">
            <button 
              onClick={handleRedirectToLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707l-3.414-3.414A1 1 0 0011.586 3H3zm5 4a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Log In to Continue
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-md hover:bg-gray-200 transition-all duration-200"
            >
              Close
            </button>
          </div>
          
          <div className="mt-5 pt-5 border-t border-gray-100 w-full">
            <p className="text-xs text-gray-500">
              Unlock personalized diet plans, nutrition advice, and health tracking features with a secure account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[550px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">AI Diet Assistant</h2>
            <p className="text-blue-100 text-sm">Online 24/7</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
          aria-label="Close chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
          >
            {message.isTyping ? (
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            ) : (
              <div 
                className={`max-w-[85%] ${
                  message.isBot 
                    ? 'bg-white text-gray-800 shadow-sm border border-gray-100' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                } rounded-2xl p-4`}
              >
                {message.isBot ? formatMessage(message.text) : (
                  <p className="text-sm leading-relaxed">{message.text}</p>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              inputText.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot; 