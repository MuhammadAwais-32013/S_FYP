import { useState, useRef, useEffect } from 'react';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { text: 'Hello! I am your AI Diet Assistant. How can I help you today?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const canned_responses = [
    { 
      keywords: ['hello', 'hi', 'hey', 'greetings'], 
      response: 'Hello! How can I help with your diet plan today? You can ask me about BMI, diet recommendations, or health tracking.' 
    },
    { 
      keywords: ['bmi', 'calculator', 'calculate', 'body mass', 'index'], 
      response: 'BMI (Body Mass Index) helps determine if you\'re at a healthy weight. You can calculate your BMI on the BMI page. It\'s calculated using your height and weight and helps determine the appropriate diet plan for you.' 
    },
    { 
      keywords: ['diet', 'plan', 'food', 'eat', 'meal', 'nutrition'], 
      response: 'A balanced diet should include proteins, carbs, and healthy fats. Your personalized diet plan is generated based on your BMI category and nutritional needs. Check your diet plan page for detailed recommendations!' 
    },
    { 
      keywords: ['medical', 'record', 'health', 'track', 'monitor'], 
      response: 'Keeping track of your medical records is important for your health. You can add data like blood pressure and blood sugar levels in the Records section. This helps monitor your progress over time.' 
    },
    {
      keywords: ['weight', 'loss', 'lose', 'reduce'],
      response: 'Weight loss is best achieved through a combination of healthy eating and regular exercise. Focus on portion control, eating more vegetables, and staying active. Your personalized diet plan can help guide you!'
    },
    {
      keywords: ['exercise', 'workout', 'fitness', 'activity'],
      response: 'Regular physical activity is important for overall health. Aim for at least 150 minutes of moderate exercise per week, combined with your personalized diet for best results.'
    },
    {
      keywords: ['water', 'hydration', 'drink'],
      response: 'Staying hydrated is essential! Try to drink 8-10 glasses of water daily. Proper hydration helps with digestion, nutrient absorption, and can even help control appetite.'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when chatbot opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { text: inputText, isBot: false }];
    setMessages(updatedMessages);
    setInputText('');

    // Show typing indicator
    setMessages(prev => [...prev, { isBot: true, isTyping: true }]);

    // Find a canned response with delay to simulate thinking
    setTimeout(() => {
      const userMessage = inputText.toLowerCase();
      let botResponse = "I'm not sure how to help with that. Try asking about BMI, diet plans, nutrition, exercise, or medical records.";
      
      for (const item of canned_responses) {
        if (item.keywords.some(keyword => userMessage.includes(keyword))) {
          botResponse = item.response;
          break;
        }
      }

      // Remove typing indicator and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, { text: botResponse, isBot: true }];
      });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="font-semibold text-lg">Diet Assistant</h2>
        </div>
        <button 
          onClick={onClose} 
          className="text-white hover:bg-blue-700 p-1 rounded-full transition-colors"
          aria-label="Close chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
          >
            {message.isTyping ? (
              <div className="inline-block p-3 rounded-lg max-w-[80%] bg-white text-gray-800 shadow-md border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            ) : (
              <div 
                className={message.isBot ? 'message-bubble-bot' : 'message-bubble-user'}
              >
                {message.text}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="chatbot-input">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about diet, nutrition, health tips..."
          className="form-input flex-1 rounded-full focus:ring-blue-400"
        />
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className={`btn rounded-full px-4 ${!inputText.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chatbot; 