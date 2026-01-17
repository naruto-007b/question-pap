const pool = require('../config/database');

/**
 * Create a new user in the database
 * @param {string} email 
 * @param {string} passwordHash 
 * @param {string} role 
 * @returns {Promise<Object>} The created user
 */
const createUser = async (email, passwordHash, role = 'professor') => {
  const query = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role, created_at, updated_at
  `;
  const values = [email, passwordHash, role];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

/**
 * Get a user by their email
 * @param {string} email 
 * @returns {Promise<Object|null>} The user if found, null otherwise
 */
const getUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password_hash, role, created_at, updated_at
    FROM users
    WHERE email = $1
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
};

/**
 * Get a user by their ID
 * @param {string} id 
 * @returns {Promise<Object|null>} The user if found, null otherwise
 */
const getUserById = async (id) => {
  const query = `
    SELECT id, email, role, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};
