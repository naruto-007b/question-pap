import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import Navigation from '../components/Navigation';

const Dashboard = () => {
  const { user } = useAuth();
  const { courses, loading, error, fetchCourses, deleteCourse } = useCourse();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteClick = (courseId) => {
    setDeleteConfirm(courseId);
  };

  const handleConfirmDelete = async (courseId) => {
    try {
      await deleteCourse(courseId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Welcome back, {user?.email}
            </h1>
            <p className="text-gray-600">
              Role: <span className="capitalize font-medium">{user?.role}</span>
            </p>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-serif font-semibold text-gray-800">
              My Courses
            </h2>
            <button
              onClick={() => navigate('/course/new')}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              + Create New Course
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first course to get started with AutoExam Pro
              </p>
              <button
                onClick={() => navigate('/course/new')}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Create Your First Course
              </button>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1">
                        {course.code}
                      </h3>
                      <p className="text-gray-700">{course.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Created {formatDate(course.created_at)}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="flex-1 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClick(course.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this course? This action cannot be undone and will also delete all associated units, course outcomes, questions, and generated papers.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
