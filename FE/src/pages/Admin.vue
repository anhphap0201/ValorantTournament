<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTournament } from '../composables/useTournament.js'
import { useTeam } from '../composables/useTeam.js'

const { 
  tournaments, 
  loading, 
  error, 
  successMessage, 
  fetchTournaments, 
  createTournament, 
  updateTournament, 
  deleteTournament, 
  clearMessages 
} = useTournament()

const router = useRouter()
const isAdmin = ref(false)

// Sidebar states
const isSidebarCollapsed = ref(false)
const currentTab = ref('tournaments') // tabs: tournaments, players, teams, users, settings

// Modal states for tournament
const showCreateModal = ref(false)
const isEditing = ref(false)
const selectedTournamentId = ref(null)

// Form states for tournament
const form = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  format: 'Double Elimination',
  maxTeams: 8,
  prizePool: '',
  status: 'upcoming'
})

const formatList = ['Single Elimination', 'Double Elimination', 'Round Robin', 'Group Stage + Bracket']
const statusList = [
  { value: 'upcoming', label: 'Sắp diễn ra', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'register', label: 'Mở đăng ký', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' },
  { value: 'running', label: 'Đang đấu', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'finished', label: 'Kết thúc', color: 'bg-white/5 text-gray-400 border-white/10' }
]

// Stats
const stats = computed(() => {
  return {
    total: tournaments.value.length,
    register: tournaments.value.filter(t => t.status === 'register').length,
    running: tournaments.value.filter(t => t.status === 'running').length,
    finished: tournaments.value.filter(t => t.status === 'finished').length
  }
})

// Search & Filter States
const searchQuery = ref('')
const statusFilter = ref('all')
const formatFilter = ref('all')

const filteredTournaments = computed(() => {
  return tournaments.value.filter(t => {
    const matchesSearch = !searchQuery.value.trim() || 
      t.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesStatus = statusFilter.value === 'all' || t.status === statusFilter.value
    const matchesFormat = formatFilter.value === 'all' || t.format === formatFilter.value
    
    return matchesSearch && matchesStatus && matchesFormat
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  formatFilter.value = 'all'
}

// User Management States
const users = ref([])
const usersLoading = ref(false)
const usersError = ref(null)
const usersSuccess = ref(null)
const showUserModal = ref(false)
const isEditingUser = ref(false)
const selectedUserId = ref(null)

const userForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'guest'
})

const checkAdminAccess = () => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    isAdmin.value = false
    return false
  }
  const userObj = JSON.parse(storedUser)
  if (userObj.role !== 'admin') {
    isAdmin.value = false
    return false
  }
  isAdmin.value = true
  return true
}

const fetchUsers = async () => {
  usersLoading.value = true
  usersError.value = null
  try {
    const response = await fetch('http://localhost:3000/api/users')
    if (!response.ok) {
      throw new Error('Không thể tải danh sách tài khoản.')
    }
    const data = await response.json()
    users.value = data
  } catch (err) {
    usersError.value = err.message
  } finally {
    usersLoading.value = false
  }
}

const openCreateUserModal = () => {
  isEditingUser.value = false
  selectedUserId.value = null
  userForm.value = {
    username: '',
    email: '',
    password: '',
    role: 'guest'
  }
  usersError.value = null
  usersSuccess.value = null
  showUserModal.value = true
}

const openEditUserModal = (u) => {
  isEditingUser.value = true
  selectedUserId.value = u.id
  userForm.value = {
    username: u.username,
    email: u.email,
    password: '',
    role: u.role || 'guest'
  }
  usersError.value = null
  usersSuccess.value = null
  showUserModal.value = true
}

const handleSubmitUser = async () => {
  usersError.value = null
  usersSuccess.value = null
  
  if (!userForm.value.username.trim() || !userForm.value.email.trim()) {
    usersError.value = 'Vui lòng điền đầy đủ các thông tin bắt buộc.'
    return
  }

  if (!isEditingUser.value && !userForm.value.password.trim()) {
    usersError.value = 'Mật khẩu là bắt buộc khi thêm mới.'
    return
  }

  try {
    const url = isEditingUser.value 
      ? `http://localhost:3000/api/users/${selectedUserId.value}`
      : 'http://localhost:3000/api/users'
    const method = isEditingUser.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userForm.value)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || (isEditingUser.value ? 'Cập nhật tài khoản thất bại.' : 'Thêm tài khoản thất bại.'))
    }

    usersSuccess.value = isEditingUser.value ? 'Cập nhật tài khoản thành công!' : 'Thêm tài khoản thành công!'
    showUserModal.value = false
    userForm.value = {
      username: '',
      email: '',
      password: '',
      role: 'guest'
    }
    await fetchUsers()
  } catch (err) {
    usersError.value = err.message
  }
}

const handleDeleteUser = async (userId, usernameToDelete) => {
  if (usernameToDelete === 'admin') {
    alert('Không thể xóa tài khoản admin gốc.')
    return
  }

  if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${usernameToDelete}"?`)) {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Xóa tài khoản thất bại.')
      }
      alert('Xóa tài khoản thành công!')
      await fetchUsers()
    } catch (err) {
      alert(err.message)
    }
  }
}

const changeUserRole = async (userId, newRole, username) => {
  if (username === 'admin') {
    alert('Không thể thay đổi vai trò của tài khoản quản trị gốc.')
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Cập nhật vai trò thất bại.')
    }
    alert(`Đã cập nhật vai trò của "${username}" thành công!`)
  } catch (err) {
    alert(err.message)
    await fetchUsers()
  }
}

// Lifecycle
onMounted(async () => {
  const isAuth = checkAdminAccess()
  if (isAuth) {
    await fetchTournaments()
    await fetchUsers()
    await fetchTeams()
    await fetchPlayers()
  }
})

// Methods
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const openCreateModal = () => {
  isEditing.value = false
  selectedTournamentId.value = null
  form.value = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    format: 'Double Elimination',
    maxTeams: 8,
    prizePool: '',
    status: 'upcoming'
  }
  clearMessages()
  showCreateModal.value = true
}

const openEditModal = (t) => {
  isEditing.value = true
  selectedTournamentId.value = t.id
  
  const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const pad = (num) => String(num).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  form.value = {
    name: t.name,
    description: t.description || '',
    startDate: formatDateTime(t.start_date),
    endDate: formatDateTime(t.end_date),
    format: t.format || 'Double Elimination',
    maxTeams: t.max_teams || 8,
    prizePool: t.prize_pool || '',
    status: t.status || 'upcoming'
  }
  clearMessages()
  showCreateModal.value = true
}

const handleFormSubmit = async () => {
  if (!form.value.name.trim()) return

  const payload = {
    name: form.value.name,
    description: form.value.description,
    startDate: form.value.startDate || null,
    endDate: form.value.endDate || null,
    format: form.value.format,
    maxTeams: parseInt(form.value.maxTeams) || null,
    prizePool: form.value.prizePool,
    status: form.value.status
  }

  try {
    if (isEditing.value) {
      await updateTournament(selectedTournamentId.value, payload)
    } else {
      await createTournament(payload)
    }
    showCreateModal.value = false
    await fetchTournaments()
  } catch (err) {
  }
}

const handleDelete = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa giải đấu này? Thao tác này không thể hoàn tác.")) {
    try {
      await deleteTournament(id)
      await fetchTournaments()
    } catch (err) {
      alert("Xóa giải đấu thất bại: " + err.message)
    }
  }
}

const getStatusBadge = (statusValue) => {
  const st = statusList.find(s => s.value === statusValue)
  return st || { label: statusValue, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Team management state & methods
const {
  teams: adminTeams,
  loading: teamsLoading,
  error: teamsError,
  successMessage: teamsSuccess,
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  clearMessages: clearTeamMessages
} = useTeam()

// Modal states for team
const showTeamModal = ref(false)
const isEditingTeam = ref(false)
const selectedTeamId = ref(null)

// Form states for team
const teamForm = ref({
  name: '',
  logo: '',
  tournamentId: '',
  tokensRemaining: 1000
})

const openCreateTeamModal = () => {
  isEditingTeam.value = false
  selectedTeamId.value = null
  teamForm.value = {
    name: '',
    logo: '',
    tournamentId: tournaments.value.length > 0 ? tournaments.value[0].id : '',
    tokensRemaining: 1000
  }
  clearTeamMessages()
  showTeamModal.value = true
}

const openEditTeamModal = (team) => {
  isEditingTeam.value = true
  selectedTeamId.value = team.id
  teamForm.value = {
    name: team.name,
    logo: team.logo || '',
    tournamentId: team.tournament_id || '',
    tokensRemaining: team.tokens_remaining !== undefined ? team.tokens_remaining : 1000
  }
  clearTeamMessages()
  showTeamModal.value = true
}

const handleTeamFormSubmit = async () => {
  if (!teamForm.value.name.trim()) return

  const payload = {
    name: teamForm.value.name,
    logo: teamForm.value.logo || null,
    tournamentId: teamForm.value.tournamentId || null,
    tokensRemaining: parseInt(teamForm.value.tokensRemaining) !== undefined ? parseInt(teamForm.value.tokensRemaining) : 1000
  }

  try {
    if (isEditingTeam.value) {
      await updateTeam(selectedTeamId.value, payload)
    } else {
      await createTeam(payload)
    }
    showTeamModal.value = false
    await fetchTeams()
  } catch (err) {
    alert(err.message)
  }
}

const handleDeleteTeam = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa đội tuyển này? Thao tác này không thể hoàn tác.")) {
    try {
      await deleteTeam(id)
      await fetchTeams()
    } catch (err) {
      alert("Xóa đội tuyển thất bại: " + err.message)
    }
  }
}

const getTournamentName = (tournamentId) => {
  const t = tournaments.value.find(t => t.id === tournamentId)
  return t ? t.name : 'Chưa gán'
}

// Player management state & methods
import { usePlayer } from '../composables/usePlayer.js'

const {
  players: adminPlayers,
  loading: playersLoading,
  error: playersError,
  successMessage: playersSuccess,
  fetchPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer: deletePlayerApi,
  clearMessages: clearPlayerMessages
} = usePlayer()

// Modal states for player
const showPlayerModal = ref(false)
const isEditingPlayer = ref(false)
const selectedPlayerId = ref(null)

const playerForm = ref({
  riotId: '',
  nickname: '',
  fullName: '',
  gender: 'Male',
  facebookLink: '',
  favoriteAgent: '',
  strengths: '',
  avatar: '',
  rankName: 'Gold 1',
  preferredRoles: [],
  teamId: '',
  isCaptain: false
})

const rolesList = ['Duelist', 'Sentinel', 'Initiator', 'Controller']
const rankList = [
  'Iron 1', 'Iron 2', 'Iron 3',
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3',
  'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
  'Immortal 1', 'Immortal 2', 'Immortal 3',
  'Radiant'
]

const agentList = [
  'Astra', 'Breach', 'Brimstone', 'Chamber', 'Clove', 'Cypher', 'Deadlock',
  'Fade', 'Gekko', 'Harbor', 'Iso', 'Jett', 'KAY/O', 'Killjoy',
  'Neon', 'Omen', 'Phoenix', 'Raze', 'Reyna', 'Sage', 'Skye', 'Sova',
  'Viper', 'Vyse', 'Yoru'
].sort()

const openCreatePlayerModal = () => {
  isEditingPlayer.value = false
  selectedPlayerId.value = null
  playerForm.value = {
    riotId: '',
    nickname: '',
    fullName: '',
    gender: 'Male',
    facebookLink: '',
    favoriteAgent: agentList[0] || 'Jett',
    strengths: '',
    avatar: '',
    rankName: 'Gold 1',
    preferredRoles: [],
    teamId: '',
    isCaptain: false
  }
  clearPlayerMessages()
  showPlayerModal.value = true
}

const openEditPlayerModal = (p) => {
  isEditingPlayer.value = true
  selectedPlayerId.value = p.id
  
  let parsedRoles = []
  if (p.preferred_role) {
    parsedRoles = typeof p.preferred_role === 'string'
      ? p.preferred_role.split(',').map(r => r.trim())
      : Array.isArray(p.preferred_role)
        ? p.preferred_role
        : []
  }

  playerForm.value = {
    riotId: p.riot_id || '',
    nickname: p.nickname || '',
    fullName: p.full_name || '',
    gender: p.gender || 'Male',
    facebookLink: p.facebook_link || '',
    favoriteAgent: p.favorite_agent || '',
    strengths: p.strengths || '',
    avatar: p.avatar || '',
    rankName: p.rank_name || 'Gold 1',
    preferredRoles: parsedRoles,
    teamId: p.team_id || '',
    isCaptain: p.is_captain || false
  }
  clearPlayerMessages()
  showPlayerModal.value = true
}

const handlePlayerFormSubmit = async () => {
  if (!playerForm.value.nickname.trim()) return

  const payload = {
    riotId: playerForm.value.riotId,
    nickname: playerForm.value.nickname,
    fullName: playerForm.value.fullName,
    gender: playerForm.value.gender,
    facebookLink: playerForm.value.facebookLink,
    favoriteAgent: playerForm.value.favoriteAgent,
    strengths: playerForm.value.strengths,
    avatar: playerForm.value.avatar || null,
    rankName: playerForm.value.rankName,
    preferredRoles: playerForm.value.preferredRoles,
    teamId: playerForm.value.teamId ? parseInt(playerForm.value.teamId) : null,
    isCaptain: playerForm.value.isCaptain
  }

  try {
    if (isEditingPlayer.value) {
      await updatePlayer(selectedPlayerId.value, payload)
    } else {
      await createPlayer(payload)
    }
    showPlayerModal.value = false
    await fetchPlayers()
  } catch (err) {
    alert(err.message)
  }
}

const handleDeletePlayer = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa tuyển thủ này? Thao tác này không thể hoàn tác.")) {
    try {
      await deletePlayerApi(id)
      await fetchPlayers()
    } catch (err) {
      alert("Xóa tuyển thủ thất bại: " + err.message)
    }
  }
}

const getTeamNameForPlayer = (teamId) => {
  const t = adminTeams.value.find(team => team.id === teamId)
  return t ? t.name : 'Tự do'
}

// Player search and filtering states
const playerSearchQuery = ref('')
const playerRankFilter = ref('all')
const playerRoleFilter = ref('all')
const playerTeamFilter = ref('all')

const filteredPlayers = computed(() => {
  return adminPlayers.value.filter(p => {
    const matchesSearch = !playerSearchQuery.value.trim() ||
      p.nickname.toLowerCase().includes(playerSearchQuery.value.toLowerCase()) ||
      p.riot_id.toLowerCase().includes(playerSearchQuery.value.toLowerCase()) ||
      (p.full_name && p.full_name.toLowerCase().includes(playerSearchQuery.value.toLowerCase()))
    
    const matchesRank = playerRankFilter.value === 'all' || p.rank_name === playerRankFilter.value
    
    const matchesRole = playerRoleFilter.value === 'all' || 
      (p.preferred_role && p.preferred_role.toLowerCase().includes(playerRoleFilter.value.toLowerCase()))
      
    const matchesTeam = playerTeamFilter.value === 'all' || 
      (playerTeamFilter.value === 'free' ? !p.team_id : p.team_id === parseInt(playerTeamFilter.value))

    return matchesSearch && matchesRank && matchesRole && matchesTeam
  })
})

const resetPlayerFilters = () => {
  playerSearchQuery.value = ''
  playerRankFilter.value = 'all'
  playerRoleFilter.value = 'all'
  playerTeamFilter.value = 'all'
}
</script>

<template>
  <div v-if="isAdmin" class="min-h-screen bg-[#0b0e14] text-white flex">
    
    <!-- Collapsible Sidebar -->
    <aside 
      class="bg-[#0f131a] border-r border-white/5 flex flex-col transition-all duration-300 select-none shrink-0"
      :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
    >
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-white/5">
        <span 
          v-if="!isSidebarCollapsed" 
          class="text-lg font-black uppercase tracking-widest text-[#ff4655] font-valorant animate-fadeIn"
        >
          ADMIN PANEL
        </span>
        <button 
          @click="toggleSidebar"
          class="text-gray-400 hover:text-white transition p-1.5 rounded bg-white/5 hover:bg-white/10 mx-auto"
        >
          <i :class="isSidebarCollapsed ? 'fas fa-indent' : 'fas fa-outdent'"></i>
        </button>
      </div>

      <!-- Menu Items -->
      <nav class="flex-grow py-6 px-3 space-y-1">
        <!-- Tournaments Tab -->
        <button 
          @click="currentTab = 'tournaments'"
          class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition duration-200 font-bold text-sm text-left"
          :class="currentTab === 'tournaments' ? 'bg-[#ff4655] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <i class="fas fa-trophy text-lg w-5 text-center"></i>
          <span v-if="!isSidebarCollapsed" class="animate-fadeIn">Giải đấu</span>
        </button>

        <!-- Players Tab -->
        <button 
          @click="currentTab = 'players'"
          class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition duration-200 font-bold text-sm text-left"
          :class="currentTab === 'players' ? 'bg-[#ff4655] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <i class="fas fa-users text-lg w-5 text-center"></i>
          <span v-if="!isSidebarCollapsed" class="animate-fadeIn">Tuyển thủ</span>
        </button>

        <!-- Teams Tab -->
        <button 
          @click="currentTab = 'teams'"
          class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition duration-200 font-bold text-sm text-left"
          :class="currentTab === 'teams' ? 'bg-[#ff4655] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <i class="fas fa-shield-alt text-lg w-5 text-center"></i>
          <span v-if="!isSidebarCollapsed" class="animate-fadeIn">Đội tuyển</span>
        </button>

        <!-- Users Tab -->
        <button 
          @click="currentTab = 'users'"
          class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition duration-200 font-bold text-sm text-left"
          :class="currentTab === 'users' ? 'bg-[#ff4655] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <i class="fas fa-user-cog text-lg w-5 text-center"></i>
          <span v-if="!isSidebarCollapsed" class="animate-fadeIn">Tài khoản</span>
        </button>

        <!-- Settings Tab -->
        <button 
          @click="currentTab = 'settings'"
          class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition duration-200 font-bold text-sm text-left"
          :class="currentTab === 'settings' ? 'bg-[#ff4655] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <i class="fas fa-sliders-h text-lg w-5 text-center"></i>
          <span v-if="!isSidebarCollapsed" class="animate-fadeIn">Cài đặt</span>
        </button>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-white/5 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
        <span v-if="!isSidebarCollapsed">v1.0.0 &copy; 2026</span>
        <span v-else>26</span>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow p-8 overflow-y-auto">
      
      <!-- Section: Tournaments Management -->
      <div v-if="currentTab === 'tournaments'" class="space-y-8 text-left animate-fadeIn">

        <!-- Stats Grid -->
        <div class="grid hidden grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total -->
          <div class="bg-[#0f131a]/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Tổng giải đấu</p>
              <p class="text-2xl font-black mt-2 font-valorant text-white">{{ stats.total }}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
              <i class="fas fa-trophy text-lg"></i>
            </div>
          </div>

          <!-- Open Register -->
          <div class="bg-[#0f131a]/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Mở đăng ký</p>
              <p class="text-2xl font-black mt-2 font-valorant text-emerald-400">{{ stats.register }}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <i class="fas fa-door-open text-lg"></i>
            </div>
          </div>

          <!-- Ongoing -->
          <div class="bg-[#0f131a]/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Đang diễn ra</p>
              <p class="text-2xl font-black mt-2 font-valorant text-amber-400">{{ stats.running }}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <i class="fas fa-gamepad text-lg"></i>
            </div>
          </div>

          <!-- Finished -->
          <div class="bg-[#0f131a]/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Đã hoàn thành</p>
              <p class="text-2xl font-black mt-2 font-valorant text-blue-400">{{ stats.finished }}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <i class="fas fa-flag-checkered text-lg"></i>
            </div>
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <div class="flex flex-col md:flex-row gap-4 bg-[#0f131a]/60 border border-white/5 p-4 rounded-2xl">
          <!-- Search input -->
          <div class="relative flex-grow">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Tìm kiếm giải đấu theo tên hoặc mô tả..." 
              class="w-full bg-[#0b0e14] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-semibold"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

          </div>
          
          <!-- Filter Status -->
          <div class="w-full md:w-48 shrink-0">
            <select 
              v-model="statusFilter"
              class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="register">Mở đăng ký</option>
              <option value="running">Đang đấu</option>
              <option value="finished">Kết thúc</option>
            </select>
          </div>

          <!-- Filter Format -->
          <div class="w-full md:w-48 shrink-0">
            <select 
              v-model="formatFilter"
              class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
            >
              <option value="all">Tất cả thể thức</option>
              <option v-for="f in formatList" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>

          <!-- Create Button -->
          <button 
            @click="openCreateModal"
            class="bg-[#ff4655] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
          >
            <i class="fas fa-plus"></i> Tạo Giải Đấu Mới
          </button>
        </div>

        <!-- Table Card -->
        <div class="bg-[#0f131a]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          <!-- Loader -->
          <div v-if="loading" class="p-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 rounded-full border-2 border-dashed border-[#ff4655] animate-spin"></div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Đang tải giải đấu...</span>
          </div>

          <!-- Empty State (No Tournaments at all) -->
          <div v-else-if="tournaments.length === 0" class="p-20 text-center text-gray-500 flex flex-col items-center justify-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mb-2">
              <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
              </svg>
            </div>
            <p class="font-bold text-lg text-white">Chưa có giải đấu nào</p>
            <p class="text-sm max-w-sm">Hiện tại chưa có giải đấu nào trong hệ thống. Nhấn nút "Tạo Giải Đấu Mới" phía trên để khởi chạy mùa giải đầu tiên.</p>
            <button @click="openCreateModal" class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition text-[#ff4655] mt-2">
              Tạo giải đấu ngay
            </button>
          </div>

          <!-- Empty State (No Search Match) -->
          <div v-else-if="filteredTournaments.length === 0" class="p-20 text-center text-gray-500 flex flex-col items-center justify-center gap-4 animate-fadeIn">
            <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mb-2">
              <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10h4"></path>
              </svg>
            </div>
            <p class="font-bold text-lg text-white">Không tìm thấy giải đấu phù hợp</p>
            <p class="text-sm max-w-sm">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc của bạn.</p>
            <button @click="resetFilters" class="px-4 py-2 bg-white/5 hover:bg-[#ff4655]/10 rounded-lg text-xs font-bold transition text-[#ff4655] mt-2">
              Đặt lại bộ lọc
            </button>
          </div>

          <!-- Table Content -->
          <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                  <thead>
                      <tr class="border-b border-white/5 bg-white/2 text-gray-400 text-xs font-bold uppercase tracking-wider select-none">
                          <th class="py-4.5 px-6 text-center">Thao tác</th>
                          <th class="py-4.5 px-6">ID</th>
                          <th class="py-4.5 px-6">Tên Giải đấu</th>
                          <th class="py-4.5 px-6">Thể thức</th>
                          <th class="py-4.5 px-6">Đội tối đa</th>
                          <th class="py-4.5 px-6">Giải thưởng</th>
                          <th class="py-4.5 px-6">Thời gian</th>
                          <th class="py-4.5 px-6 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5 text-sm text-gray-300 font-semibold">
                        <tr 
                        v-for="t in filteredTournaments" 
                        :key="t.id"
                        class="hover:bg-white/2 transition duration-150"
                        >
                        <td class="py-2 px-6">
                          <div class="flex items-center justify-center gap-2">
                            <button 
                              @click="openEditModal(t)"
                              class="p-2 rounded-lg bg-white/5 hover:bg-[#ff4655]/10 text-gray-400 hover:text-[#ff4655] transition flex items-center justify-center"
                              title="Chỉnh sửa giải đấu"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button 
                              @click="handleDelete(t.id)"
                              class="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition flex items-center justify-center"
                              title="Xóa giải đấu"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                  <td class="py-4 px-6 text-gray-500 font-bold">#{{ t.id }}</td>
                  <td class="py-4 px-6">
                    <span class="text-white font-bold block text-base">{{ t.name }}</span>
                    <span class="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-xs">{{ t.description || 'Không có mô tả' }}</span>
                  </td>
                  <td class="py-4 px-6 font-bold text-gray-400">{{ t.format || 'Double Elimination' }}</td>
                  <td class="py-4 px-6 text-white font-bold">{{ t.max_teams || 8 }} Đội</td>
                  <td class="py-4 px-6 font-bold text-[#00f599]">{{ t.prize_pool || 'N/A' }}</td>
                  <td class="py-4 px-6 text-xs text-gray-400 leading-relaxed font-bold">
                    <span class="block">Bắt đầu: {{ formatDate(t.start_date) }}</span>
                    <span class="block text-[10px] text-gray-500">Kết thúc: {{ formatDate(t.end_date) }}</span>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <span 
                      class="px-3 py-1.5 rounded-full border text-xs font-bold inline-block"
                      :class="getStatusBadge(t.status).color"
                    >
                      {{ getStatusBadge(t.status).label }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Section: Players Management -->
      <div v-else-if="currentTab === 'players'" class="space-y-8 text-left animate-fadeIn">
        <!-- Header Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f131a]/60 border border-white/5 p-4 rounded-2xl">
          <div>
            <h3 class="text-xl font-bold font-valorant text-white tracking-wide">Quản lý Tuyển thủ</h3>
            <p class="text-xs text-gray-400 mt-1">Danh sách tất cả các tuyển thủ tham dự các giải đấu</p>
          </div>
          <button 
            @click="openCreatePlayerModal"
            class="bg-[#ff4655] hover:bg-[#ff5e6b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition font-bold cursor-pointer flex items-center gap-2"
          >
            <i class="fas fa-plus"></i> Thêm Tuyển Thủ Mới
          </button>
        </div>

        <!-- Search and Filter Bar -->
        <div class="flex flex-col md:flex-row gap-4 bg-[#0f131a]/60 border border-white/5 p-4 rounded-2xl">
          <!-- Search input -->
          <div class="relative flex-grow">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
            <input 
              v-model="playerSearchQuery"
              type="text" 
              placeholder="Tìm kiếm tuyển thủ theo nickname, Riot ID hoặc tên thật..." 
              class="w-full bg-[#0b0e14] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-semibold"
            />
            <button 
              v-if="playerSearchQuery" 
              @click="playerSearchQuery = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Filter Team -->
          <div class="w-full md:w-48 shrink-0">
            <select 
              v-model="playerTeamFilter"
              class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
            >
              <option value="all">Tất cả đội tuyển</option>
              <option value="free">Tự do</option>
              <option v-for="t in adminTeams" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>

          <!-- Filter Rank -->
          <div class="w-full md:w-48 shrink-0">
            <select 
              v-model="playerRankFilter"
              class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
            >
              <option value="all">Tất cả rank</option>
              <option v-for="rank in rankList" :key="rank" :value="rank">{{ rank }}</option>
            </select>
          </div>

          <!-- Filter Role -->
          <div class="w-full md:w-40 shrink-0">
            <select 
              v-model="playerRoleFilter"
              class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option v-for="role in rolesList" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>
        </div>

        <!-- Players Table -->
        <div class="bg-[#0f131a]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          <div v-if="playersLoading" class="p-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 rounded-full border-2 border-dashed border-[#ff4655] animate-spin"></div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Đang tải danh sách tuyển thủ...</span>
          </div>

          <div v-else-if="adminPlayers.length === 0" class="p-20 text-center text-gray-500">
            Chưa có tuyển thủ nào được đăng ký.
          </div>

          <div v-else-if="filteredPlayers.length === 0" class="p-20 text-center text-gray-500 flex flex-col items-center justify-center gap-4">
            <p class="font-bold text-lg text-white">Không tìm thấy tuyển thủ phù hợp</p>
            <p class="text-sm max-w-sm">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc của bạn.</p>
            <button @click="resetPlayerFilters" class="px-4 py-2 bg-white/5 hover:bg-[#ff4655]/10 rounded-lg text-xs font-bold transition text-[#ff4655] mt-2">
              Đặt lại bộ lọc
            </button>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/5 bg-white/2 text-gray-400 text-xs font-bold uppercase tracking-wider select-none">
                  <th class="py-4.5 px-6 text-center">Thao tác</th>
                  <th class="py-4.5 px-6">ID</th>
                  <th class="py-4.5 px-6">Tuyển thủ</th>
                  <th class="py-4.5 px-6">Tên thật</th>
                  <th class="py-4.5 px-6">Peak Rank</th>
                  <th class="py-4.5 px-6">Agent tủ</th>
                  <th class="py-4.5 px-6">Đội tuyển</th>
                  <th class="py-4.5 px-6">Vai trò</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-sm text-gray-300 font-semibold">
                <tr 
                  v-for="p in filteredPlayers" 
                  :key="p.id"
                  class="hover:bg-white/2 transition duration-150"
                >
                  <td class="py-2 px-6">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="openEditPlayerModal(p)"
                        class="p-2 rounded-lg bg-white/5 hover:bg-[#ff4655]/10 text-gray-400 hover:text-[#ff4655] transition flex items-center justify-center cursor-pointer"
                        title="Chỉnh sửa tuyển thủ"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button 
                        @click="handleDeletePlayer(p.id)"
                        class="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition flex items-center justify-center cursor-pointer"
                        title="Xóa tuyển thủ"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-gray-500 font-bold">#{{ p.id }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs overflow-hidden shrink-0">
                        <img v-if="p.avatar" :src="p.avatar" class="w-full h-full object-cover" />
                        <i v-else class="fas fa-user text-sm text-gray-500"></i>
                      </div>
                      <div class="text-left">
                        <span class="text-white font-bold block text-sm">{{ p.nickname }}</span>
                        <span class="text-xs text-gray-500 font-mono leading-none">{{ p.riot_id }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-gray-300">{{ p.full_name || 'N/A' }}</td>
                  <td class="py-4 px-6 font-bold text-gray-400">{{ p.rank_name || 'Không rank' }}</td>
                  <td class="py-4 px-6 text-white font-bold">{{ p.favorite_agent || 'N/A' }}</td>
                  <td class="py-4 px-6 font-bold text-[#00f599]">{{ getTeamNameForPlayer(p.team_id) }}</td>
                  <td class="py-4 px-6">
                    <span 
                      v-if="p.is_captain"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold border inline-block bg-amber-500/10 text-amber-400 border-amber-500/20 select-none"
                    >
                      Đội trưởng
                    </span>
                    <span 
                      v-else
                      class="px-2.5 py-1 rounded-lg text-xs font-bold border inline-block bg-white/5 text-gray-400 border-white/10 select-none"
                    >
                      Thành viên
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Section: User Account Management -->
      <div v-else-if="currentTab === 'users'" class="space-y-8 text-left animate-fadeIn">
        
        <!-- Header Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f131a]/60 border border-white/5 p-4 rounded-2xl">
          <div>
            <h3 class="text-xl font-bold font-valorant text-white tracking-wide">Quản lý Tài khoản</h3>
            <p class="text-xs text-gray-400 mt-1">Danh sách tất cả các tài khoản người dùng đăng ký trên hệ thống</p>
          </div>
          <button 
            @click="openCreateUserModal"
            class="bg-[#ff4655] hover:bg-[#ff5e6b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition font-bold cursor-pointer flex items-center gap-2"
          >
            <i class="fas fa-user-plus"></i> Thêm Tài Khoản Mới
          </button>
        </div>

        <!-- Users Table -->
        <div class="bg-[#0f131a]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          <div v-if="usersLoading" class="p-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 rounded-full border-2 border-dashed border-[#ff4655] animate-spin"></div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Đang tải danh sách tài khoản...</span>
          </div>

          <div v-else-if="users.length === 0" class="p-20 text-center text-gray-500">
            Không có tài khoản nào.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/5 bg-white/2 text-gray-400 text-xs font-bold uppercase tracking-wider select-none">
                  <th class="py-4.5 px-6 text-center">Thao tác</th>
                  <th class="py-4.5 px-6">ID</th>
                  <th class="py-4.5 px-6">Tên đăng nhập</th>
                  <th class="py-4.5 px-6">Email</th>
                  <th class="py-4.5 px-6">Vai trò</th>
                  <th class="py-4.5 px-6">Ngày tạo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-sm text-gray-300 font-semibold">
                <tr 
                  v-for="u in users" 
                  :key="u.id"
                  class="hover:bg-white/2 transition duration-150"
                >
                  <td class="py-2 px-6">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="openEditUserModal(u)"
                        :disabled="u.username === 'admin'"
                        class="p-2 rounded-lg bg-white/5 hover:bg-[#ff4655]/10 text-gray-400 hover:text-[#ff4655] transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Chỉnh sửa tài khoản"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button 
                        @click="handleDeleteUser(u.id, u.username)"
                        :disabled="u.username === 'admin'"
                        class="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Xóa tài khoản"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-gray-500 font-bold">#{{ u.id }}</td>
                  <td class="py-4 px-6 text-white font-bold">{{ u.username }}</td>
                  <td class="py-4 px-6 text-gray-300">{{ u.email }}</td>
                  <td class="py-4 px-6">
                    <span 
                      class="px-2.5 py-1 rounded-lg text-xs font-bold border inline-block select-none"
                      :class="u.role === 'admin' ? 'bg-[#ff4655]/10 text-[#ff4655] border-[#ff4655]/20' : u.role === 'captain' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-gray-400 border-white/10'"
                    >
                      {{ u.role === 'admin' ? 'admin' : u.role === 'captain' ? 'cap' : 'khách' }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-xs text-gray-400 font-bold">
                    {{ formatDate(u.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Section: Teams Management -->
      <div v-else-if="currentTab === 'teams'" class="space-y-8 text-left animate-fadeIn">
        <!-- Header Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f131a]/60 border border-white/5 p-4 rounded-2xl">
          <div>
            <h3 class="text-xl font-bold font-valorant text-white tracking-wide">Quản lý Đội tuyển</h3>
            <p class="text-xs text-gray-400 mt-1">Danh sách và đội hình các đội tuyển tham dự giải đấu</p>
          </div>
          <button 
            @click="openCreateTeamModal"
            class="bg-[#ff4655] hover:bg-[#ff5e6b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition font-bold cursor-pointer flex items-center gap-2"
          >
            <i class="fas fa-plus"></i> Thêm Đội Tuyển Mới
          </button>
        </div>

        <!-- Teams Table -->
        <div class="bg-[#0f131a]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          <div v-if="teamsLoading" class="p-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 rounded-full border-2 border-dashed border-[#ff4655] animate-spin"></div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Đang tải danh sách đội tuyển...</span>
          </div>

          <div v-else-if="adminTeams.length === 0" class="p-20 text-center text-gray-500">
            Chưa có đội tuyển nào được tạo.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/5 bg-white/2 text-gray-400 text-xs font-bold uppercase tracking-wider select-none">
                  <th class="py-4.5 px-6 text-center">Thao tác</th>
                  <th class="py-4.5 px-6">ID</th>
                  <th class="py-4.5 px-6">Đội tuyển</th>
                  <th class="py-4.5 px-6">Giải đấu</th>
                  <th class="py-4.5 px-6">Koin còn lại</th>
                  <th class="py-4.5 px-6">Đội trưởng (Captain)</th>
                  <th class="py-4.5 px-6">Số thành viên</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-sm text-gray-300 font-semibold">
                <tr 
                  v-for="team in adminTeams" 
                  :key="team.id"
                  class="hover:bg-white/2 transition duration-150"
                >
                  <td class="py-2 px-6">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="openEditTeamModal(team)"
                        class="p-2 rounded-lg bg-white/5 hover:bg-[#ff4655]/10 text-gray-400 hover:text-[#ff4655] transition flex items-center justify-center cursor-pointer"
                        title="Chỉnh sửa đội tuyển"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button 
                        @click="handleDeleteTeam(team.id)"
                        class="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition flex items-center justify-center cursor-pointer"
                        title="Xóa đội tuyển"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-gray-500 font-bold">#{{ team.id }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500 overflow-hidden shrink-0">
                        <img v-if="team.logo" :src="team.logo" class="w-full h-full object-cover" />
                        <i v-else class="fas fa-shield-alt text-sm"></i>
                      </div>
                      <span class="text-white font-bold text-base">{{ team.name }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-gray-400 font-bold">
                    {{ getTournamentName(team.tournament_id) }}
                  </td>
                  <td class="py-4 px-6 text-[#fbbf24] font-bold font-valorant">
                    {{ team.tokens_remaining }} Koin
                  </td>
                  <td class="py-4 px-6">
                    <span v-if="team.captain" class="text-white font-bold">{{ team.captain.nickname }}</span>
                    <span v-else class="text-gray-500 text-xs italic">Chưa chọn</span>
                  </td>
                  <td class="py-4 px-6 text-white font-bold">
                    {{ team.members ? team.members.length : 0 }}/4
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Section Placeholder for Other Tabs -->
      <div v-else class="h-[80vh] flex flex-col items-center justify-center text-center text-gray-500">
        <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <i class="fas fa-tools text-2xl text-gray-400"></i>
        </div>
        <h2 class="text-xl font-bold text-white uppercase tracking-wider">Tính năng đang được phát triển</h2>
        <p class="text-sm max-w-sm mt-2">Mục quản lý này đang được thiết kế giao diện và sẽ sớm ra mắt ở phiên bản tiếp theo.</p>
        <button 
          @click="currentTab = 'tournaments'"
          class="mt-4 px-4 py-2 rounded-lg bg-[#ff4655] hover:bg-[#ff5e6b] text-white text-xs font-bold transition"
        >
          Quay lại quản lý Giải đấu
        </button>
      </div>

    </main>

    <!-- Create / Edit Tournament Modal -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div class="bg-[#0f131a] border border-white/5 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn text-left">
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 class="text-lg font-bold uppercase tracking-wider font-valorant text-[#ff4655]">
            {{ isEditing ? 'Chỉnh sửa Giải đấu' : 'Tạo Giải đấu Mới' }}
          </h3>
          <button 
            @click="showCreateModal = false"
            class="text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="handleFormSubmit">
          <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            
            <!-- Error message -->
            <div v-if="error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              {{ error }}
            </div>

            <!-- Tournament Name -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên Giải đấu <span class="text-[#ff4655]">*</span></label>
              <input 
                v-model="form.name" 
                type="text" 
                required
                placeholder="Nhập tên giải đấu (ví dụ: Valorant Community Cup #1)" 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mô tả giải đấu</label>
              <textarea 
                v-model="form.description" 
                rows="3"
                placeholder="Mô tả thông tin chi tiết giải đấu, quy định tham gia..." 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition resize-none font-medium"
              ></textarea>
            </div>

            <!-- Two Column Row 1 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Start Date -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ngày bắt đầu</label>
                <input 
                  v-model="form.startDate" 
                  type="datetime-local" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>

              <!-- End Date -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ngày kết thúc</label>
                <input 
                  v-model="form.endDate" 
                  type="datetime-local" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>
            </div>

            <!-- Two Column Row 2 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Format Selection -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Thể thức</label>
                <select 
                  v-model="form.format" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
                >
                  <option v-for="f in formatList" :key="f" :value="f">{{ f }}</option>
                </select>
              </div>

              <!-- Max Teams -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Số đội tham dự tối đa</label>
                <input 
                  v-model="form.maxTeams" 
                  type="number" 
                  min="2"
                  max="128"
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>
            </div>

            <!-- Two Column Row 3 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Prize Pool -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Giải thưởng (Prize Pool)</label>
                <input 
                  v-model="form.prizePool" 
                  type="text" 
                  placeholder="ví dụ: 10.000.000 VNĐ / Cup" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>

              <!-- Status selection -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Trạng thái giải</label>
                <select 
                  v-model="form.status" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
                >
                  <option v-for="s in statusList" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-white/5 bg-white/2 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="showCreateModal = false"
              class="px-5 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition font-semibold"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              :disabled="loading"
              class="px-6 py-3 rounded-lg bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Đang lưu...</span>
              <span v-else>{{ isEditing ? 'Lưu thay đổi' : 'Tạo giải đấu' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create / Edit User Modal -->
    <div 
      v-if="showUserModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div class="bg-[#0f131a] border border-white/5 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn text-left">
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 class="text-lg font-bold uppercase tracking-wider font-valorant text-[#ff4655]">
            {{ isEditingUser ? 'Chỉnh sửa Tài Khoản' : 'Thêm Tài Khoản Mới' }}
          </h3>
          <button 
            @click="showUserModal = false"
            class="text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="handleSubmitUser">
          <div class="p-6 space-y-4">
            <!-- Error message -->
            <div v-if="usersError" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              {{ usersError }}
            </div>

            <!-- Username -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tên Đăng Nhập <span class="text-[#ff4655]">*</span></label>
              <input 
                v-model="userForm.username" 
                type="text" 
                required
                placeholder="Nhập tên đăng nhập..." 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Địa Chỉ Email <span class="text-[#ff4655]">*</span></label>
              <input 
                v-model="userForm.email" 
                type="email" 
                required
                placeholder="Nhập email..." 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mật Khẩu <span v-if="!isEditingUser" class="text-[#ff4655]">*</span></label>
              <input 
                v-model="userForm.password" 
                type="password" 
                :required="!isEditingUser"
                :placeholder="isEditingUser ? 'Bỏ trống nếu không muốn đổi...' : 'Nhập mật khẩu...'" 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
              />
            </div>

            <!-- Role selection -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vai Trò</label>
              <select 
                v-model="userForm.role" 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
              >
                <option value="guest">Khách (guest)</option>
                <option value="captain">Đội trưởng (cap)</option>
                <option value="admin">Quản trị viên (admin)</option>
              </select>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-white/5 bg-white/2 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="showUserModal = false"
              class="px-4 py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition font-semibold"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 rounded-lg bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold transition"
            >
              {{ isEditingUser ? 'Lưu thay đổi' : 'Thêm Tài Khoản' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Create / Edit Team Modal -->
    <div 
      v-if="showTeamModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div class="bg-[#0f131a] border border-white/5 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn text-left">
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 class="text-lg font-bold uppercase tracking-wider font-valorant text-[#ff4655]">
            {{ isEditingTeam ? 'Chỉnh sửa Đội tuyển' : 'Tạo Đội Tuyển Mới' }}
          </h3>
          <button 
            @click="showTeamModal = false"
            class="text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="handleTeamFormSubmit">
          <div class="p-6 space-y-5">
            <!-- Team Name -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên Đội tuyển <span class="text-[#ff4655]">*</span></label>
              <input 
                v-model="teamForm.name" 
                type="text" 
                required
                placeholder="Nhập tên đội tuyển (ví dụ: T1 VALORANT)" 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
              />
            </div>

            <!-- Logo URL -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Logo (URL ảnh)</label>
              <input 
                v-model="teamForm.logo" 
                type="text" 
                placeholder="https://example.com/logo.png" 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
              />
            </div>

            <!-- Tournament Selection -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Giải đấu tham dự</label>
              <select 
                v-model="teamForm.tournamentId"
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
              >
                <option value="">Không tham gia giải đấu nào</option>
                <option v-for="t in tournaments" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>

            <!-- Tokens Remaining -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Số Koin ban đầu</label>
              <input 
                v-model="teamForm.tokensRemaining" 
                type="number" 
                min="0"
                max="10000"
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-white/5 bg-white/2 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="showTeamModal = false"
              class="px-5 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition font-semibold"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              class="px-6 py-3 rounded-lg bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold transition"
            >
              <span>{{ isEditingTeam ? 'Lưu thay đổi' : 'Tạo đội tuyển' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Create / Edit Player Modal -->
    <div 
      v-if="showPlayerModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div class="bg-[#0f131a] border border-white/5 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn text-left">
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 class="text-lg font-bold uppercase tracking-wider font-valorant text-[#ff4655]">
            {{ isEditingPlayer ? 'Chỉnh sửa Tuyển thủ' : 'Thêm Tuyển Thủ Mới' }}
          </h3>
          <button 
            @click="showPlayerModal = false"
            class="text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="handlePlayerFormSubmit">
          <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- Error message -->
            <div v-if="playersError" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              {{ playersError }}
            </div>

            <!-- Two Column Row 1 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Riot ID -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Riot ID <span class="text-[#ff4655]">*</span></label>
                <input 
                  v-model="playerForm.riotId" 
                  type="text" 
                  required
                  placeholder="ví dụ: TenZ#1234" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>

              <!-- Nickname (Discord username) -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Discord Username <span class="text-[#ff4655]">*</span></label>
                <input 
                  v-model="playerForm.nickname" 
                  type="text" 
                  required
                  placeholder="Nhập Discord username..." 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>
            </div>

            <!-- Two Column Row 2 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Full Name -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên thật <span class="text-[#ff4655]">*</span></label>
                <input 
                  v-model="playerForm.fullName" 
                  type="text" 
                  required
                  placeholder="Nhập họ và tên..." 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>

              <!-- Gender -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Giới tính</label>
                <select 
                  v-model="playerForm.gender" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>

            <!-- Two Column Row 3 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Facebook Link -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Đường dẫn Facebook <span class="text-[#ff4655]">*</span></label>
                <input 
                  v-model="playerForm.facebookLink" 
                  type="text" 
                  required
                  placeholder="https://facebook.com/username" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>

              <!-- Avatar URL -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ảnh đại diện (URL)</label>
                <input 
                  v-model="playerForm.avatar" 
                  type="text" 
                  placeholder="https://example.com/avatar.png" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold"
                />
              </div>
            </div>

            <!-- Two Column Row 4 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Peak Rank -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Peak Rank</label>
                <select 
                  v-model="playerForm.rankName" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
                >
                  <option v-for="rank in rankList" :key="rank" :value="rank">{{ rank }}</option>
                </select>
              </div>

              <!-- Favorite Agent -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Đặc vụ yêu thích</label>
                <select 
                  v-model="playerForm.favoriteAgent" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
                >
                  <option v-for="agent in agentList" :key="agent" :value="agent">{{ agent }}</option>
                </select>
              </div>
            </div>

            <!-- Two Column Row 5 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Team -->
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Đội tuyển</label>
                <select 
                  v-model="playerForm.teamId" 
                  class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition font-bold cursor-pointer"
                >
                  <option value="">Tự do</option>
                  <option v-for="t in adminTeams" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>

              <!-- Is Captain checkbox container -->
              <div class="flex items-center gap-3 h-full pt-6">
                <input 
                  id="isCaptain"
                  v-model="playerForm.isCaptain" 
                  type="checkbox" 
                  class="w-5 h-5 rounded bg-[#0b0e14] border-white/10 text-[#ff4655] focus:ring-0 cursor-pointer"
                />
                <label for="isCaptain" class="text-sm font-bold text-gray-300 cursor-pointer select-none">Đóng vai trò Đội trưởng</label>
              </div>
            </div>

            <!-- Preferred Roles (Checkbox selection) -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vai trò sở trường</label>
              <div class="flex flex-wrap gap-4 bg-[#0b0e14] border border-white/10 rounded-xl p-4">
                <label 
                  v-for="role in rolesList" 
                  :key="role" 
                  class="flex items-center gap-2 text-sm font-semibold text-gray-300 cursor-pointer select-none"
                >
                  <input 
                    type="checkbox" 
                    :value="role" 
                    v-model="playerForm.preferredRoles" 
                    class="w-4 h-4 rounded bg-[#0b0e14] border-white/10 text-[#ff4655] focus:ring-0 cursor-pointer"
                  />
                  <span>{{ role }}</span>
                </label>
              </div>
            </div>

            <!-- Strengths -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Điểm mạnh / Lối chơi</label>
              <textarea 
                v-model="playerForm.strengths" 
                rows="3"
                placeholder="Mô tả điểm mạnh, lối chơi của tuyển thủ..." 
                class="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition resize-none font-medium"
              ></textarea>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-white/5 bg-white/2 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="showPlayerModal = false"
              class="px-5 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition font-semibold"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              class="px-6 py-3 rounded-lg bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold transition"
            >
              {{ isEditingPlayer ? 'Lưu thay đổi' : 'Thêm tuyển thủ' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>

  <!-- Access Denied Screen -->
  <div v-else class="min-h-[calc(100vh-4rem)] bg-val-dark flex flex-col items-center justify-center p-6 text-center select-none w-full">
    <div class="max-w-md w-full glass-card p-10 rounded-2xl border border-red-500/20 shadow-2xl relative">
      <!-- Decorative crosshairs -->
      <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#ff4655]"></div>
      <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#ff4655]"></div>
      <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#ff4655]"></div>
      <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#ff4655]"></div>
      
      <div class="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-[#ff4655] animate-pulse">
        <i class="fas fa-shield-alt text-3xl"></i>
      </div>
      <h2 class="text-2xl font-black font-valorant text-[#ff4655] tracking-widest uppercase mb-3">ACCESS DENIED</h2>
      <p class="text-gray-400 text-sm mb-8 leading-relaxed">
        Bạn không có quyền truy cập vào trang quản trị này. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
      </p>
      <router-link 
        to="/" 
        class="inline-block w-full val-btn-red py-3 px-4 font-bold rounded uppercase tracking-wider text-sm text-center"
      >
        QUAY LẠI TRANG CHỦ
      </router-link>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scaleIn {
  animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Hide scrollbars but keep functionality */
.max-h-\[70vh\]::-webkit-scrollbar {
  width: 6px;
}
.max-h-\[70vh\]::-webkit-scrollbar-track {
  background: transparent;
}
.max-h-\[70vh\]::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.max-h-\[70vh\]::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>