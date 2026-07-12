const db = require("../config/db.js");

// Initialize and migrate column if needed
const initializeTable = async () => {
  const alterTeamsTokens = `
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS tokens_remaining INT DEFAULT 1000;
  `;
  try {
    await db.query(alterTeamsTokens);
    console.log("Database column 'tokens_remaining' verified/created in 'teams' table.");
  } catch (err) {
    console.error("Error migrating 'teams' table column 'tokens_remaining':", err);
  }
};

initializeTable();

const Team = {
  getAll: async (tournamentId = null) => {
    let queryText = `
      SELECT t.*, 
        c.id as captain_player_id,
        c.nickname as captain_nickname,
        c.avatar as captain_avatar,
        c.rank_name as captain_rank_name,
        c.preferred_role as captain_preferred_role,
        c.favorite_agent as captain_favorite_agent,
        c.full_name as captain_full_name,
        c.riot_id as captain_riot_id,
        c.strengths as captain_strengths,
        c.facebook_link as captain_facebook_link,
        c.gender as captain_gender
      FROM teams t
      LEFT JOIN players c ON t.id = c.team_id AND c.is_captain = true
    `;
    const params = [];
    if (tournamentId) {
      queryText += ` WHERE t.tournament_id = $1`;
      params.push(tournamentId);
    }
    queryText += ` ORDER BY t.id DESC`;
    
    const res = await db.query(queryText, params);
    const teamsList = res.rows;
 
    // For each team, fetch its members
    for (let team of teamsList) {
      // Get members (non-captains)
      const membersRes = await db.query(
        "SELECT * FROM players WHERE team_id = $1 AND (is_captain = false OR is_captain IS NULL) ORDER BY id ASC",
        [team.id]
      );
      team.members = membersRes.rows;
      
      // Construct a clean captain object
      if (team.captain_nickname) {
        team.captain = {
          id: team.captain_player_id,
          nickname: team.captain_nickname,
          avatar: team.captain_avatar,
          rank_name: team.captain_rank_name,
          preferred_role: team.captain_preferred_role,
          favorite_agent: team.captain_favorite_agent,
          full_name: team.captain_full_name,
          riot_id: team.captain_riot_id,
          strengths: team.captain_strengths,
          facebook_link: team.captain_facebook_link,
          gender: team.captain_gender,
          is_captain: true
        };
      } else {
        team.captain = null;
      }
      
      // Delete temporary join fields from team object to keep response clean
      delete team.captain_player_id;
      delete team.captain_avatar;
      delete team.captain_rank_name;
      delete team.captain_preferred_role;
      delete team.captain_favorite_agent;
      delete team.captain_full_name;
      delete team.captain_riot_id;
      delete team.captain_strengths;
      delete team.captain_facebook_link;
      delete team.captain_gender;
    }
    
    return teamsList;
  },

  getById: async (id) => {
    const queryText = `
      SELECT t.*, 
        c.id as captain_player_id,
        c.nickname as captain_nickname,
        c.avatar as captain_avatar,
        c.rank_name as captain_rank_name,
        c.preferred_role as captain_preferred_role,
        c.favorite_agent as captain_favorite_agent,
        c.full_name as captain_full_name,
        c.riot_id as captain_riot_id,
        c.strengths as captain_strengths,
        c.facebook_link as captain_facebook_link,
        c.gender as captain_gender
      FROM teams t
      LEFT JOIN players c ON t.id = c.team_id AND c.is_captain = true
      WHERE t.id = $1
    `;
    const res = await db.query(queryText, [id]);
    const team = res.rows[0];
    if (!team) return null;

    // Get members
    const membersRes = await db.query(
      "SELECT * FROM players WHERE team_id = $1 AND (is_captain = false OR is_captain IS NULL) ORDER BY id ASC",
      [id]
    );
    team.members = membersRes.rows;

    // Construct captain object
    if (team.captain_nickname) {
      team.captain = {
        id: team.captain_player_id,
        nickname: team.captain_nickname,
        avatar: team.captain_avatar,
        rank_name: team.captain_rank_name,
        preferred_role: team.captain_preferred_role,
        favorite_agent: team.captain_favorite_agent,
        full_name: team.captain_full_name,
        riot_id: team.captain_riot_id,
        strengths: team.captain_strengths,
        facebook_link: team.captain_facebook_link,
        gender: team.captain_gender,
        is_captain: true
      };
    } else {
      team.captain = null;
    }

    delete team.captain_player_id;
    delete team.captain_avatar;
    delete team.captain_rank_name;
    delete team.captain_preferred_role;
    delete team.captain_favorite_agent;
    delete team.captain_full_name;
    delete team.captain_riot_id;
    delete team.captain_strengths;
    delete team.captain_facebook_link;
    delete team.captain_gender;

    return team;
  },

  create: async (data) => {
    const name = data.name;
    const logo = data.logo || null;
    const tournament_id = data.tournament_id || data.tournamentId || null;
    const tokens_remaining = data.tokens_remaining !== undefined ? data.tokens_remaining : 1000;
    const user_id = data.user_id || data.userId || null;

    const queryText = `
      INSERT INTO teams (name, logo, tournament_id, tokens_remaining, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await db.query(queryText, [name, logo, tournament_id, tokens_remaining, user_id]);
    return res.rows[0];
  },

  update: async (id, data) => {
    const current = await Team.getById(id);
    if (!current) return null;

    const name = data.name !== undefined ? data.name : current.name;
    const logo = data.logo !== undefined ? data.logo : current.logo;
    const tournament_id = data.tournament_id !== undefined ? (data.tournament_id || data.tournamentId) : current.tournament_id;
    const tokens_remaining = data.tokens_remaining !== undefined ? data.tokens_remaining : current.tokens_remaining;
    const points = data.points !== undefined ? data.points : (current.points || 0);
    const wins = data.wins !== undefined ? data.wins : (current.wins || 0);
    const losses = data.losses !== undefined ? data.losses : (current.losses || 0);
    const user_id = data.user_id !== undefined ? (data.user_id || data.userId) : current.user_id;

    const queryText = `
      UPDATE teams SET
        name = $1,
        logo = $2,
        tournament_id = $3,
        tokens_remaining = $4,
        points = $5,
        wins = $6,
        losses = $7,
        user_id = $8
      WHERE id = $9
      RETURNING *
    `;
    const res = await db.query(queryText, [name, logo, tournament_id, tokens_remaining, points, wins, losses, user_id, id]);
    return res.rows[0];
  },

  delete: async (id) => {
    const queryText = `DELETE FROM teams WHERE id = $1 RETURNING *`;
    const res = await db.query(queryText, [id]);
    return res.rows[0];
  }
};

module.exports = Team;
