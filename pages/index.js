import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  const { isLoggedIn, userName } = useAuth();

  return (
    <>
      <Head>
        <title>AI Diet Consultant</title>
        <meta name="description" content="AI-powered diet consultation and health tracking" />
      </Head>

      <div>
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Diet Consultant</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
              Your personal health assistant for diet recommendations and medical tracking
            </p>
          </div>
        </section>
        
        {isLoggedIn ? (
          <div className="max-w-5xl mx-auto">
            <div className="card mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl gradient-heading mb-4">Welcome, {userName}!</h2>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                  Use our tools to manage your diet and health records all in one place.
                  Track your progress and get personalized recommendations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/bmi" className="feature-card text-center block">
                  <div className="text-blue-600 mb-3 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">BMI Calculator</h3>
                  <p className="text-gray-600">Calculate your Body Mass Index and understand your weight category</p>
                </Link>
                
                <Link href="/diet-plan" className="feature-card text-center block">
                  <div className="text-blue-600 mb-3 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Diet Plan</h3>
                  <p className="text-gray-600">Get personalized diet recommendations based on your BMI and preferences</p>
                </Link>
                
                <Link href="/records" className="feature-card text-center block">
                  <div className="text-blue-600 mb-3 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Medical Records</h3>
                  <p className="text-gray-600">Track your health metrics over time to monitor your progress</p>
                </Link>
              </div>
            </div>

            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-3/4 mb-4 md:mb-0 md:pr-6">
                  <h3 className="text-xl font-semibold mb-2 text-blue-800">Ready to improve your health?</h3>
                  <p className="text-blue-700">
                    Start by calculating your BMI to get a personalized diet plan tailored to your needs.
                  </p>
                </div>
                <div className="md:w-1/4 flex justify-center">
                  <Link href="/bmi" className="btn">
                    Calculate BMI
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="card mb-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl gradient-heading mb-4">Your Personal Health Assistant</h2>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                  AI Diet Consultant helps you manage your diet and track your health metrics. 
                  Sign up to get personalized diet plans based on your BMI and health data.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="feature-card text-center">
                  <div className="text-blue-600 mb-3 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Personalized Diet Plans</h3>
                  <p className="text-gray-600">Get diet recommendations tailored to your specific body metrics and health goals</p>
                </div>
                
                <div className="feature-card text-center">
                  <div className="text-blue-600 mb-3 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
                  <p className="text-gray-600">Monitor your health metrics and see improvements over time</p>
                </div>
                
                <div className="feature-card text-center">
                  <div className="text-blue-600 mb-3 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Diet Assistant</h3>
                  <p className="text-gray-600">Chat with our AI assistant for tips and guidance on your diet and health</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
                  <Link href="/login" className="btn">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-secondary">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* Testimonials section */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <h3 className="text-2xl font-semibold mb-6 text-center text-blue-800">What Our Users Say</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <p className="italic text-gray-600 mb-3">"This app helped me understand my dietary needs and gave me a structured plan to follow. I've never felt better!"</p>
                  <p className="font-medium text-blue-700">- Sarah J.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <p className="italic text-gray-600 mb-3">"I love how easy it is to track my health metrics and see my progress over time. The diet plans are great too!"</p>
                  <p className="font-medium text-blue-700">- Michael T.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 