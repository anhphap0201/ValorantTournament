const Player = require("../models/player.js");

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
      const { teamName, members } = req.body;
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
