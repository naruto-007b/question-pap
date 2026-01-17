import { createContext, useContext, useReducer } from 'react';
import * as courseService from '../services/courseService';

const CourseContext = createContext();

const initialState = {
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

const courseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'FETCH_COURSES':
      return {
        ...state,
        courses: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_SELECTED_COURSE':
      return {
        ...state,
        selectedCourse: action.payload,
        loading: false,
        error: null,
      };
    case 'CREATE_COURSE':
      return {
        ...state,
        courses: [action.payload, ...state.courses],
        loading: false,
        error: null,
      };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload : course
        ),
        selectedCourse: state.selectedCourse?.id === action.payload.id
          ? action.payload
          : state.selectedCourse,
        loading: false,
        error: null,
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== action.payload),
        selectedCourse: state.selectedCourse?.id === action.payload
          ? null
          : state.selectedCourse,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const CourseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  const fetchCourses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const courses = await courseService.getAllCourses();
      dispatch({ type: 'FETCH_COURSES', payload: courses });
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch courses';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const fetchCourseById = async (courseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const course = await courseService.getCourseById(courseId);
      dispatch({ type: 'SET_SELECTED_COURSE', payload: course });
      return course;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const createCourse = async (courseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newCourse = await courseService.createCourse(courseData);
      dispatch({ type: 'CREATE_COURSE', payload: newCourse });
      return newCourse;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateCourse = async (courseId, data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCourse = await courseService.updateCourse(courseId, data);
      dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
      return updatedCourse;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await courseService.deleteCourse(courseId);
      dispatch({ type: 'DELETE_COURSE', payload: courseId });
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to delete course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    courses: state.courses,
    selectedCourse: state.selectedCourse,
    loading: state.loading,
    error: state.error,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    clearError,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
