const User = require("../models/user.js");

const userController = {
  getAll: async (req, res) => {
    try {
      const users = await User.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Lỗi lấy danh sách tài khoản:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách tài khoản." });
    }
  },

  create: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin: tên đăng nhập, email và mật khẩu." });
      }

      // Check username duplicate
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Tên đăng nhập đã tồn tại." });
      }

      // Check email duplicate
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email đã tồn tại." });
      }

      const newUser = await User.createWithRole({ username, email, password, role });
      res.status(201).json({
        message: "Tạo tài khoản người dùng thành công!",
        user: newUser
      });
    } catch (error) {
      console.error("Lỗi thêm tài khoản:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi thêm tài khoản." });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản để xóa." });
      }

      // Safeguard: Prevent deleting the root admin account
      if (userToDelete.username === 'admin') {
        return res.status(400).json({ error: "Không thể xóa tài khoản quản trị gốc (admin)." });
      }

      const deletedUser = await User.delete(id);
      res.status(200).json({
        message: "Xóa tài khoản thành công!",
        user: deletedUser
      });
    } catch (error) {
      console.error("Lỗi xóa tài khoản:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi xóa tài khoản." });
    }
  },

  updateRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ error: "Vai trò là bắt buộc." });
      }

      const userToUpdate = await User.findById(id);
      if (!userToUpdate) {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }

      // Safeguard: Prevent changing root admin's role
      if (userToUpdate.username === 'admin') {
        return res.status(400).json({ error: "Không thể thay đổi vai trò của tài khoản quản trị gốc." });
      }

      const updatedUser = await User.updateRole(id, role);
      res.status(200).json({
        message: "Cập nhật vai trò thành công!",
        user: updatedUser
      });
    } catch (error) {
      console.error("Lỗi cập nhật vai trò:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi cập nhật vai trò." });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password, role } = req.body;

      if (!username || !email) {
        return res.status(400).json({ error: "Tên đăng nhập và email là bắt buộc." });
      }

      const userToUpdate = await User.findById(id);
      if (!userToUpdate) {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }

      // Safeguard: Prevent changing root admin's details
      if (userToUpdate.username === 'admin') {
        return res.status(400).json({ error: "Không thể thay đổi thông tin của tài khoản quản trị gốc." });
      }

      // Check duplicates
      const existingUserByUsername = await User.findByUsernameExcludeId(username, id);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Tên đăng nhập đã tồn tại." });
      }

      const existingUserByEmail = await User.findByEmailExcludeId(email, id);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email đã tồn tại." });
      }

      const updatedPassword = password ? password : userToUpdate.password_hash;
      const updatedUser = await User.updateAdmin(id, {
        username,
        email,
        password: updatedPassword,
        role: role || 'guest'
      });

      res.status(200).json({
        message: "Cập nhật tài khoản thành công!",
        user: updatedUser
      });
    } catch (error) {
      console.error("Lỗi cập nhật tài khoản:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi cập nhật tài khoản." });
    }
  }
};

module.exports = userController;
