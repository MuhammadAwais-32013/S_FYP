import Link from 'next/link';

const BackToDashboard = () => {
  return (
    <div className="mb-6">
      <Link 
        href="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-5 h-5 mr-1"
        >
          <path 
            fillRule="evenodd" 
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" 
            clipRule="evenodd" 
          />
        </svg>
        Back to Dashboard
      </Link>
    </div>
  );
};

export default BackToDashboard; 