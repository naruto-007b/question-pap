import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useCourse } from '../context/CourseContext';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { selectedCourse, loading, error, fetchCourseById, deleteCourse } = useCourse();

  const [activeTab, setActiveTab] = useState('syllabus');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCourseById(courseId).catch(() => {});
  }, [courseId]);

  const course = selectedCourse;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const units = useMemo(() => course?.units || [], [course]);
  const cos = useMemo(() => course?.cos || [], [course]);

  const handleConfirmDelete = async () => {
    try {
      await deleteCourse(courseId);
      navigate('/dashboard', { state: { successMessage: 'Course deleted' } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading course...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {course && !loading && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                    {course.code} - {course.name}
                  </h1>
                  <p className="text-gray-600">Created {formatDate(course.created_at)}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    disabled
                    className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                  >
                    Edit Course (MVP)
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Delete Course
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-200 mb-6">
                <nav className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('syllabus')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'syllabus'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Syllabus
                  </button>
                  <button
                    onClick={() => setActiveTab('cos')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'cos'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Course Outcomes
                  </button>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'questions'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => setActiveTab('papers')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'papers'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Papers
                  </button>
                </nav>
              </div>

              {activeTab === 'syllabus' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif font-semibold text-gray-800">Units</h2>
                    <button
                      disabled
                      className="bg-gray-200 text-gray-500 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                      Edit (MVP)
                    </button>
                  </div>

                  {units.map((unit) => (
                    <div key={unit.id || unit.unit_number} className="bg-gray-50 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-blue-900">Unit {unit.unit_number}</h3>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{unit.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'cos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif font-semibold text-gray-800">Course Outcomes</h2>
                    <button
                      disabled
                      className="bg-gray-200 text-gray-500 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                      Edit (MVP)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cos.map((co) => (
                      <div key={co.id || co.co_number} className="bg-gray-50 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">CO{co.co_number}</h3>
                        <p className="text-gray-800 whitespace-pre-wrap">{co.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div>
                  <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">Question Pool</h2>
                  <p className="text-gray-600 mb-6">Manage your course question bank.</p>
                  <button
                    onClick={() => navigate(`/course/${courseId}/questions`)}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Manage Questions
                  </button>
                </div>
              )}

              {activeTab === 'papers' && (
                <div>
                  <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">Papers</h2>
                  <p className="text-gray-600 mb-6">Generate and view paper history.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate(`/course/${courseId}/generate`)}
                      className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      Generate Paper
                    </button>
                    <button
                      onClick={() => navigate('/papers')}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      Paper History
                    </button>
                  </div>
                </div>
              )}
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
              Are you sure you want to delete this course? This will permanently remove all associated units, COs, questions, and generated papers.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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

export default CourseDetailsPage;
