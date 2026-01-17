const pool = require('../config/database');

const createBlueprint = async (name, structure) => {
  const query = `
    INSERT INTO blueprints (name, structure, is_default)
    VALUES ($1, $2::jsonb, FALSE)
    RETURNING id, name, structure, is_default, created_at, updated_at
  `;
  const values = [name, JSON.stringify(structure)];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getBlueprintById = async (blueprintId) => {
  const query = `
    SELECT id, name, structure, is_default, created_at, updated_at
    FROM blueprints
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [blueprintId]);
  return rows[0] || null;
};

const getAllBlueprints = async () => {
  const query = `
    SELECT id, name, structure, is_default, created_at, updated_at
    FROM blueprints
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getDefaultBlueprint = async () => {
  const query = `
    SELECT id, name, structure, is_default, created_at, updated_at
    FROM blueprints
    WHERE is_default = TRUE
  `;
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const updateBlueprint = async (blueprintId, data) => {
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }

  if (data.structure !== undefined) {
    updates.push(`structure = $${paramIndex++}::jsonb`);
    values.push(JSON.stringify(data.structure));
  }

  if (updates.length === 0) {
    return await getBlueprintById(blueprintId);
  }

  values.push(blueprintId);
  const query = `
    UPDATE blueprints
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING id, name, structure, is_default, created_at, updated_at
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const setDefaultBlueprint = async (blueprintId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE blueprints SET is_default = FALSE'
    );

    const query = `
      UPDATE blueprints
      SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, structure, is_default, created_at, updated_at
    `;
    const { rows } = await client.query(query, [blueprintId]);

    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteBlueprint = async (blueprintId) => {
  const query = `DELETE FROM blueprints WHERE id = $1`;
  await pool.query(query, [blueprintId]);
};

module.exports = {
  createBlueprint,
  getBlueprintById,
  getAllBlueprints,
  getDefaultBlueprint,
  updateBlueprint,
  setDefaultBlueprint,
  deleteBlueprint
};
