import { ref } from 'vue'

export function usePlayer() {
  const players = ref([])
  const currentPlayer = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const successMessage = ref(null)

  const API_URL = 'http://localhost:3000/api/players'

  const clearMessages = () => {
    error.value = null
    successMessage.value = null
  }

  const fetchPlayers = async () => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Không thể tải danh sách tuyển thủ')
      players.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchPlayerById = async (id) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`)
      if (!response.ok) throw new Error('Không tìm thấy tuyển thủ')
      currentPlayer.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createPlayer = async (playerData) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi thêm tuyển thủ')
      successMessage.value = 'Thêm tuyển thủ thành công'
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlayer = async (id, playerData) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi cập nhật tuyển thủ')
      successMessage.value = 'Cập nhật tuyển thủ thành công'
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePlayer = async (id) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi xóa tuyển thủ')
      successMessage.value = 'Xóa tuyển thủ thành công'
      players.value = players.value.filter(p => p.id !== id)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerTeam = async (teamData) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/register-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi đăng ký đội tuyển')
      successMessage.value = 'Đăng ký đội tuyển thành công'
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    players,
    currentPlayer,
    loading,
    error,
    successMessage,
    fetchPlayers,
    fetchPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer,
    registerTeam,
    clearMessages
  }
}
