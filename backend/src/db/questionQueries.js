const pool = require('../config/database');

const getQuestionsByCourse = async (courseId) => {
  const query = `
    SELECT q.id, q.text, q.type, q.marks, q.difficulty, q.unit_id,
           u.unit_number, u.content as unit_content,
           q.course_id, q.created_at, q.updated_at
    FROM questions q
    JOIN units u ON q.unit_id = u.id
    WHERE q.course_id = $1
    ORDER BY q.marks, q.created_at
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows;
};

const getQuestionsByCourseAndMarks = async (courseId, marks) => {
  const query = `
    SELECT q.id, q.text, q.type, q.marks, q.difficulty, q.unit_id,
           u.unit_number, u.content as unit_content,
           q.course_id, q.created_at, q.updated_at
    FROM questions q
    JOIN units u ON q.unit_id = u.id
    WHERE q.course_id = $1 AND q.marks = $2
    ORDER BY q.created_at
  `;
  const { rows } = await pool.query(query, [courseId, marks]);
  return rows;
};

const getQuestionsByCourseMarksAndCO = async (courseId, marks, coNumber) => {
  const query = `
    SELECT q.id, q.text, q.type, q.marks, q.difficulty, q.unit_id,
           u.unit_number, u.content as unit_content,
           q.course_id, q.created_at, q.updated_at,
           c.id as co_id, c.co_number, c.description as co_description
    FROM questions q
    JOIN units u ON q.unit_id = u.id
    JOIN question_co_mapping qcm ON q.id = qcm.question_id
    JOIN cos c ON qcm.co_id = c.id
    WHERE q.course_id = $1 AND q.marks = $2 AND c.co_number = $3
    ORDER BY q.created_at
  `;
  const { rows } = await pool.query(query, [courseId, marks, coNumber]);
  return rows;
};

const getQuestionsByCourseAndCO = async (courseId, coNumber) => {
  const query = `
    SELECT q.id, q.text, q.type, q.marks, q.difficulty, q.unit_id,
           u.unit_number, u.content as unit_content,
           q.course_id, q.created_at, q.updated_at,
           c.id as co_id, c.co_number, c.description as co_description
    FROM questions q
    JOIN units u ON q.unit_id = u.id
    JOIN question_co_mapping qcm ON q.id = qcm.question_id
    JOIN cos c ON qcm.co_id = c.id
    WHERE q.course_id = $1 AND c.co_number = $2
    ORDER BY q.marks, q.created_at
  `;
  const { rows } = await pool.query(query, [courseId, coNumber]);
  return rows;
};

const getQuestionsExcludingIds = async (courseId, marks, coNumber, excludeQuestionIds) => {
  if (excludeQuestionIds.length === 0) {
    return await getQuestionsByCourseMarksAndCO(courseId, marks, coNumber);
  }

  const query = `
    SELECT q.id, q.text, q.type, q.marks, q.difficulty, q.unit_id,
           u.unit_number, u.content as unit_content,
           q.course_id, q.created_at, q.updated_at,
           c.id as co_id, c.co_number, c.description as co_description
    FROM questions q
    JOIN units u ON q.unit_id = u.id
    JOIN question_co_mapping qcm ON q.id = qcm.question_id
    JOIN cos c ON qcm.co_id = c.id
    WHERE q.course_id = $1 AND q.marks = $2 AND c.co_number = $3
      AND q.id NOT IN ($4)
    ORDER BY q.created_at
  `;
  const { rows } = await pool.query(query, [courseId, marks, coNumber, excludeQuestionIds]);
  return rows;
};

const getQuestionById = async (questionId) => {
  const query = `
    SELECT q.id, q.text, q.type, q.marks, q.difficulty, q.unit_id,
           u.unit_number, u.content as unit_content,
           q.course_id, q.created_at, q.updated_at
    FROM questions q
    JOIN units u ON q.unit_id = u.id
    WHERE q.id = $1
  `;
  const { rows } = await pool.query(query, [questionId]);
  return rows[0] || null;
};

const getCOByNumberAndCourse = async (courseId, coNumber) => {
  const query = `
    SELECT id, course_id, co_number, description, created_at
    FROM cos
    WHERE course_id = $1 AND co_number = $2
  `;
  const { rows } = await pool.query(query, [courseId, coNumber]);
  return rows[0] || null;
};

const getAllCOsByCourse = async (courseId) => {
  const query = `
    SELECT id, course_id, co_number, description, created_at
    FROM cos
    WHERE course_id = $1
    ORDER BY co_number
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows;
};

module.exports = {
  getQuestionsByCourse,
  getQuestionsByCourseAndMarks,
  getQuestionsByCourseMarksAndCO,
  getQuestionsByCourseAndCO,
  getQuestionsExcludingIds,
  getQuestionById,
  getCOByNumberAndCourse,
  getAllCOsByCourse
};
