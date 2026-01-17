const {
  getQuestionsByCourseMarksAndCO,
  getAllCOsByCourse
} = require('../db/questionQueries');
const { getBlueprintById } = require('../db/blueprintQueries');

const validatePaperGeneration = async (courseId, blueprintId) => {
  const errors = [];

  const blueprint = await getBlueprintById(blueprintId);
  if (!blueprint) {
    errors.push('Blueprint not found');
    return { valid: false, errors };
  }

  const structure = blueprint.structure;

  const partA = structure.part_a;
  const coDistribution = partA.co_distribution;

  for (let i = 0; i < coDistribution.length; i++) {
    const coNumber = coDistribution[i];
    const questions = await getQuestionsByCourseMarksAndCO(
      courseId,
      partA.marks,
      coNumber
    );

    if (questions.length === 0) {
      errors.push(
        `Insufficient questions for CO${coNumber} with ${partA.marks} marks (0 questions available)`
      );
    }
  }

  const partB = structure.part_b;
  for (let i = 0; i < partB.length; i++) {
    const group = partB[i];
    const questions = await getQuestionsByCourseMarksAndCO(
      courseId,
      group.marks,
      group.co
    );

    if (questions.length < group.num_options) {
      errors.push(
        `Insufficient questions for Q${group.group} (CO${group.co}, ${group.marks} marks): ` +
        `Need ${group.num_options} questions, only ${questions.length} available`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePaperGeneration
};
