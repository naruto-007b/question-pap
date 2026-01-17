const {
  createBlueprint,
  getBlueprintById,
  getAllBlueprints,
  getDefaultBlueprint,
  updateBlueprint,
  setDefaultBlueprint,
  deleteBlueprint
} = require('../db/blueprintQueries');
const { validateBlueprintCreation } = require('../utils/blueprintValidation');
const {
  ValidationError,
  NotFoundError,
  AuthorizationError
} = require('../utils/errors');

const createBlueprintHandler = async (req, res, next) => {
  try {
    const { name, structure } = req.body;

    const validationErrors = validateBlueprintCreation({ name, structure });
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }

    const blueprint = await createBlueprint(name.trim(), structure);

    res.status(201).json({
      id: blueprint.id,
      name: blueprint.name,
      structure: blueprint.structure,
      is_default: blueprint.is_default,
      created_at: blueprint.created_at
    });
  } catch (error) {
    next(error);
  }
};

const getAllBlueprintsHandler = async (req, res, next) => {
  try {
    const blueprints = await getAllBlueprints();

    res.json(blueprints);
  } catch (error) {
    next(error);
  }
};

const getBlueprintByIdHandler = async (req, res, next) => {
  try {
    const { blueprintId } = req.params;

    const blueprint = await getBlueprintById(blueprintId);

    if (!blueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    res.json({
      id: blueprint.id,
      name: blueprint.name,
      structure: blueprint.structure,
      is_default: blueprint.is_default,
      created_at: blueprint.created_at,
      updated_at: blueprint.updated_at
    });
  } catch (error) {
    next(error);
  }
};

const updateBlueprintHandler = async (req, res, next) => {
  try {
    const { blueprintId } = req.params;
    const { name, structure } = req.body;

    const existingBlueprint = await getBlueprintById(blueprintId);

    if (!existingBlueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    const updateData = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 255) {
        throw new ValidationError('Blueprint name must be between 3 and 255 characters');
      }
      updateData.name = name.trim();
    }

    if (structure !== undefined) {
      if (typeof structure !== 'object') {
        throw new ValidationError('Structure must be an object');
      }

      const validationErrors = validateBlueprintCreation({
        name: updateData.name || existingBlueprint.name,
        structure
      });

      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      updateData.structure = structure;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const updatedBlueprint = await updateBlueprint(blueprintId, updateData);

    res.json({
      id: updatedBlueprint.id,
      name: updatedBlueprint.name,
      structure: updatedBlueprint.structure,
      is_default: updatedBlueprint.is_default,
      created_at: updatedBlueprint.created_at,
      updated_at: updatedBlueprint.updated_at
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultBlueprintHandler = async (req, res, next) => {
  try {
    const { blueprintId } = req.params;

    const existingBlueprint = await getBlueprintById(blueprintId);

    if (!existingBlueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    await setDefaultBlueprint(blueprintId);

    res.json({ message: 'Default blueprint updated' });
  } catch (error) {
    next(error);
  }
};

const deleteBlueprintHandler = async (req, res, next) => {
  try {
    const { blueprintId } = req.params;

    const existingBlueprint = await getBlueprintById(blueprintId);

    if (!existingBlueprint) {
      throw new NotFoundError('Blueprint not found');
    }

    if (existingBlueprint.is_default) {
      throw new ValidationError('Cannot delete the default blueprint');
    }

    await deleteBlueprint(blueprintId);

    res.json({ message: 'Blueprint deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlueprintHandler,
  getAllBlueprintsHandler,
  getBlueprintByIdHandler,
  updateBlueprintHandler,
  setDefaultBlueprintHandler,
  deleteBlueprintHandler
};
