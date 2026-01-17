const {
  createPaper,
  getPaperById,
  getPapersByCourse,
  deletePaper,
  getQuestionsByPaper
} = require('../db/paperQueries');
const { getCourseById } = require('../db/courseQueries');
const { getBlueprintById, getDefaultBlueprint } = require('../db/blueprintQueries');
const { generatePaper } = require('../utils/paperGenerationService');
const {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  InsufficientQuestionsError
} = require('../utils/errors');

const generatePaperHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { blueprint_id, exam_type } = req.body;
    const professorId = req.user.id;

    if (!exam_type) {
      throw new ValidationError('exam_type is required');
    }

    if (!['mid_term', 'final'].includes(exam_type)) {
      throw new ValidationError('exam_type must be either "mid_term" or "final"');
    }

    const course = await getCourseById(courseId);

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.professor_id !== professorId) {
      throw new AuthorizationError('You do not have permission to generate papers for this course');
    }

    let blueprint;
    if (blueprint_id) {
      blueprint = await getBlueprintById(blueprint_id);
      if (!blueprint) {
        throw new NotFoundError('Blueprint not found');
      }
    } else {
      blueprint = await getDefaultBlueprint();
      if (!blueprint) {
        throw new ValidationError('No default blueprint found and no blueprint_id provided');
      }
    }

    const paperData = await generatePaper(courseId, blueprint.id, blueprint, exam_type);

    const paper = await getPaperById(paperData.paper_id);

    res.status(201).json({
      id: paper.id,
      course_id: paper.course_id,
      blueprint_id: paper.blueprint_id,
      blueprint_name: paper.blueprint_name,
      exam_type: paper.exam_type,
      paper_structure: {
        part_a: paperData.part_a,
        part_b: paperData.part_b
      },
      generated_at: paper.generated_at
    });
  } catch (error) {
    next(error);
  }
};

const getPapersByCourseHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const professorId = req.user.id;

    const course = await getCourseById(courseId);

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.professor_id !== professorId) {
      throw new AuthorizationError('You do not have permission to view papers for this course');
    }

    const papers = await getPapersByCourse(courseId);

    res.json(papers);
  } catch (error) {
    next(error);
  }
};

const getPaperByIdHandler = async (req, res, next) => {
  try {
    const { courseId, paperId } = req.params;
    const professorId = req.user.id;

    const course = await getCourseById(courseId);

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.professor_id !== professorId) {
      throw new AuthorizationError('You do not have permission to view this paper');
    }

    const paper = await getPaperById(paperId);

    if (!paper) {
      throw new NotFoundError('Paper not found');
    }

    if (paper.course_id !== courseId) {
      throw new NotFoundError('Paper not found for this course');
    }

    const questions = await getQuestionsByPaper(paperId);

    const partA = questions
      .filter(q => q.position >= 1 && q.position <= 5)
      .sort((a, b) => a.position - b.position)
      .map(q => ({
        question_id: q.id,
        question_text: q.text,
        co_id: q.co_number,
        marks: q.marks,
        position: q.position
      }));

    const partB = [];
    for (let i = 6; i <= 9; i++) {
      const groupQuestions = questions.filter(q => q.position === i).sort((a, b) => {
        if (!a.option_label) return -1;
        if (!b.option_label) return 1;
        return a.option_label.localeCompare(b.option_label);
      });

      if (groupQuestions.length > 0) {
        const options = groupQuestions.map(q => ({
          option: q.option_label,
          question_id: q.id,
          question_text: q.text,
          marks: q.marks,
          co_id: q.co_number
        }));

        partB.push({
          question_number: i,
          options: options
        });
      }
    }

    res.json({
      id: paper.id,
      course_id: paper.course_id,
      blueprint_id: paper.blueprint_id,
      blueprint_name: paper.blueprint_name,
      exam_type: paper.exam_type,
      course_code: paper.course_code,
      course_name: paper.course_name,
      part_a: partA,
      part_b: partB,
      generated_at: paper.generated_at
    });
  } catch (error) {
    next(error);
  }
};

const deletePaperHandler = async (req, res, next) => {
  try {
    const { courseId, paperId } = req.params;
    const professorId = req.user.id;

    const course = await getCourseById(courseId);

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.professor_id !== professorId) {
      throw new AuthorizationError('You do not have permission to delete this paper');
    }

    const paper = await getPaperById(paperId);

    if (!paper) {
      throw new NotFoundError('Paper not found');
    }

    if (paper.course_id !== courseId) {
      throw new NotFoundError('Paper not found for this course');
    }

    await deletePaper(paperId);

    res.json({ message: 'Paper deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePaperHandler,
  getPapersByCourseHandler,
  getPaperByIdHandler,
  deletePaperHandler
};
