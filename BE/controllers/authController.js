const User = require("../models/user.js");

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ tên đăng nhập, email và mật khẩu." });
      }

      // Check if username already exists
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Tên đăng nhập đã tồn tại." });
      }

      // Check if email already exists
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email đã tồn tại." });
      }

      // Create new user (plain text password stored in password_hash as requested)
      const newUser = await User.create({ username, email, password });
      res.status(201).json({
        message: "Đăng ký tài khoản thành công!",
        user: newUser
      });
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi đăng ký." });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." });
      }

      const user = await User.findByUsername(username);
      if (!user || user.password_hash !== password) {
        return res.status(400).json({ error: "Tên đăng nhập hoặc mật khẩu không chính xác." });
      }

      if (!user.is_active) {
        return res.status(400).json({ error: "Tài khoản của bạn đã bị khóa." });
      }

      res.status(200).json({
        message: "Đăng nhập thành công!",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi đăng nhập." });
    }
  },

  requestReset: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Vui lòng nhập email." });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản với email này." });
      }

      res.status(200).json({
        message: "Xác thực email thành công. Vui lòng nhập mật khẩu mới.",
        email: user.email
      });
    } catch (error) {
      console.error("Lỗi yêu cầu reset mật khẩu:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi tìm kiếm email." });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ email và mật khẩu mới." });
      }

      const updatedUser = await User.updatePasswordByEmail(email, newPassword);
      if (!updatedUser) {
        return res.status(400).json({ error: "Đặt lại mật khẩu thất bại. Email không chính xác." });
      }

      res.status(200).json({
        message: "Đặt lại mật khẩu thành công!"
      });
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi đặt lại mật khẩu." });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin cá nhân:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi lấy thông tin cá nhân." });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password } = req.body;

      if (!username || !email) {
        return res.status(400).json({ error: "Tên đăng nhập và email không được để trống." });
      }

      const currentUser = await User.findById(id);
      if (!currentUser) {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }

      if (username !== currentUser.username) {
        const dupUsername = await User.findByUsernameExcludeId(username, id);
        if (dupUsername) {
          return res.status(400).json({ error: "Tên đăng nhập đã được sử dụng bởi tài khoản khác." });
        }
      }

      if (email !== currentUser.email) {
        const dupEmail = await User.findByEmailExcludeId(email, id);
        if (dupEmail) {
          return res.status(400).json({ error: "Email đã được sử dụng bởi tài khoản khác." });
        }
      }

      let targetPassword = currentUser.password_hash;
      if (password) {
        if (password === currentUser.password_hash) {
          return res.status(400).json({ error: "Mật khẩu mới phải khác mật khẩu cũ." });
        }
        targetPassword = password;
      }

      const updatedUser = await User.updateProfile(id, {
        username,
        email,
        password: targetPassword
      });

      res.status(200).json({
        message: "Cập nhật thông tin cá nhân thành công!",
        user: updatedUser
      });
    } catch (error) {
      console.error("Lỗi cập nhật thông tin cá nhân:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi cập nhật thông tin cá nhân." });
    }
  }
};

module.exports = authController;
