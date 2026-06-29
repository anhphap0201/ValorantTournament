// Authentication Helper Functions in ES Modules
const Auth = {
  // Save auth response to storage
  login(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear storage
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // we will use vue-router, but hard redirects are also okay as fallback. For Vue router, we can do it inside pages.
  },

  // Check if token exists
  isLoggedIn() {
    return localStorage.getItem('token') !== null;
  },

  // Get current user object
  getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  // Check user role
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  isCaptain() {
    const user = this.getUser();
    return user && (user.role === 'captain' || user.role === 'admin');
  }
};

export default Auth;
