import Auth from './auth.js';

const API_BASE_URL = window.localStorage.getItem('API_BASE_URL') || 
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : 'https://api.dkgroup.io.vn/api');

const API = {
  // Generic request handler
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }

    const config = {
      ...options,
      headers,
      ...(body !== undefined ? { body } : {})
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401 || response.status === 403) {
        const isAuthRoute = endpoint.startsWith('/auth/login') || 
                            endpoint.startsWith('/auth/register') || 
                            endpoint.startsWith('/auth/forgot-password') || 
                            endpoint.startsWith('/auth/reset-password');
        if (!isAuthRoute) {
          Auth.logout();
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    async login(usernameOrEmail, password) {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password })
      });
    },
    async register(username, email, password) {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
    },
    async getProfile() {
      return API.request('/auth/me');
    },
    async changePassword(oldPassword, newPassword) {
      return API.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
    },
    async registerPlayer(data) {
      return API.request('/auth/register-player', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async getPlayerProfile() {
      return API.request('/auth/player-profile');
    },
    async getPlayerCount() {
      return API.request('/auth/players/count');
    },
    async forgotPassword(email) {
      return API.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    async resetPassword(token, newPassword) {
      return API.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      });
    }
  },

  // Tournament endpoints
  tournaments: {
    async list() {
      return API.request('/tournaments');
    },
    async get(id) {
      return API.request(`/tournaments/${id}`);
    },
    async getActive() {
      return API.request('/auth/tournaments/active');
    },
    async getStandings(id) {
      return API.request(`/tournaments/${id}/standings`);
    },
    async getMatches(id) {
      return API.request(`/tournaments/${id}/matches`);
    },
    async getTeams(id) {
      return API.request(`/tournaments/${id}/teams`);
    }
  },

  // Match endpoints
  matches: {
    async list(filters = {}) {
      const queryParams = new URLSearchParams(filters).toString();
      return API.request(`/matches?${queryParams}`);
    },
    async get(id) {
      return API.request(`/matches/${id}`);
    },
    async getGames(matchId) {
      return API.request(`/matches/${matchId}/games`);
    }
  },

  // Team endpoints
  teams: {
    async list() {
      return API.request('/teams');
    },
    async get(id) {
      return API.request(`/teams/${id}`);
    }
  },

  // Player endpoints
  players: {
    async list() {
      return API.request('/players');
    },
    async get(id) {
      return API.request(`/players/${id}`);
    },
    async rate(playerId, score) {
      return API.request(`/players/${playerId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ score })
      });
    }
  },

  // Live Draft Board
  draft: {
    async getStatus(tournamentId) {
      return API.request(`/tournaments/${tournamentId}/draft/status`);
    },
    async makePick(tournamentId, teamId, playerId) {
      return API.request(`/tournaments/${tournamentId}/draft/pick`, {
        method: 'POST',
        body: JSON.stringify({ teamId, playerId })
      });
    }
  },

  // Admin endpoints
  admin: {
    // Configs
    async getConfigs() {
      return API.request('/admin/configs');
    },
    async updateConfig(key, value) {
      return API.request(`/admin/configs/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value })
      });
    },
    // Tournaments
    async createTournament(data) {
      return API.request('/admin/tournaments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async updateTournament(id, data) {
      return API.request(`/admin/tournaments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    // Matches
    async createMatch(data) {
      return API.request('/admin/matches', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async updateMatch(id, data) {
      return API.request(`/admin/matches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    async updateMatchGame(matchId, gameId, data) {
      return API.request(`/admin/matches/${matchId}/games/${gameId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    // Teams & players management
    async createTeam(data) {
      return API.request('/admin/teams', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async updatePlayerStatus(playerId, data) {
      return API.request(`/admin/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  },

  // Auction endpoints
  auction: {
    async listSessions() {
      return API.request('/auction/sessions');
    },
    async getState(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/state`);
    },
    async createSession(data) {
      return API.request('/auction/sessions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async getSession(sessionId) {
      return API.request(`/auction/sessions/${sessionId}`);
    },
    async setupSession(sessionId, data) {
      return API.request(`/auction/sessions/${sessionId}/setup`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async releaseSession(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/release`, {
        method: 'POST'
      });
    },
    async startSession(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/start`, {
        method: 'POST'
      });
    },
    async pauseSession(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/pause`, {
        method: 'POST'
      });
    },
    async resumeSession(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/resume`, {
        method: 'POST'
      });
    },
    async resetSession(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/reset`, {
        method: 'POST'
      });
    },
    async manualSell(sessionId, data) {
      return API.request(`/auction/sessions/${sessionId}/manual-sell`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async forceSkipRound(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/force-skip`, {
        method: 'POST'
      });
    },
    async forcePassTeam(sessionId, data) {
      return API.request(`/auction/sessions/${sessionId}/force-pass`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async rollbackLastRound(sessionId) {
      return API.request(`/auction/sessions/${sessionId}/rollback`, {
        method: 'POST'
      });
    },
    async getAvailablePlayers() {
      return API.request('/auction/players');
    },
    async getTeamsForSetup() {
      return API.request('/auction/teams');
    }
  },

  // Support ticket endpoints
  support: {
    async list() {
      return API.request('/support/tickets');
    },
    async create(title, message) {
      return API.request('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ title, message })
      });
    },
    async getMessages(ticketId) {
      return API.request(`/support/tickets/${ticketId}/messages`);
    },
    async sendMessage(ticketId, message) {
      return API.request(`/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    async adminList() {
      return API.request('/support/admin/tickets');
    },
    async close(ticketId) {
      return API.request(`/support/tickets/${ticketId}/close`, {
        method: 'PUT'
      });
    }
  },
  
  navbar: {
    async getConfig() {
      return API.request('/auth/navbar-config');
    },
    async updateConfig(value) {
      return API.request('/auth/navbar-config', {
        method: 'PUT',
        body: JSON.stringify({ value })
      });
    }
  }
};

export default API;
