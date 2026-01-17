const {
  createCourse,
  getCourseById,
  getCoursesByProfessor,
  updateCourse,
  deleteCourse,
  createUnit,
  createCO,
  getUnitsByCourse,
  getCOsByCourse
} = require('../db/courseQueries');

const { validateCourseCreation } = require('../utils/courseValidation');
const { 
  ValidationError, 
  NotFoundError, 
  AuthorizationError 
} = require('../utils/errors');

const createCourseHandler = async (req, res, next) => {
  try {
    const { code, name, units, cos } = req.body;
    const professorId = req.user.id;
    
    const validationErrors = validateCourseCreation({ code, name, units, cos });
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }
    
    const course = await createCourse(professorId, code.trim(), name.trim());
    
    const createdUnits = [];
    for (const unit of units) {
      const createdUnit = await createUnit(course.id, unit.unit_number, unit.content.trim());
      createdUnits.push(createdUnit);
    }
    
    const createdCOs = [];
    for (const co of cos) {
      const createdCO = await createCO(course.id, co.co_number, co.description.trim());
      createdCOs.push(createdCO);
    }
    
    res.status(201).json({
      id: course.id,
      code: course.code,
      name: course.name,
      units: createdUnits,
      cos: createdCOs,
      created_at: course.created_at
    });
  } catch (error) {
    next(error);
  }
};

const getAllCoursesHandler = async (req, res, next) => {
  try {
    const professorId = req.user.id;
    const courses = await getCoursesByProfessor(professorId);
    
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

const getCourseByIdHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const professorId = req.user.id;
    
    const course = await getCourseById(courseId);
    
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    
    if (course.professor_id !== professorId) {
      throw new AuthorizationError('You do not have permission to access this course');
    }
    
    const units = await getUnitsByCourse(courseId);
    const cos = await getCOsByCourse(courseId);
    
    res.json({
      id: course.id,
      code: course.code,
      name: course.name,
      units,
      cos,
      created_at: course.created_at,
      updated_at: course.updated_at
    });
  } catch (error) {
    next(error);
  }
};

const updateCourseHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { code, name } = req.body;
    const professorId = req.user.id;
    
    const course = await getCourseById(courseId);
    
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    
    if (course.professor_id !== professorId) {
      throw new AuthorizationError('You do not have permission to update this course');
    }
    
    if (!code || !name) {
      throw new ValidationError('Course code and name are required');
    }
    
    if (!/^[A-Za-z0-9]+$/.test(code) || code.length < 2 || code.length > 10) {
      throw new ValidationError('Course code must be alphanumeric and between 2 and 10 characters');
    }
    
    if (name.trim().length < 3 || name.trim().length > 100) {
      throw new ValidationError('Course name must be between 3 and 100 characters');
    }
    
    const updatedCourse = await updateCourse(courseId, code.trim(), name.trim());
    const units = await getUnitsByCourse(courseId);
    const cos = await getCOsByCourse(courseId);
    
    res.json({
      id: updatedCourse.id,
      code: updatedCourse.code,
      name: updatedCourse.name,
      units,
      cos,
      created_at: updatedCourse.created_at,
      updated_at: updatedCourse.updated_at
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourseHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const professorId = req.user.id;
    
    const course = await getCourseById(courseId);
    
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    
    if (course.professor_id !== professorId) {
      throw new AuthorizationError('You do not have permission to delete this course');
    }
    
    await deleteCourse(courseId);
    
    res.json({ message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourseHandler,
  getAllCoursesHandler,
  getCourseByIdHandler,
  updateCourseHandler,
  deleteCourseHandler
};
