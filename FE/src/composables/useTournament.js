import { ref } from 'vue'

export function useTournament() {
  const tournaments = ref([])
  const currentTournament = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const successMessage = ref(null)

  const API_URL = 'http://localhost:3000/api/tournaments'

  const clearMessages = () => {
    error.value = null
    successMessage.value = null
  }

  const fetchTournaments = async () => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Không thể tải danh sách giải đấu')
      tournaments.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchTournamentById = async (id) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`)
      if (!response.ok) throw new Error('Không tìm thấy giải đấu')
      currentTournament.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createTournament = async (tournamentData) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi tạo giải đấu')
      successMessage.value = 'Tạo giải đấu thành công'
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTournament = async (id, tournamentData) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi cập nhật giải đấu')
      successMessage.value = 'Cập nhật giải đấu thành công'
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTournament = async (id) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi xóa giải đấu')
      successMessage.value = 'Xóa giải đấu thành công'
      tournaments.value = tournaments.value.filter(t => t.id !== id)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tournaments,
    currentTournament,
    loading,
    error,
    successMessage,
    fetchTournaments,
    fetchTournamentById,
    createTournament,
    updateTournament,
    deleteTournament,
    clearMessages
  }
}
