import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import axios from 'axios';

export default function DatabaseViewer() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState({
    users: [],
    bmi: [],
    dietPlans: [],
    medicalRecords: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Load all data
    fetchAllData();
  }, [isLoggedIn, router]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all data in parallel
      const [usersRes, bmiRes, dietPlansRes, medicalRecordsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`),
        axios.get(`${API_URL}/admin/bmi`),
        axios.get(`${API_URL}/admin/diet-plans`),
        axios.get(`${API_URL}/admin/medical-records`)
      ]);

      setData({
        users: usersRes.data.users || [],
        bmi: bmiRes.data.bmi_records || [],
        dietPlans: dietPlansRes.data.diet_plans || [],
        medicalRecords: medicalRecordsRes.data.records || []
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load database data. Please check that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <Head>
        <title>Database Viewer | AI Diet Consultant</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Viewer</h1>
          <p className="text-gray-600">
            Direct view of all database records in JSON format.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600 mb-6">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Users */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h2 className="text-lg font-medium text-gray-900">Users Table</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {data.users.length} records found
                </p>
              </div>
              <div className="border-t border-gray-200 p-4">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm text-gray-800 h-60">
                  {JSON.stringify(data.users, null, 2)}
                </pre>
              </div>
            </div>

            {/* BMI Records */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-green-50">
                <h2 className="text-lg font-medium text-gray-900">BMI Records Table</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {data.bmi.length} records found
                </p>
              </div>
              <div className="border-t border-gray-200 p-4">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm text-gray-800 h-60">
                  {JSON.stringify(data.bmi, null, 2)}
                </pre>
              </div>
            </div>

            {/* Diet Plans */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                <h2 className="text-lg font-medium text-gray-900">Diet Plans Table</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {data.dietPlans.length} records found
                </p>
              </div>
              <div className="border-t border-gray-200 p-4">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm text-gray-800 h-60">
                  {JSON.stringify(data.dietPlans, null, 2)}
                </pre>
              </div>
            </div>

            {/* Medical Records */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-yellow-50">
                <h2 className="text-lg font-medium text-gray-900">Medical Records Table</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {data.medicalRecords.length} records found
                </p>
              </div>
              <div className="border-t border-gray-200 p-4">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm text-gray-800 h-60">
                  {JSON.stringify(data.medicalRecords, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 