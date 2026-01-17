const express = require('express');
const router = express.Router();

const blueprintController = require('../controllers/blueprintController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole('admin'), blueprintController.createBlueprintHandler);
router.get('/', blueprintController.getAllBlueprintsHandler);
router.get('/:blueprintId', blueprintController.getBlueprintByIdHandler);
router.put('/:blueprintId', verifyToken, requireRole('admin'), blueprintController.updateBlueprintHandler);
router.put('/:blueprintId/set-default', verifyToken, requireRole('admin'), blueprintController.setDefaultBlueprintHandler);
router.delete('/:blueprintId', verifyToken, requireRole('admin'), blueprintController.deleteBlueprintHandler);

module.exports = router;
