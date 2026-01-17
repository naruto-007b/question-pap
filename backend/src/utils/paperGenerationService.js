const {
  getQuestionsByCourseMarksAndCO,
  getCOByNumberAndCourse,
  getAllCOsByCourse
} = require('../db/questionQueries');
const {
  createPaper,
  getUsedQuestionsByCourse,
  addQuestionsToPaperBatch
} = require('../db/paperQueries');
const { InsufficientQuestionsError } = require('./errors');

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function filterQuestions(questions, usedQuestionIds) {
  if (usedQuestionIds.size === 0) {
    return questions;
  }
  return questions.filter(q => !usedQuestionIds.has(q.id));
}

async function generatePartA(courseId, blueprint, usedQuestionIds) {
  const partA = blueprint.structure.part_a;
  const coDistribution = partA.co_distribution;
  const questions = [];

  for (let i = 0; i < coDistribution.length; i++) {
    const coNumber = coDistribution[i];
    const position = i + 1;

    const availableQuestions = await getQuestionsByCourseMarksAndCO(
      courseId,
      partA.marks,
      coNumber
    );

    const filteredQuestions = filterQuestions(availableQuestions, usedQuestionIds);

    if (filteredQuestions.length === 0) {
      throw new InsufficientQuestionsError(
        `Insufficient questions for CO${coNumber} with ${partA.marks} marks`
      );
    }

    const selectedQuestion = getRandomItem(filteredQuestions);
    usedQuestionIds.add(selectedQuestion.id);

    const co = await getCOByNumberAndCourse(courseId, coNumber);

    questions.push({
      question_id: selectedQuestion.id,
      question_text: selectedQuestion.text,
      co_id: co ? co.id : null,
      co_number: coNumber,
      marks: partA.marks,
      position: position,
      option_label: null
    });
  }

  return questions;
}

async function generatePartB(courseId, blueprint, usedQuestionIds) {
  const partBGroups = blueprint.structure.part_b;
  const questions = [];

  for (let i = 0; i < partBGroups.length; i++) {
    const group = partBGroups[i];
    const questionNumber = group.group;
    const coNumber = group.co;

    const availableQuestions = await getQuestionsByCourseMarksAndCO(
      courseId,
      group.marks,
      coNumber
    );

    const filteredQuestions = filterQuestions(availableQuestions, usedQuestionIds);

    if (filteredQuestions.length < group.num_options) {
      throw new InsufficientQuestionsError(
        `Insufficient questions for Q${questionNumber} (CO${coNumber}, ${group.marks} marks). Need ${group.num_options} questions, only ${filteredQuestions.length} available.`
      );
    }

    const selectedQuestions = getRandomItems(filteredQuestions, group.num_options);

    for (let j = 0; j < selectedQuestions.length; j++) {
      const q = selectedQuestions[j];
      const optionLabel = String.fromCharCode(97 + j);

      usedQuestionIds.add(q.id);

      const co = await getCOByNumberAndCourse(courseId, coNumber);

      const questionEntry = {
        question_id: q.id,
        question_text: q.text,
        co_id: co ? co.id : null,
        co_number: coNumber,
        marks: group.marks,
        position: questionNumber,
        option_label: optionLabel
      };

      questions.push(questionEntry);
    }
  }

  const result = [];
  for (let i = 0; i < partBGroups.length; i++) {
    const group = partBGroups[i];
    const groupQuestions = questions.filter(q => q.position === group.group);

    const options = groupQuestions.map(q => ({
      option: q.option_label,
      question_id: q.question_id,
      question_text: q.question_text,
      marks: q.marks,
      co_id: q.co_id,
      co_number: q.co_number
    }));

    result.push({
      question_number: group.group,
      options: options
    });
  }

  return { questions, grouped: result };
}

async function generatePaper(courseId, blueprintId, blueprint, examType) {
  try {
    const usedQuestionIds = new Set(await getUsedQuestionsByCourse(courseId));

    const partAQuestions = await generatePartA(courseId, blueprint, usedQuestionIds);

    const partBResult = await generatePartB(courseId, blueprint, usedQuestionIds);
    const partBQuestions = partBResult.questions;

    const allQuestions = [...partAQuestions, ...partBQuestions];

    const paper = await createPaper(courseId, blueprintId, examType);

    await addQuestionsToPaperBatch(paper.id, allQuestions);

    return {
      paper_id: paper.id,
      part_a: partAQuestions.map(q => ({
        question_id: q.question_id,
        question_text: q.question_text,
        co_id: q.co_id,
        co_number: q.co_number,
        marks: q.marks,
        position: q.position
      })),
      part_b: partBResult.grouped,
      used_question_ids: Array.from(usedQuestionIds)
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generatePaper
};
