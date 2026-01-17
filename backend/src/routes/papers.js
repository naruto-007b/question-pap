const express = require('express');
const router = express.Router();

const paperController = require('../controllers/paperController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/generate-paper', paperController.generatePaperHandler);
router.get('/', paperController.getPapersByCourseHandler);
router.get('/:paperId', paperController.getPaperByIdHandler);
router.delete('/:paperId', paperController.deletePaperHandler);

module.exports = router;
