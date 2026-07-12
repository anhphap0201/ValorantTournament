const db = require("../config/db.js");

// Initialize matches table and alter teams table to support standings
const initializeTable = async () => {
  const alterTeamsQuery = `
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS wins INT DEFAULT 0;
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS losses INT DEFAULT 0;
  `;

  const createMatchesQuery = `
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      round INT,
      team_a_id INT REFERENCES teams(id) ON DELETE CASCADE,
      team_b_id INT REFERENCES teams(id) ON DELETE CASCADE,
      team_a_score INT DEFAULT 0,
      team_b_score INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
      winner_id INT REFERENCES teams(id) ON DELETE SET NULL,
      stage VARCHAR(50) DEFAULT 'round_robin' CHECK (stage IN ('round_robin', 'swiss', 'semi_final', 'third_place', 'final')),
      match_order INT DEFAULT 1,
      match_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const alterMatchesStageCheck = `
    ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;
    ALTER TABLE matches ADD CONSTRAINT matches_stage_check CHECK (stage IN ('round_robin', 'swiss', 'semi_final', 'third_place', 'final'));
  `;

  const alterMatchesTimeQuery = `
    ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_time TIMESTAMP;
  `;

  try {
    await db.query(alterTeamsQuery);
    console.log("Database columns 'points', 'wins', 'losses' verified/created in 'teams' table.");
    
    await db.query(createMatchesQuery);
    await db.query(alterMatchesStageCheck);
    await db.query(alterMatchesTimeQuery);
    console.log("Database table 'matches' is verified/created/migrated successfully.");
  } catch (err) {
    console.error("Error creating/migrating 'matches' table or altering 'teams' table:", err);
  }
};

initializeTable();

const Match = {
  getAllByTournamentId: async (tournamentId) => {
    const queryText = `
      SELECT m.*, 
             ta.name as team_a_name, ta.logo as team_a_logo,
             tb.name as team_b_name, tb.logo as team_b_logo,
             w.name as winner_name
      FROM matches m
      LEFT JOIN teams ta ON m.team_a_id = ta.id
      LEFT JOIN teams tb ON m.team_b_id = tb.id
      LEFT JOIN teams w ON m.winner_id = w.id
      WHERE m.tournament_id = $1
      ORDER BY 
        CASE 
          WHEN m.stage = 'round_robin' THEN 1
          WHEN m.stage = 'semi_final' THEN 2
          WHEN m.stage = 'third_place' THEN 3
          WHEN m.stage = 'final' THEN 4
          ELSE 5
        END,
        m.round ASC,
        m.match_order ASC
    `;
    const res = await db.query(queryText, [tournamentId]);
    return res.rows;
  },

  getById: async (id) => {
    const queryText = `
      SELECT m.*, 
             ta.name as team_a_name, ta.logo as team_a_logo,
             tb.name as team_b_name, tb.logo as team_b_logo,
             w.name as winner_name
      FROM matches m
      LEFT JOIN teams ta ON m.team_a_id = ta.id
      LEFT JOIN teams tb ON m.team_b_id = tb.id
      LEFT JOIN teams w ON m.winner_id = w.id
      WHERE m.id = $1
    `;
    const res = await db.query(queryText, [id]);
    return res.rows[0];
  },

  createMatches: async (matchesList) => {
    const created = [];
    for (const m of matchesList) {
      const queryText = `
        INSERT INTO matches (
          tournament_id, round, team_a_id, team_b_id, team_a_score, team_b_score, status, winner_id, stage, match_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const values = [
        m.tournament_id,
        m.round,
        m.team_a_id,
        m.team_b_id,
        m.team_a_score || 0,
        m.team_b_score || 0,
        m.status || 'pending',
        m.winner_id || null,
        m.stage || 'round_robin',
        m.match_order || 1
      ];
      const res = await db.query(queryText, values);
      created.push(res.rows[0]);
    }
    return created;
  },

  deleteByTournamentId: async (tournamentId) => {
    const queryText = `DELETE FROM matches WHERE tournament_id = $1 RETURNING *`;
    const res = await db.query(queryText, [tournamentId]);
    return res.rows;
  },

  deleteMatchesByStage: async (tournamentId, stage) => {
    const queryText = `DELETE FROM matches WHERE tournament_id = $1 AND stage = $2 RETURNING *`;
    const res = await db.query(queryText, [tournamentId, stage]);
    return res.rows;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const queryText = `
      UPDATE matches SET
        ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *
    `;
    const res = await db.query(queryText, values);
    return res.rows[0];
  }
};

module.exports = Match;
