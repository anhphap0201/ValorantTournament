const db = require("../config/db.js");

// Initialize tournaments table
const initializeTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS tournaments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      format VARCHAR(100),
      max_teams INT,
      prize_pool VARCHAR(100),
      status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'register', 'running', 'finished')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const alterQuery = `
    ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS swiss_wins_required INT DEFAULT 3;
    ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS swiss_losses_required INT DEFAULT 3;
  `;
  try {
    await db.query(queryText);
    await db.query(alterQuery);
    console.log("Database table 'tournaments' is verified/created successfully.");
  } catch (err) {
    console.error("Error creating 'tournaments' table:", err);
  }
};

initializeTable();

const Tournament = {
  getAll: async () => {
    const queryText = `
      SELECT t.*, COALESCE(COUNT(te.id), 0)::int as registered_teams_count 
      FROM tournaments t 
      LEFT JOIN teams te ON t.id = te.tournament_id 
      GROUP BY t.id 
      ORDER BY t.id DESC
    `;
    const res = await db.query(queryText);
    return res.rows;
  },

  getById: async (id) => {
    const queryText = `
      SELECT t.*, COALESCE(COUNT(te.id), 0)::int as registered_teams_count 
      FROM tournaments t 
      LEFT JOIN teams te ON t.id = te.tournament_id 
      WHERE t.id = $1 
      GROUP BY t.id
    `;
    const res = await db.query(queryText, [id]);
    return res.rows[0];
  },

  create: async (data) => {
    const name = data.name;
    const description = data.description || '';
    const start_date = data.start_date || data.startDate || null;
    const end_date = data.end_date || data.endDate || null;
    const format = data.format || '';
    const max_teams = data.max_teams || data.maxTeams || null;
    const prize_pool = data.prize_pool || data.prizePool || '';
    const status = data.status || 'upcoming';
    const swiss_wins_required = data.swiss_wins_required !== undefined ? data.swiss_wins_required : (data.swissWinsRequired !== undefined ? data.swissWinsRequired : 3);
    const swiss_losses_required = data.swiss_losses_required !== undefined ? data.swiss_losses_required : (data.swissLossesRequired !== undefined ? data.swissLossesRequired : 3);

    const queryText = `
      INSERT INTO tournaments (
        name, description, start_date, end_date, format, max_teams, prize_pool, status, swiss_wins_required, swiss_losses_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [name, description, start_date, end_date, format, max_teams, prize_pool, status, swiss_wins_required, swiss_losses_required];
    const res = await db.query(queryText, values);
    return res.rows[0];
  },

  update: async (id, data) => {
    const name = data.name;
    const description = data.description;
    const start_date = data.start_date || data.startDate || null;
    const end_date = data.end_date || data.endDate || null;
    const format = data.format;
    const max_teams = data.max_teams || data.maxTeams || null;
    const prize_pool = data.prize_pool || data.prizePool || '';
    const status = data.status || 'upcoming';
    const swiss_wins_required = data.swiss_wins_required !== undefined ? data.swiss_wins_required : (data.swissWinsRequired !== undefined ? data.swissWinsRequired : 3);
    const swiss_losses_required = data.swiss_losses_required !== undefined ? data.swiss_losses_required : (data.swissLossesRequired !== undefined ? data.swissLossesRequired : 3);

    const queryText = `
      UPDATE tournaments SET
        name = $1,
        description = $2,
        start_date = $3,
        end_date = $4,
        format = $5,
        max_teams = $6,
        prize_pool = $7,
        status = $8,
        swiss_wins_required = $9,
        swiss_losses_required = $10
      WHERE id = $11
      RETURNING *
    `;

    const values = [name, description, start_date, end_date, format, max_teams, prize_pool, status, swiss_wins_required, swiss_losses_required, id];
    const res = await db.query(queryText, values);
    return res.rows[0];
  },

  delete: async (id) => {
    const res = await db.query("DELETE FROM tournaments WHERE id = $1 RETURNING *", [id]);
    return res.rows[0];
  }
};

module.exports = Tournament;
