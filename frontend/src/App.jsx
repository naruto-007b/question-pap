import { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState('checking...');

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/health`);
        const data = await response.json();
        setApiStatus(data.message || 'Connected');
      } catch (error) {
        setApiStatus('Unable to connect to API');
      }
    };

    checkAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AutoExam Pro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Intelligent Question Paper Generation System
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Phase 1 Setup Complete ✅
            </h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-2xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Backend API</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Express.js server with PostgreSQL connection
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-2xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Database Schema</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All tables created with proper relationships
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-2xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Frontend</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    React + Vite + Tailwind CSS configured
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-6 border border-blue-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              API Status
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {apiStatus}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Users & Auth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professor and admin roles with JWT authentication
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Question Bank</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organized by courses, units, and COs
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Paper Generation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Blueprint-based automated exam generation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
