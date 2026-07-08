const Team = require("../models/team.js");

const teamController = {
  getAll: async (req, res) => {
    try {
      const tournamentId = req.query.tournament_id || req.query.tournamentId || null;
      const list = await Team.getAll(tournamentId);
      res.status(200).json(list);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy danh sách đội tuyển." });
    }
  },

  getById: async (req, res) => {
    try {
      const item = await Team.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Không tìm thấy đội tuyển." });
      }
      res.status(200).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy chi tiết đội tuyển." });
    }
  },

  create: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tên đội tuyển là bắt buộc." });
      }
      const newItem = await Team.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi tạo đội tuyển." });
    }
  },

  update: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tên đội tuyển là bắt buộc." });
      }
      const updated = await Team.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy đội tuyển để cập nhật." });
      }
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi cập nhật đội tuyển." });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Team.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Không tìm thấy đội tuyển để xóa." });
      }
      res.status(200).json({ message: "Xóa đội tuyển thành công.", team: deleted });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi xóa đội tuyển." });
    }
  }
};

module.exports = teamController;
