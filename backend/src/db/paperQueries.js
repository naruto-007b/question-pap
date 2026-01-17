const pool = require('../config/database');

const createPaper = async (courseId, blueprintId, examType) => {
  const query = `
    INSERT INTO generated_papers (course_id, blueprint_id, exam_type)
    VALUES ($1, $2, $3)
    RETURNING id, course_id, blueprint_id, exam_type, generated_at
  `;
  const values = [courseId, blueprintId, examType];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getPaperById = async (paperId) => {
  const query = `
    SELECT gp.id, gp.course_id, gp.blueprint_id, gp.exam_type,
           gp.pdf_url, gp.generated_at,
           b.name as blueprint_name, b.structure as blueprint_structure,
           c.code as course_code, c.name as course_name
    FROM generated_papers gp
    JOIN blueprints b ON gp.blueprint_id = b.id
    JOIN courses c ON gp.course_id = c.id
    WHERE gp.id = $1
  `;
  const { rows } = await pool.query(query, [paperId]);
  return rows[0] || null;
};

const getPapersByCourse = async (courseId) => {
  const query = `
    SELECT gp.id, gp.course_id, gp.blueprint_id, gp.exam_type,
           gp.generated_at, gp.pdf_url,
           b.name as blueprint_name,
           COUNT(pq.id) as question_count
    FROM generated_papers gp
    JOIN blueprints b ON gp.blueprint_id = b.id
    LEFT JOIN paper_questions pq ON gp.id = pq.paper_id
    WHERE gp.course_id = $1
    GROUP BY gp.id, gp.course_id, gp.blueprint_id, gp.exam_type,
             gp.generated_at, gp.pdf_url, b.name
    ORDER BY gp.generated_at DESC
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows;
};

const deletePaper = async (paperId) => {
  const query = `DELETE FROM generated_papers WHERE id = $1`;
  await pool.query(query, [paperId]);
};

const addQuestionToPaper = async (paperId, questionId, position) => {
  const query = `
    INSERT INTO paper_questions (paper_id, question_id, position)
    VALUES ($1, $2, $3)
    RETURNING id, paper_id, question_id, position
  `;
  const values = [paperId, questionId, position];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getQuestionsByPaper = async (paperId) => {
  const query = `
    SELECT q.id, q.text, q.type, q.marks, q.difficulty, q.unit_id,
           u.unit_number, u.content as unit_content,
           c.co_number, c.description as co_description,
           pq.position, pq.option_label
    FROM paper_questions pq
    JOIN questions q ON pq.question_id = q.id
    JOIN units u ON q.unit_id = u.id
    LEFT JOIN question_co_mapping qcm ON q.id = qcm.question_id
    LEFT JOIN cos c ON qcm.co_id = c.id
    WHERE pq.paper_id = $1
    ORDER BY pq.position, pq.option_label
  `;
  const { rows } = await pool.query(query, [paperId]);
  return rows;
};

const getUsedQuestionsByCourse = async (courseId) => {
  const query = `
    SELECT DISTINCT pq.question_id
    FROM paper_questions pq
    JOIN generated_papers gp ON pq.paper_id = gp.id
    WHERE gp.course_id = $1
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows.map(row => row.question_id);
};

const addQuestionsToPaperBatch = async (paperId, questions) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const q of questions) {
      const query = `
        INSERT INTO paper_questions (paper_id, question_id, position, option_label)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(query, [paperId, q.question_id, q.position, q.option_label || null]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createPaper,
  getPaperById,
  getPapersByCourse,
  deletePaper,
  addQuestionToPaper,
  getQuestionsByPaper,
  getUsedQuestionsByCourse,
  addQuestionsToPaperBatch
};
