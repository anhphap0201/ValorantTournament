const Tournament = require("../models/tournament.js");

const tournamentController = {
  getAll: async (req, res) => {
    try {
      const list = await Tournament.getAll();
      res.status(200).json(list);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy danh sách giải đấu." });
    }
  },

  getById: async (req, res) => {
    try {
      const item = await Tournament.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Không tìm thấy giải đấu." });
      }
      res.status(200).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy chi tiết giải đấu." });
    }
  },

  create: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tên giải đấu là bắt buộc." });
      }
      const newItem = await Tournament.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi tạo giải đấu." });
    }
  },

  update: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tên giải đấu là bắt buộc." });
      }
      const updated = await Tournament.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy giải đấu để cập nhật." });
      }
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi cập nhật giải đấu." });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Tournament.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Không tìm thấy giải đấu để xóa." });
      }
      res.status(200).json({ message: "Xóa giải đấu thành công.", tournament: deleted });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi xóa giải đấu." });
    }
  }
};

module.exports = tournamentController;
