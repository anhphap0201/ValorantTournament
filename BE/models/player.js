const db = require("../config/db.js");

// Initialize tables and run migrations if needed
const initializeTable = async () => {
  const queryTeams = `
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const queryPlayers = `
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      riot_id VARCHAR(100) UNIQUE,
      nickname VARCHAR(100) NOT NULL,
      full_name VARCHAR(100),
      gender VARCHAR(20),
      facebook_link VARCHAR(255),
      favorite_agent VARCHAR(50),
      strengths TEXT,
      avatar TEXT,
      rank_name VARCHAR(50),
      preferred_role VARCHAR(255),
      team_id INT REFERENCES teams(id) ON DELETE SET NULL,
      is_captain BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  // Alter statements to migrate existing players table if columns are missing
  const alterTeamId = `
    ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id INT REFERENCES teams(id) ON DELETE SET NULL;
  `;
  const alterIsCaptain = `
    ALTER TABLE players ADD COLUMN IF NOT EXISTS is_captain BOOLEAN DEFAULT FALSE;
  `;

  try {
    await db.query(queryTeams);
    await db.query(queryPlayers);
    await db.query(alterTeamId);
    await db.query(alterIsCaptain);
    console.log("Database tables and columns verified/migrated successfully.");
  } catch (err) {
    console.error("Error creating/migrating tables:", err);
  }
};

// Auto run initialization
initializeTable();

const Player = {
  getAll: async () => {
    const res = await db.query("SELECT * FROM players ORDER BY id DESC");
    return res.rows;
  },

  getById: async (id) => {
    const res = await db.query("SELECT * FROM players WHERE id = $1", [id]);
    return res.rows[0];
  },

  create: async (player) => {
    const riot_id = player.riot_id || player.riotId;
    const nickname = player.nickname || player.discordUsername;
    const full_name = player.full_name || player.fullName;
    const gender = player.gender;
    const facebook_link = player.facebook_link || player.facebookLink;
    const favorite_agent = player.favorite_agent || player.favoriteAgent;
    const strengths = player.strengths;
    const avatar = player.avatar;
    const rank_name = player.rank_name || player.rankName;
    
    let preferred_role = '';
    if (player.preferredRoles) {
      preferred_role = Array.isArray(player.preferredRoles) 
        ? player.preferredRoles.join(', ') 
        : player.preferredRoles;
    } else {
      preferred_role = player.preferred_role || '';
    }

    const team_id = player.team_id || player.teamId;
    const is_captain = player.is_captain || player.isCaptain;

    const queryText = `
      INSERT INTO players (
        riot_id, nickname, full_name, gender, facebook_link, 
        favorite_agent, strengths, avatar, rank_name, preferred_role,
        team_id, is_captain
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      riot_id || '',
      nickname || '',
      full_name || '',
      gender || '',
      facebook_link || '',
      favorite_agent || '',
      strengths || '',
      avatar || null,
      rank_name || '',
      preferred_role || '',
      team_id || null,
      is_captain || false
    ];

    const res = await db.query(queryText, values);
    return res.rows[0];
  },

  update: async (id, player) => {
    const riot_id = player.riot_id || player.riotId;
    const nickname = player.nickname || player.discordUsername;
    const full_name = player.full_name || player.fullName;
    const gender = player.gender;
    const facebook_link = player.facebook_link || player.facebookLink;
    const favorite_agent = player.favorite_agent || player.favoriteAgent;
    const strengths = player.strengths;
    const avatar = player.avatar;
    const rank_name = player.rank_name || player.rankName;
    
    let preferred_role = '';
    if (player.preferredRoles) {
      preferred_role = Array.isArray(player.preferredRoles) 
        ? player.preferredRoles.join(', ') 
        : player.preferredRoles;
    } else {
      preferred_role = player.preferred_role || '';
    }

    const team_id = player.team_id || player.teamId;
    const is_captain = player.is_captain || player.isCaptain;

    const queryText = `
      UPDATE players SET
        riot_id = $1,
        nickname = $2,
        full_name = $3,
        gender = $4,
        facebook_link = $5,
        favorite_agent = $6,
        strengths = $7,
        avatar = $8,
        rank_name = $9,
        preferred_role = $10,
        team_id = $11,
        is_captain = $12
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      riot_id || '',
      nickname || '',
      full_name || '',
      gender || '',
      facebook_link || '',
      favorite_agent || '',
      strengths || '',
      avatar || null,
      rank_name || '',
      preferred_role || '',
      team_id || null,
      is_captain || false,
      id
    ];

    const res = await db.query(queryText, values);
    return res.rows[0];
  },

  delete: async (id) => {
    const res = await db.query("DELETE FROM players WHERE id = $1 RETURNING *", [id]);
    return res.rows[0];
  },

  registerTeam: async (teamData) => {
    const { teamName, teamLogo, members } = teamData;
    
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      const resTeam = await client.query(
        "INSERT INTO teams (name, logo) VALUES ($1, $2) RETURNING *",
        [teamName, teamLogo || null]
      );
      const teamId = resTeam.rows[0].id;
      
      const insertedPlayers = [];
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const isCaptain = i === 0;

        const preferredRoleStr = Array.isArray(m.preferredRoles) 
          ? m.preferredRoles.join(', ') 
          : (m.preferredRoles || '');

        const queryText = `
          INSERT INTO players (
            riot_id, nickname, full_name, gender, facebook_link, 
            favorite_agent, strengths, avatar, rank_name, preferred_role,
            team_id, is_captain
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (riot_id) DO UPDATE SET
            nickname = EXCLUDED.nickname,
            full_name = EXCLUDED.full_name,
            gender = EXCLUDED.gender,
            facebook_link = EXCLUDED.facebook_link,
            favorite_agent = EXCLUDED.favorite_agent,
            strengths = EXCLUDED.strengths,
            avatar = EXCLUDED.avatar,
            rank_name = EXCLUDED.rank_name,
            preferred_role = EXCLUDED.preferred_role,
            team_id = EXCLUDED.team_id,
            is_captain = EXCLUDED.is_captain
          RETURNING *
        `;
        
        const values = [
          m.riotId || m.riot_id || '',
          m.discordUsername || m.nickname || '',
          m.fullName || m.full_name || '',
          m.gender || '',
          m.facebookLink || m.facebook_link || '',
          m.favoriteAgent || m.favorite_agent || '',
          m.strengths || '',
          m.avatar || null,
          m.rankName || m.rank_name || '',
          preferredRoleStr,
          teamId,
          isCaptain
        ];
        
        const resPlayer = await client.query(queryText, values);
        insertedPlayers.push(resPlayer.rows[0]);
      }
      
      await client.query('COMMIT');
      return { team: resTeam.rows[0], players: insertedPlayers };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = Player;
