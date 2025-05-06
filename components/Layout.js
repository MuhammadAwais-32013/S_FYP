import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
  const { isLoggedIn, userName, logout } = useAuth();
  const router = useRouter();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            AI Diet Consultant
          </Link>
          
          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/bmi" className="text-gray-600 hover:text-blue-600">
                  BMI Calculator
                </Link>
                <Link href="/diet-plan" className="text-gray-600 hover:text-blue-600">
                  Diet Plan
                </Link>
                <Link href="/records" className="text-gray-600 hover:text-blue-600">
                  Medical Records
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Logout
                </button>
                <span className="ml-4 text-sm font-medium text-gray-700">
                  Welcome, {userName}
                </span>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/signup" className="text-gray-600 hover:text-blue-600">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="container py-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-gray-100 border-t">
        <div className="container py-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} AI Diet Consultant. All rights reserved.
        </div>
      </footer>
      
      {/* Chatbot */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
};

export default Layout; 