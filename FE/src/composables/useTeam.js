import { ref } from 'vue'

export function useTeam() {
  const teams = ref([])
  const currentTeam = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const successMessage = ref(null)

  const API_URL = 'http://localhost:3000/api/teams'

  const clearMessages = () => {
    error.value = null
    successMessage.value = null
  }

  const fetchTeams = async (tournamentId = null) => {
    loading.value = true
    clearMessages()
    try {
      let url = API_URL
      if (tournamentId) {
        url += `?tournament_id=${tournamentId}`
      }
      const response = await fetch(url)
      if (!response.ok) throw new Error('Không thể tải danh sách đội tuyển')
      teams.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchTeamById = async (id) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`)
      if (!response.ok) throw new Error('Không tìm thấy đội tuyển')
      currentTeam.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createTeam = async (teamData) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi tạo đội tuyển')
      successMessage.value = 'Tạo đội tuyển thành công'
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTeam = async (id, teamData) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi cập nhật đội tuyển')
      successMessage.value = 'Cập nhật đội tuyển thành công'
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTeam = async (id) => {
    loading.value = true
    clearMessages()
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Lỗi khi xóa đội tuyển')
      successMessage.value = 'Xóa đội tuyển thành công'
      teams.value = teams.value.filter(t => t.id !== id)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    teams,
    currentTeam,
    loading,
    error,
    successMessage,
    fetchTeams,
    fetchTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    clearMessages
  }
}
