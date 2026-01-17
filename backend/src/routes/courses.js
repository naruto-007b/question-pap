const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');

router.post('/', courseController.createCourseHandler);
router.get('/', courseController.getAllCoursesHandler);
router.get('/:courseId', courseController.getCourseByIdHandler);
router.put('/:courseId', courseController.updateCourseHandler);
router.delete('/:courseId', courseController.deleteCourseHandler);

module.exports = router;
