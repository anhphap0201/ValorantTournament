const db = require("../config/db.js");

const check = async () => {
  try {
    const resTournaments = await db.query("SELECT * FROM tournaments");
    console.log("=== TOURNAMENTS ===");
    console.log(resTournaments.rows);

    const resTeams = await db.query("SELECT * FROM teams");
    console.log("=== TEAMS ===");
    console.log(resTeams.rows);

    const resCount = await db.query(`
      SELECT t.id, t.name, COALESCE(COUNT(te.id), 0)::int as registered_teams_count 
      FROM tournaments t 
      LEFT JOIN teams te ON t.id = te.tournament_id 
      GROUP BY t.id
    `);
    console.log("=== COUNTS ===");
    console.log(resCount.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

check();
