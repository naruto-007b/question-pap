const pool = require('../config/database');

const createCourse = async (professorId, code, name) => {
  const query = `
    INSERT INTO courses (professor_id, code, name)
    VALUES ($1, $2, $3)
    RETURNING id, professor_id, code, name, created_at, updated_at
  `;
  const values = [professorId, code, name];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getCourseById = async (courseId) => {
  const query = `
    SELECT id, professor_id, code, name, created_at, updated_at
    FROM courses
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows[0] || null;
};

const getCoursesByProfessor = async (professorId) => {
  const query = `
    SELECT id, code, name, created_at, updated_at
    FROM courses
    WHERE professor_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [professorId]);
  return rows;
};

const updateCourse = async (courseId, code, name) => {
  const query = `
    UPDATE courses
    SET code = $1, name = $2
    WHERE id = $3
    RETURNING id, professor_id, code, name, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [code, name, courseId]);
  return rows[0];
};

const deleteCourse = async (courseId) => {
  const query = `DELETE FROM courses WHERE id = $1`;
  await pool.query(query, [courseId]);
};

const createUnit = async (courseId, unitNumber, content) => {
  const query = `
    INSERT INTO units (course_id, unit_number, content)
    VALUES ($1, $2, $3)
    RETURNING id, course_id, unit_number, content, created_at
  `;
  const values = [courseId, unitNumber, content];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const createCO = async (courseId, coNumber, description) => {
  const query = `
    INSERT INTO cos (course_id, co_number, description)
    VALUES ($1, $2, $3)
    RETURNING id, course_id, co_number, description, created_at
  `;
  const values = [courseId, coNumber, description];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getUnitsByCourse = async (courseId) => {
  const query = `
    SELECT id, course_id, unit_number, content, created_at
    FROM units
    WHERE course_id = $1
    ORDER BY unit_number ASC
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows;
};

const getCOsByCourse = async (courseId) => {
  const query = `
    SELECT id, course_id, co_number, description, created_at
    FROM cos
    WHERE course_id = $1
    ORDER BY co_number ASC
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows;
};

module.exports = {
  createCourse,
  getCourseById,
  getCoursesByProfessor,
  updateCourse,
  deleteCourse,
  createUnit,
  createCO,
  getUnitsByCourse,
  getCOsByCourse
};
