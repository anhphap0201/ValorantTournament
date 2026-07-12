<template>
  <div class="cyber-grid flex-grow py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-[95%] mx-auto">
      <!-- Alert Messages -->
      <Transition name="slide-fade">
        <div v-if="errorMessage" class="mb-6 p-4 rounded bg-red-950/50 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div v-if="successMessage" class="mb-6 p-4 rounded bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-2">
          <i class="fas fa-check-circle text-emerald-500"></i>
          <span>{{ successMessage }}</span>
        </div>
      </Transition>

      <div class="mb-8">
        <h1 class="text-3xl font-extrabold font-valorant text-white">Hồ sơ</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          <!-- Left Column: User details & Change Password -->
          <div class="flex flex-col gap-8 h-full">
            
            <!-- Profile details -->
            <div class="glass-card rounded-lg p-6 border border-white/5 flex flex-col justify-between flex-grow" v-if="currentUser">
              <div>
                <div class="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div class="w-16 h-16 rounded-full bg-red-500/10 border-2 border-[#ff4655] flex items-center justify-center text-white text-2xl font-valorant font-bold glow-red overflow-hidden shrink-0">
                    <img v-if="captainAvatar" :src="captainAvatar" class="w-full h-full object-cover" />
                    <span v-else>{{ avatarChar }}</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white mb-1">{{ currentUser.username }}</h3>
                    <!-- Dynamic styled badge for user role -->
                    <span :class="userRoleInfo.colorClass" class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold uppercase border">
                      <i :class="'fa-solid ' + userRoleInfo.icon" class="text-[10px]"></i>
                      {{ userRoleInfo.label }}
                    </span>
                  </div>
                </div>

                <div class="space-y-4 text-sm text-left">
                  <div>
                    <span class="block text-xs text-gray-500 uppercase font-semibold mb-0.5">Tên tài khoản</span>
                    <span class="font-medium text-white text-xs tracking-wide">{{ currentUser.username }}</span>
                  </div>
                  <div>
                    <span class="block text-xs text-gray-500 uppercase font-semibold mb-0.5">Địa chỉ Email</span>
                    <span class="font-medium text-white text-xs tracking-wide">{{ currentUser.email || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="block text-xs text-gray-500 uppercase font-semibold mb-0.5">Ngày tham gia</span>
                    <span class="font-medium text-white text-xs tracking-wide">{{ joinDateFormatted }}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                <!-- If already registered: Allow updating details anytime -->
                <router-link 
                  v-if="isRegistered"
                  to="/register-player"
                  class="w-full block text-center bg-[#ff4655] hover:bg-[#ff5e6b] text-white px-4 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition duration-200 shadow-md shadow-[#ff4655]/20 font-valorant"
                >
                  Cập nhật thông tin đăng ký
                </router-link>

                <!-- If not registered yet: Check active tournament status and capacity -->
                <template v-else>
                  <router-link 
                    v-slot="{ navigate }"
                    v-if="activeTournament && activeTournament.status === 'register' && activeTournament.registered_teams_count < activeTournament.max_teams"
                    to="/register-player"
                    custom
                  >
                    <button
                      @click="navigate"
                      class="w-full text-center bg-[#ff4655] hover:bg-[#ff5e6b] text-white px-4 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition duration-200 shadow-md shadow-[#ff4655]/20 font-valorant cursor-pointer animate-pulse"
                    >
                      Đăng ký giải đấu
                    </button>
                  </router-link>
                  
                  <div 
                    v-else 
                    class="w-full text-center bg-white/5 border border-white/5 text-gray-500 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider cursor-not-allowed font-valorant"
                  >
                    {{ activeTournament && activeTournament.status !== 'register' ? 'Đăng ký giải đấu (Đã đóng)' : 'Đăng ký giải đấu (Giải đấu đã đầy)' }}
                  </div>
                </template>

                <button 
                  v-if="!showPasswordForm"
                  @click="showPasswordForm = true"
                  class="w-full text-center bg-white/5 hover:bg-[#ff4655] border border-white/10 hover:border-transparent text-white px-4 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition duration-200 font-valorant cursor-pointer"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>

            <!-- Change Password collapsible form (outside Profile details, only visible when active) -->
            <div v-if="showPasswordForm" class="glass-card rounded-lg p-6 border border-white/5 text-left animate-fadeIn">
              <div class="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h3 class="text-md font-bold font-valorant text-white uppercase text-[#ff4655] tracking-wider">Đổi mật khẩu</h3>
                <button @click="showPasswordForm = false" class="text-xs text-gray-500 hover:text-white transition font-semibold cursor-pointer">Hủy</button>
              </div>
              
              <form @submit.prevent="handleChangePassword" class="space-y-4">
                <div>
                  <label for="oldPassword" class="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
                  <input v-model="oldPassword" type="password" id="oldPassword" required class="block w-full px-3 py-2 bg-[#0b0e14] border border-white/10 rounded focus:border-[#ff4655] focus:outline-none text-white text-sm transition font-bold">
                </div>

                <div class="space-y-4">
                  <div>
                    <label for="newPassword" class="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Mật khẩu mới</label>
                    <input v-model="newPassword" type="password" id="newPassword" required minlength="6" class="block w-full px-3 py-2 bg-[#0b0e14] border border-white/10 rounded focus:border-[#ff4655] focus:outline-none text-white text-sm transition font-bold">
                    <p class="text-[9px] text-zinc-400 mt-1">Mật khẩu mới phải khác mật khẩu hiện tại.</p>
                  </div>
                  
                  <div>
                    <label for="confirmNewPassword" class="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                    <input v-model="confirmNewPassword" type="password" id="confirmNewPassword" required minlength="6" class="block w-full px-3 py-2 bg-[#0b0e14] border border-white/10 rounded focus:border-[#ff4655] focus:outline-none text-white text-sm transition font-bold">
                  </div>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                  <button type="button" @click="showPasswordForm = false" class="px-4 py-2 rounded text-gray-400 hover:text-white transition text-xs font-bold uppercase cursor-pointer">
                    Hủy
                  </button>
                  <button :disabled="passwordLoading" type="submit" class="bg-[#ff4655] hover:bg-[#ff5e6b] px-6 py-2.5 rounded text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer">
                    {{ passwordLoading ? 'Đang xử lý...' : 'Cập nhật' }}
                  </button>
                </div>
              </form>
            </div>

          </div>

           <!-- Right Column: Player Registration Info -->
          <div class="lg:col-span-2 h-full">
            
            <!-- Player Registration Info (Visible only if isRegistered and playerProfile exists) -->
            <div v-if="isRegistered && playerProfile" class="glass-card rounded-lg border border-white/5 overflow-hidden h-full flex flex-col">
              
              <!-- 5 Member Tabs - Full Width Bar at the very top -->
              <div class="grid grid-cols-5 bg-[#0b0e14]/80 border-b border-white/5 p-1 shrink-0">
                <button 
                  v-for="(member, idx) in teamMembers" 
                  :key="member.id"
                  type="button"
                  @click="activeMemberIndex = idx"
                  class="py-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-150 uppercase font-valorant cursor-pointer text-center"
                  :class="[
                    activeMemberIndex === idx 
                      ? 'bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/2'
                  ]"
                >
                  {{ member.is_captain ? '★ ' : '' }}{{ member.nickname }}
                </button>
              </div>

              <div class="p-6 flex-grow flex flex-col justify-between">
                <!-- Team Details Header -->
                <div class="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 text-left">
                  <!-- Left side: Team details -->
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      <img v-if="userTeam && userTeam.logo" :src="userTeam.logo" class="w-full h-full object-cover" />
                      <i v-else class="fas fa-shield-alt text-[#00f599] text-xl animate-pulse"></i>
                    </div>
                    <div>
                      <span class="block text-[10px] text-gray-500 uppercase font-bold tracking-wider leading-none">Hồ sơ giải đấu / Đội tuyển</span>
                      <span class="font-extrabold text-white text-lg tracking-wider font-valorant mt-1.5 block">{{ userTeam ? userTeam.name : 'N/A' }}</span>
                    </div>
                  </div>

                  <!-- Right side: Selected Member details (Avatar + Name) -->
                  <div v-if="playerProfile" class="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 max-w-[180px] sm:max-w-xs shrink-0">
                    <div class="w-8 h-8 rounded-full bg-red-500/10 border border-[#ff4655]/50 overflow-hidden flex items-center justify-center text-white text-[10px] font-bold font-valorant shrink-0">
                      <img v-if="playerProfile.avatar" :src="playerProfile.avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ playerProfile.nickname ? playerProfile.nickname[0].toUpperCase() : '?' }}</span>
                    </div>
                    <div class="min-w-0">
                      <span class="block text-[8px] text-gray-500 uppercase font-bold tracking-wider leading-none">Tuyển thủ</span>
                      <span class="block font-bold text-white text-xs truncate mt-0.5" :title="playerProfile.nickname">
                        {{ playerProfile.nickname }}
                      </span>
                    </div>
                  </div>
                </div>
              
              <!-- Selected Player Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-left animate-fadeIn" :key="activeMemberIndex">
                <!-- Left Details -->
                <div class="space-y-3">
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Họ và tên</span>
                    <span class="font-bold text-white text-sm">{{ playerProfile.full_name || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Giới tính</span>
                    <span class="font-bold text-white text-sm">{{ playerProfile.gender === 'Male' ? 'Nam' : playerProfile.gender === 'Female' ? 'Nữ' : 'Khác' }}</span>
                  </div>
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Liên kết Facebook</span>
                    <a :href="playerProfile.facebook_link" target="_blank" class="font-bold text-[#ff4655] hover:underline text-sm truncate block max-w-full" v-if="playerProfile.facebook_link">
                      {{ playerProfile.facebook_link }}
                    </a>
                    <span class="font-bold text-white text-sm" v-else>N/A</span>
                  </div>
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Biệt danh Server</span>
                    <span class="font-bold text-white text-sm">{{ playerProfile.nickname || 'N/A' }}</span>
                  </div>
                </div>

                <!-- Right Details -->
                <div class="space-y-3">
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Riot ID</span>
                    <a 
                      v-if="playerProfile.riot_id"
                      :href="'https://tracker.gg/valorant/profile/riot/' + encodeURIComponent(playerProfile.riot_id) + '/overview'"
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 font-bold text-[#ff4655] hover:text-[#ff5d6a] hover:underline text-sm tracking-wider font-valorant transition duration-150"
                      title="Xem hồ sơ trên Tracker.gg"
                    >
                      <span>{{ playerProfile.riot_id }}</span>
                      <i class="fas fa-external-link-alt text-[10px] opacity-75"></i>
                    </a>
                    <span class="font-bold text-white text-sm" v-else>N/A</span>
                  </div>
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Peak Rank</span>
                    <span class="font-bold text-white text-sm">{{ playerProfile.rank_name || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Vai trò sở trường</span>
                    <div class="flex gap-1 items-center bg-[#0b0e14] px-2.5 py-1 rounded border border-white/5 w-fit mt-1">
                      <img 
                        v-for="icon in getRoleIcons(playerProfile.preferred_role)" 
                        :key="icon.src" 
                        :src="icon.src" 
                        :title="icon.label" 
                        class="w-3.5 h-3.5 object-contain opacity-90"
                      />
                      <span class="font-bold text-white text-xs uppercase font-valorant ml-1.5">
                        {{ playerProfile.preferred_role || 'N/A' }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Đặc vụ yêu thích</span>
                    <span class="font-bold text-white text-sm">{{ playerProfile.favorite_agent || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- Strengths Section -->
              <div class="mt-4 pt-4 border-t border-white/10 text-left" v-if="playerProfile.strengths">
                <span class="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Điểm mạnh cá nhân</span>
                <p class="text-gray-300 text-xs italic bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">{{ playerProfile.strengths }}</p>
              </div>
            </div>
          </div>
            
            <!-- Fallback if not registered -->
            <div v-else class="glass-card rounded-lg p-12 border border-white/5 text-center flex flex-col items-center justify-center gap-4 h-full">
              <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 text-2xl">
                <i class="fas fa-trophy text-[#ff4655]"></i>
              </div>
              <h3 class="text-lg font-bold font-valorant text-white uppercase tracking-wider">Chưa đăng ký giải đấu</h3>
              <p class="text-xs text-gray-400 max-w-sm">Tài khoản này chưa tham gia hoặc liên kết với đội tuyển nào. Hãy đăng ký đội tuyển của bạn để tham gia tranh tài!</p>
              <router-link 
                to="/register-player"
                class="bg-[#ff4655] hover:bg-[#ff5e6b] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition duration-200 mt-2 cursor-pointer shadow-lg shadow-[#ff4655]/20"
              >
                Đăng ký đội tuyển mới
              </router-link>

              <!-- Link existing team section for Captains -->
              <div v-if="currentUser && currentUser.role === 'captain' && unlinkedTeams.length > 0" class="w-full max-w-md border-t border-white/10 pt-8 mt-6">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2 font-valorant">Hoặc liên kết với Đội tuyển sẵn có</h4>
                <p class="text-[10px] text-gray-500 mb-4">Nếu đội tuyển của bạn đã được tạo trước đó bởi Admin hoặc đăng ký lúc chưa đăng nhập, chọn để liên kết tài khoản.</p>
                <div class="flex gap-2 w-full">
                  <select 
                    v-model="selectedTeamToLink"
                    class="flex-grow bg-[#0b0e14] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff4655] font-bold cursor-pointer min-w-0"
                  >
                    <option value="">-- Chọn đội tuyển --</option>
                    <option v-for="t in unlinkedTeams" :key="t.id" :value="t.id">{{ t.name }}</option>
                  </select>
                  <button 
                    @click="handleLinkTeam"
                    :disabled="linkingTeam || !selectedTeamToLink"
                    class="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/20 disabled:text-gray-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
                  >
                    {{ linkingTeam ? 'Đang lưu...' : 'Liên kết' }}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const editStates = ref({
  username: false,
  email: false,
  password: false
})

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Current user profile computed
const currentUser = computed(() => user.value)

// Avatar calculation
const avatarChar = computed(() => {
  return currentUser.value && currentUser.value.username 
    ? currentUser.value.username.charAt(0).toUpperCase() 
    : 'U'
})

// Role styling badge
const userRoleInfo = computed(() => {
  if (!currentUser.value) return { label: 'Guest', colorClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: 'fa-user' }
  
  if (currentUser.value.role === 'admin') {
    return {
      label: 'Admin',
      colorClass: 'bg-red-500/10 text-[#ff4655] border-[#ff4655]/20',
      icon: 'fa-shield-halved'
    }
  } else if (currentUser.value.role === 'captain') {
    return {
      label: 'Đội trưởng',
      colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: 'fa-crown'
    }
  } else {
    return {
      label: 'Thành viên',
      colorClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      icon: 'fa-user'
    }
  }
})

// Format join date
const joinDateFormatted = computed(() => {
  if (currentUser.value && currentUser.value.created_at) {
    return new Date(currentUser.value.created_at).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return 'N/A'
})

// Team & Player logic
const userTeam = ref(null)
const teamMembers = ref([])
const activeMemberIndex = ref(0)
const isRegistered = ref(false)
const unlinkedTeams = ref([])
const selectedTeamToLink = ref('')
const linkingTeam = ref(false)

const playerProfile = computed(() => {
  return teamMembers.value[activeMemberIndex.value] || null
})

const captainAvatar = computed(() => {
  const captain = teamMembers.value.find(m => m.is_captain)
  return captain?.avatar || null
})

const handleLinkTeam = async () => {
  if (!selectedTeamToLink.value) return
  linkingTeam.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await fetch(`http://localhost:3000/api/teams/${selectedTeamToLink.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: currentUser.value.id })
    })
    
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Liên kết đội tuyển thất bại.')
    }
    
    successMessage.value = 'Liên kết tài khoản với đội tuyển thành công!'
    await fetchPlayerTeam()
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    linkingTeam.value = false
  }
}

const fetchPlayerTeam = async () => {
  if (!currentUser.value) return
  
  try {
    const response = await fetch('http://localhost:3000/api/teams')
    if (!response.ok) throw new Error('Không thể tải danh sách đội')
    const teams = await response.json()
    
    // Find unlinked teams for captain users
    unlinkedTeams.value = teams.filter(t => !t.user_id)
    
    // Find the team where user is either the captain or a member
    const matchingTeam = teams.find(team => {
      const isUserIdMatch = team.user_id && team.user_id === currentUser.value.id
      const isCaptainMatch = team.captain && team.captain.nickname.toLowerCase() === currentUser.value.username.toLowerCase()
      const isMemberMatch = team.members && team.members.some(m => m.nickname.toLowerCase() === currentUser.value.username.toLowerCase())
      return isUserIdMatch || isCaptainMatch || isMemberMatch
    })
    
    if (matchingTeam) {
      userTeam.value = matchingTeam
      const captain = matchingTeam.captain ? [matchingTeam.captain] : []
      const members = matchingTeam.members || []
      teamMembers.value = [...captain, ...members]
      isRegistered.value = true
      
      // Auto switch index to the user in teamMembers list if they are not captain
      const userIdx = teamMembers.value.findIndex(m => m.nickname.toLowerCase() === currentUser.value.username.toLowerCase())
      if (userIdx !== -1) {
        activeMemberIndex.value = userIdx
      }
    } else {
      isRegistered.value = false
    }
  } catch (err) {
    console.error("Lỗi khi tải thông tin đội:", err)
  }
}

const fetchUserProfile = async () => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    router.push('/login')
    return
  }

  const parsedUser = JSON.parse(storedUser)
  
  try {
    const response = await fetch(`http://localhost:3000/api/auth/profile/${parsedUser.id}`)
    if (!response.ok) {
      throw new Error('Không thể tải thông tin hồ sơ.')
    }
    const data = await response.json()
    user.value = data
    
    // Sync formData
    formData.value.username = data.username
    formData.value.email = data.email

    // Load team details
    await fetchPlayerTeam()
  } catch (err) {
    errorMessage.value = err.message
  }
}

// Role icons helper
const getRoleIcons = (preferredRole) => {
  if (!preferredRole) return []
  const roles = typeof preferredRole === 'string'
    ? preferredRole.split(',').map(r => r.trim().toLowerCase())
    : Array.isArray(preferredRole)
      ? preferredRole.map(r => r.toLowerCase())
      : []

  const roleMap = {
    duelist: { src: '/assets/roles/DuelistClassSymbol.webp', label: 'Duelist' },
    controller: { src: '/assets/roles/ControllerClassSymbol.webp', label: 'Controller' },
    initiator: { src: '/assets/roles/InitiatorClassSymbol.webp', label: 'Initiator' },
    sentinel: { src: '/assets/roles/SentinelClassSymbol.webp', label: 'Sentinel' }
  }

  return roles.map(r => roleMap[r]).filter(Boolean)
}

// Password changing logic
const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordLoading = ref(false)
const showPasswordForm = ref(false)

const handleChangePassword = async () => {
  if (newPassword.value !== confirmNewPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }
  
  passwordLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await fetch(`http://localhost:3000/api/auth/profile/${currentUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: currentUser.value.username,
        email: currentUser.value.email,
        oldPassword: oldPassword.value,
        password: newPassword.value
      })
    })
    
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Đổi mật khẩu thất bại.')
    }
    
    successMessage.value = 'Đổi mật khẩu thành công!'
    oldPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    showPasswordForm.value = false
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    passwordLoading.value = false
  }
}

const activeTournament = ref(null)

const fetchActiveTournament = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/tournaments')
    if (!response.ok) throw new Error('Không thể tải danh sách giải đấu')
    const tournamentsList = await response.json()
    if (tournamentsList.length > 0) {
      activeTournament.value = tournamentsList[0]
    }
  } catch (err) {
    console.error("Lỗi khi tải thông tin giải đấu:", err)
  }
}

onMounted(() => {
  fetchUserProfile()
  fetchActiveTournament()
})
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.35s ease-out forwards;
}
</style>
