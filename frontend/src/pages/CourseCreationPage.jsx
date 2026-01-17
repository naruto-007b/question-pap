import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useCourse } from '../context/CourseContext';

const CourseCreationPage = () => {
  const navigate = useNavigate();
  const { createCourse, loading } = useCourse();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [units, setUnits] = useState([
    { unit_number: 1, content: '' },
    { unit_number: 2, content: '' },
    { unit_number: 3, content: '' },
    { unit_number: 4, content: '' },
  ]);
  const [cos, setCOs] = useState([
    { co_number: 1, description: '' },
    { co_number: 2, description: '' },
    { co_number: 3, description: '' },
    { co_number: 4, description: '' },
    { co_number: 5, description: '' },
    { co_number: 6, description: '' },
  ]);

  const [touched, setTouched] = useState({
    code: false,
    name: false,
    units: {},
    cos: {},
  });

  const [errorModal, setErrorModal] = useState(null);

  const validate = useMemo(() => {
    const errors = {
      code: null,
      name: null,
      units: {},
      cos: {},
    };

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      errors.code = 'Course code is required';
    } else if (!/^[A-Za-z0-9]+$/.test(trimmedCode)) {
      errors.code = 'Course code must be alphanumeric';
    } else if (trimmedCode.length < 2 || trimmedCode.length > 10) {
      errors.code = 'Course code must be 2-10 characters';
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = 'Course name is required';
    } else if (trimmedName.length < 3 || trimmedName.length > 100) {
      errors.name = 'Course name must be 3-100 characters';
    }

    units.forEach((unit) => {
      const content = unit.content.trim();
      if (!content) {
        errors.units[unit.unit_number] = 'Unit content is required';
      } else if (content.length < 10) {
        errors.units[unit.unit_number] = 'Minimum 10 characters required';
      }
    });

    cos.forEach((co) => {
      const description = co.description.trim();
      if (!description) {
        errors.cos[co.co_number] = 'CO description is required';
      } else if (description.length < 10) {
        errors.cos[co.co_number] = 'Minimum 10 characters required';
      }
    });

    const isValid =
      !errors.code &&
      !errors.name &&
      Object.keys(errors.units).length === 0 &&
      Object.keys(errors.cos).length === 0;

    return { errors, isValid };
  }, [code, name, units, cos]);

  const setUnitContent = (unitNumber, value) => {
    setUnits((prev) =>
      prev.map((u) => (u.unit_number === unitNumber ? { ...u, content: value } : u))
    );
  };

  const setCODescription = (coNumber, value) => {
    setCOs((prev) =>
      prev.map((c) => (c.co_number === coNumber ? { ...c, description: value } : c))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      code: true,
      name: true,
      units: { 1: true, 2: true, 3: true, 4: true },
      cos: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
    });

    if (!validate.isValid) return;

    try {
      await createCourse({
        code: code.trim(),
        name: name.trim(),
        units: units.map((u) => ({ ...u, content: u.content.trim() })),
        cos: cos.map((c) => ({ ...c, description: c.description.trim() })),
      });

      navigate('/dashboard', { state: { successMessage: 'Course created successfully' } });
    } catch (error) {
      const apiMessage = error.response?.data?.error?.message || 'Failed to create course';
      setErrorModal(apiMessage);
    }
  };

  const showFieldError = (fieldKey) => {
    return touched[fieldKey] && validate.errors[fieldKey];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Create New Course</h1>
            <p className="text-gray-600 mb-8">Set up course units and outcomes for AutoExam Pro.</p>

            <form onSubmit={handleSubmit}>
              <div className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-6">Course Basic Info</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
                      maxLength={10}
                      placeholder="e.g., CS101"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-900 focus:border-blue-900 ${
                        showFieldError('code') ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {showFieldError('code') && (
                      <p className="text-red-600 text-sm mt-1">{validate.errors.code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      maxLength={100}
                      placeholder="Enter course name"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-900 focus:border-blue-900 ${
                        showFieldError('name') ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {showFieldError('name') && (
                      <p className="text-red-600 text-sm mt-1">{validate.errors.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-6">Units (Syllabus)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {units.map((unit) => {
                    const unitError = validate.errors.units[unit.unit_number];
                    const isTouched = touched.units[unit.unit_number];

                    return (
                      <div key={unit.unit_number} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-blue-900">Unit {unit.unit_number}</span>
                        </div>
                        <textarea
                          value={unit.content}
                          onChange={(e) => setUnitContent(unit.unit_number, e.target.value)}
                          onBlur={() =>
                            setTouched((prev) => ({
                              ...prev,
                              units: { ...prev.units, [unit.unit_number]: true },
                            }))
                          }
                          rows={4}
                          placeholder="Enter topics for this unit..."
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-900 focus:border-blue-900 resize-none ${
                            isTouched && unitError ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {isTouched && unitError && (
                          <p className="text-red-600 text-sm mt-1">{unitError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-6">Course Outcomes (COs)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cos.map((co) => {
                    const coError = validate.errors.cos[co.co_number];
                    const isTouched = touched.cos[co.co_number];

                    return (
                      <div key={co.co_number} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-blue-900">CO{co.co_number}</span>
                        </div>
                        <textarea
                          value={co.description}
                          onChange={(e) => setCODescription(co.co_number, e.target.value)}
                          onBlur={() =>
                            setTouched((prev) => ({
                              ...prev,
                              cos: { ...prev.cos, [co.co_number]: true },
                            }))
                          }
                          rows={3}
                          placeholder="Enter CO description..."
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-900 focus:border-blue-900 resize-none ${
                            isTouched && coError ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {isTouched && coError && (
                          <p className="text-red-600 text-sm mt-1">{coError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!validate.isValid || loading}
                  className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center ${
                    !validate.isValid || loading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-900 hover:bg-blue-800 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">Error</h3>
            <p className="text-gray-700 mb-6">{errorModal}</p>
            <button
              onClick={() => setErrorModal(null)}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCreationPage;
