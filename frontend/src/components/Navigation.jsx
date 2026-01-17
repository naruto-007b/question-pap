import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-xl font-serif font-bold hover:text-blue-200 transition-colors"
            >
              AutoExam Pro
            </button>
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => navigate('/course/new')}
                className="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                + Create Course
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm">{user.email}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
