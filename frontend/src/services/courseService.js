import { get, post, put, del } from './apiClient';

export const getAllCourses = async () => {
  const response = await get('/api/courses');
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await get(`/api/courses/${id}`);
  return response.data;
};

export const createCourse = async (data) => {
  const response = await post('/api/courses', data);
  return response.data;
};

export const updateCourse = async (id, data) => {
  const response = await put(`/api/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await del(`/api/courses/${id}`);
  return response.data;
};
