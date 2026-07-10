const Player = require("../models/player.js");
const db = require("../config/db.js");

const playerController = {
  getAll: async (req, res) => {
    try {
      const players = await Player.getAll();
      res.status(200).json(players);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy danh sách tuyển thủ." });
    }
  },

  getById: async (req, res) => {
    try {
      const player = await Player.getById(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Không tìm thấy tuyển thủ." });
      }
      res.status(200).json(player);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy thông tin tuyển thủ." });
    }
  },

  create: async (req, res) => {
    try {
      const nickname = req.body.nickname || req.body.discordUsername;
      if (!nickname) {
        return res.status(400).json({ error: "Username Discord (nickname) là bắt buộc." });
      }
      // Inject back as nickname for model consistency if needed
      req.body.nickname = nickname;
      
      const newPlayer = await Player.create(req.body);
      res.status(201).json(newPlayer);
    } catch (error) {
      console.error(error);
      if (error.code === '23505') { // Postgres duplicate key code
        return res.status(400).json({ error: "Riot ID đã tồn tại." });
      }
      res.status(500).json({ error: "Lỗi khi thêm tuyển thủ." });
    }
  },

  update: async (req, res) => {
    try {
      const nickname = req.body.nickname || req.body.discordUsername;
      if (nickname) {
        req.body.nickname = nickname;
      }
      const updatedPlayer = await Player.update(req.params.id, req.body);
      if (!updatedPlayer) {
        return res.status(404).json({ error: "Không tìm thấy tuyển thủ để cập nhật." });
      }
      res.status(200).json(updatedPlayer);
    } catch (error) {
      console.error(error);
      if (error.code === '23505') {
        return res.status(400).json({ error: "Riot ID đã tồn tại." });
      }
      res.status(500).json({ error: "Lỗi khi cập nhật tuyển thủ." });
    }
  },

  delete: async (req, res) => {
    try {
      const deletedPlayer = await Player.delete(req.params.id);
      if (!deletedPlayer) {
        return res.status(404).json({ error: "Không tìm thấy tuyển thủ để xóa." });
      }
      res.status(200).json({ message: "Xóa tuyển thủ thành công.", player: deletedPlayer });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi xóa tuyển thủ." });
    }
  },

  // Expose registerTeam CRUD for Vue 5-member registration form
  registerTeam: async (req, res) => {
    try {
      const { teamName, members, userId } = req.body;
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({ error: "Tên đội là bắt buộc." });
      }
      if (!members || !Array.isArray(members) || members.length !== 5) {
        return res.status(400).json({ error: "Thông tin đăng ký phải chứa đúng 5 tuyển thủ." });
      }
      
      // Perform validation check on all 5 members' nicknames (discordUsername or nickname)
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const mNickname = m.discordUsername || m.nickname;
        if (!mNickname) {
          return res.status(400).json({ error: `Username Discord của thành viên ${i + 1} là bắt buộc.` });
        }
      }

      // 1. Validate team name duplicate (excluding own team)
      const checkTeam = await db.query(
        "SELECT id, user_id FROM teams WHERE LOWER(name) = LOWER($1)",
        [teamName.trim()]
      );
      if (checkTeam.rows.length > 0) {
        const existingTeam = checkTeam.rows[0];
        if (Number(existingTeam.user_id) !== Number(userId)) {
          return res.status(400).json({ error: `Tên đội "${teamName}" đã tồn tại. Vui lòng chọn tên khác.` });
        }
      }

      // 2. Validate member properties (riot_id, facebook_link, nickname) against other teams
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const mNickname = m.discordUsername || m.nickname;

        // Check Riot ID
        if (m.riotId) {
          const checkRiot = await db.query(
            "SELECT id, team_id FROM players WHERE LOWER(riot_id) = LOWER($1)",
            [m.riotId.trim()]
          );
          if (checkRiot.rows.length > 0) {
            const existingPlayer = checkRiot.rows[0];
            const teamRes = await db.query("SELECT user_id FROM teams WHERE id = $1", [existingPlayer.team_id]);
            const playerTeamUserId = teamRes.rows[0]?.user_id;
            if (Number(playerTeamUserId) !== Number(userId)) {
              return res.status(400).json({ error: `Riot ID "${m.riotId}" của thành viên ${i + 1} đã được đăng ký bởi đội tuyển khác.` });
            }
          }
        }

        // Check Facebook Link
        if (m.facebookLink) {
          const checkFb = await db.query(
            "SELECT id, team_id FROM players WHERE LOWER(facebook_link) = LOWER($1)",
            [m.facebookLink.trim()]
          );
          if (checkFb.rows.length > 0) {
            const existingPlayer = checkFb.rows[0];
            const teamRes = await db.query("SELECT user_id FROM teams WHERE id = $1", [existingPlayer.team_id]);
            const playerTeamUserId = teamRes.rows[0]?.user_id;
            if (Number(playerTeamUserId) !== Number(userId)) {
              return res.status(400).json({ error: `Liên kết Facebook "${m.facebookLink}" của thành viên ${i + 1} đã được đăng ký bởi đội tuyển khác.` });
            }
          }
        }

        // Check Discord Nickname
        if (mNickname) {
          const checkDiscord = await db.query(
            "SELECT id, team_id FROM players WHERE LOWER(nickname) = LOWER($1)",
            [mNickname.trim()]
          );
          if (checkDiscord.rows.length > 0) {
            const existingPlayer = checkDiscord.rows[0];
            const teamRes = await db.query("SELECT user_id FROM teams WHERE id = $1", [existingPlayer.team_id]);
            const playerTeamUserId = teamRes.rows[0]?.user_id;
            if (Number(playerTeamUserId) !== Number(userId)) {
              return res.status(400).json({ error: `Discord Username "${mNickname}" của thành viên ${i + 1} đã được đăng ký bởi đội tuyển khác.` });
            }
          }
        }
      }
      
      const result = await Player.registerTeam(req.body);
      res.status(201).json({
        message: "Đăng ký đội tuyển thành công!",
        data: result
      });
    } catch (error) {
      console.error("Register team error:", error);
      res.status(500).json({ error: error.message || "Lỗi trong quá trình đăng ký đội tuyển." });
    }
  }
};

module.exports = playerController;
