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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Column: User details & Change Password -->
          <div class="space-y-8">
            
            <!-- Profile details -->
            <div class="glass-card rounded-lg p-6 border border-white/5" v-if="currentUser">
              <div class="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div class="w-16 h-16 rounded-full bg-red-500/10 border-2 border-[#ff4655] flex items-center justify-center text-white text-2xl font-valorant font-bold glow-red overflow-hidden shrink-0">
                  <img v-if="playerProfile && playerProfile.avatar" :src="playerProfile.avatar" class="w-full h-full object-cover" />
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
              
              <div class="mt-6 pt-6 border-t border-white/10">
                <router-link 
                  to="/register-player"
                  class="w-full block text-center bg-[#ff4655] hover:bg-[#ff5e6b] text-white px-4 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition duration-200 shadow-md shadow-[#ff4655]/20"
                >
                  {{ isRegistered ? 'Cập nhật thông tin đăng ký' : 'Đăng ký giải đấu' }}
                </router-link>
              </div>
            </div>

            <!-- Change Password form -->
            <div class="glass-card rounded-lg p-6 border border-white/5 text-left">
              <h3 class="text-md font-bold font-valorant text-white mb-4 uppercase text-[#ff4655] tracking-wider">Đổi mật khẩu</h3>
              
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

                <div class="flex justify-end pt-2">
                  <button :disabled="passwordLoading" type="submit" class="bg-white/5 hover:bg-[#ff4655] border border-white/10 hover:border-transparent px-6 py-2.5 rounded text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer">
                    {{ passwordLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu' }}
                  </button>
                </div>
              </form>
            </div>

          </div>

          <!-- Right Column: Player Registration Info -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Player Registration Info (Visible only if isRegistered and playerProfile exists) -->
            <div v-if="isRegistered && playerProfile" class="glass-card rounded-lg p-6 border border-white/5">
              
              <!-- Team Details Header and Tabs -->
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 text-left">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="userTeam && userTeam.logo" :src="userTeam.logo" class="w-full h-full object-cover" />
                    <i v-else class="fas fa-shield-alt text-[#00f599] text-xl animate-pulse"></i>
                  </div>
                  <div>
                    <span class="block text-[10px] text-gray-500 uppercase font-bold tracking-wider leading-none">Hồ sơ giải đấu / Đội tuyển</span>
                    <span class="font-extrabold text-white text-lg tracking-wider font-valorant mt-1.5 block">{{ userTeam ? userTeam.name : 'N/A' }}</span>
                  </div>
                </div>
                
                <!-- 5 Member Tabs -->
                <div class="flex flex-wrap gap-1 bg-[#0b0e14]/80 p-1 rounded-xl border border-white/5">
                  <button 
                    v-for="(member, idx) in teamMembers" 
                    :key="member.id"
                    type="button"
                    @click="activeMemberIndex = idx"
                    class="px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 uppercase font-valorant cursor-pointer"
                    :class="[
                      activeMemberIndex === idx 
                        ? 'bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    ]"
                  >
                    {{ member.is_captain ? '★ ' : '' }}{{ member.nickname }}
                  </button>
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

            <!-- Fallback if not registered -->
            <div v-else class="glass-card rounded-lg p-12 border border-white/5 text-center flex flex-col items-center justify-center gap-4">
              <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 text-2xl">
                <i class="fas fa-trophy text-[#ff4655]"></i>
              </div>
              <h3 class="text-lg font-bold font-valorant text-white uppercase tracking-wider">Chưa đăng ký giải đấu</h3>
              <p class="text-xs text-gray-400 max-w-sm">Tài khoản này chưa tham gia hoặc liên kết với đội tuyển nào. Hãy đăng ký đội tuyển của bạn để tham gia tranh tài!</p>
              <router-link 
                to="/register-player"
                class="bg-[#ff4655] hover:bg-[#ff5e6b] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition duration-200 mt-2 cursor-pointer shadow-lg shadow-[#ff4655]/20"
              >
                Đăng ký ngay bây giờ
              </router-link>
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

const playerProfile = computed(() => {
  return teamMembers.value[activeMemberIndex.value] || null
})

const fetchPlayerTeam = async () => {
  if (!currentUser.value) return
  
  try {
    const response = await fetch('http://localhost:3000/api/teams')
    if (!response.ok) throw new Error('Không thể tải danh sách đội')
    const teams = await response.json()
    
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
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
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
