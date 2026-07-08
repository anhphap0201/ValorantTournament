<template>
  <div class="cyber-grid flex-grow py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
    <div class="w-full lg:w-[80%] max-w-[1400px] glass-card rounded-2xl p-6 md:p-10 shadow-2xl glow-red">
      
      <!-- Page Header -->
      <div class="text-center mb-8 pb-4 border-b border-white/10">
        <h1 class="text-2xl md:text-3xl font-extrabold text-white font-valorant tracking-wider mb-2">ĐĂNG KÝ THAM GIA GIẢI ĐẤU</h1>
        <p class="text-gray-400 text-xs md:text-sm uppercase tracking-wider font-semibold">
          {{ tournament?.name || 'Đang tải...' }}
        </p>
        <br>
        <p class="text-red-500 text-xs md:text-sm uppercase tracking-wider font-semibold">Vui lòng trung thực khi cung cấp thông tin !</p>
      </div>

      <!-- Limit Reached Warning -->
      <div 
        v-if="isLimitReached" 
        class="mb-8 p-6 rounded-xl border bg-red-950/20 border-red-500/30 text-red-200 text-left animate-fadeIn flex flex-col gap-3"
      >
        <div class="flex items-center gap-2 text-[#ff4655] font-bold text-sm uppercase tracking-wider">
          <i class="fas fa-ban text-lg animate-pulse"></i>
          <span>Đăng ký giải đấu đã đóng</span>
        </div>
        <p class="text-xs text-gray-300 leading-relaxed">
          Hiện tại số lượng đăng ký tham gia giải đấu đã đạt giới hạn tối đa (<strong class="text-white">{{ playerCount }}/{{ maxPlayers }}</strong> đội). Ban Tổ Chức đã ngừng tiếp nhận đơn đăng ký mới.
        </p>
        <div class="pt-2">
          <router-link 
            to="/" 
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition"
          >
            <i class="fas fa-home"></i> Quay lại trang chủ
          </router-link>
        </div>
      </div>

      <!-- Main Layout: Left Stepper & Right Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Side: Vertical Stepper -->
        <div class="lg:col-span-3 py-4 lg:sticky lg:top-24">
          <div class="relative pl-8 space-y-8">

            <!-- Stepper Nodes -->
            <div 
              v-for="step in 5" 
              :key="step"
              class="relative flex items-center gap-4 cursor-pointer group"
              @click="goToStep(step)"
            >
              <!-- Circle indicator -->
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 shadow-lg z-10 shrink-0"
                :class="[
                  currentStep === step 
                    ? 'bg-[#0f172a] border-[#ff4655] text-[#ff4655] scale-110 ring-4 ring-[#ff4655]/20' 
                    : currentStep > step 
                      ? 'bg-black border-[#ff4655] text-white' 
                      : 'bg-[#0f172a] border-white/20 text-gray-500'
                ]"
              >
                <span v-if="currentStep > step">✓</span>
                <span v-else>{{ step }}</span>
              </div>
              
              <!-- Step label -->
              <div class="flex flex-col text-left">
                <span 
                  class="text-xs font-bold uppercase tracking-wider transition-all duration-300"
                  :class="currentStep >= step ? 'text-white' : 'text-gray-500'"
                >
                  {{ stepLabels[step - 1] }}
                </span>
                <span class="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
                  {{ step === 1 ? 'Đội trưởng' : `Thành viên ${step}` }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Form Content -->
        <div class="lg:col-span-9 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
          <!-- Global Alert Notification inside Form Area -->
          <div 
            v-if="statusMessage" 
            class="mb-6 p-4 rounded-xl text-sm border flex items-center gap-3 animate-fadeIn"
            :class="[
              statusType === 'success' 
                ? 'bg-[#00f599]/10 border-[#00f599]/20 text-[#00f599]' 
                : 'bg-[#ff4655]/10 border-[#ff4655]/20 text-[#ff4655]'
            ]"
          >
            <i :class="statusType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
            <span>{{ statusMessage }}</span>
          </div>

          <!-- Registration Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6 overflow-hidden">
            
            <Transition :name="transitionName" mode="out-in">
              <div :key="currentStep" class="space-y-6">
                
                <!-- Team Details (Only on step 1) - Full Width -->
                <div v-if="currentStep === 1" class="pb-6 border-b border-white/10 mb-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-end animate-fadeIn">
                  <!-- Team Name input -->
                  <div class="md:col-span-8 text-left">
                    <label class="block text-xs font-bold text-[#ff4655] uppercase tracking-widest mb-2">Tên Đội <span class="text-[#ff4655]">*</span></label>
                    <input 
                      v-model="teamName" 
                      type="text" 
                      required
                      placeholder="Nhập tên đội của bạn" 
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200 font-bold text-lg"
                    />
                  </div>
                  
                  <!-- Team Logo upload -->
                  <div class="md:col-span-4 flex items-center gap-4 text-left">
                    <!-- Logo Preview -->
                    <div 
                      class="relative group cursor-pointer w-16 h-16 rounded-xl border-2 border-dashed border-white/20 hover:border-[#ff4655] flex items-center justify-center overflow-hidden bg-white/5 transition duration-300 shrink-0"
                      @click="triggerTeamLogoInput"
                    >
                      <img v-if="teamLogoPreview" :src="teamLogoPreview" class="w-full h-full object-cover animate-fadeIn" />
                      <div v-else class="text-center text-gray-500 group-hover:text-[#ff4655] transition duration-300">
                        <i class="fas fa-shield-alt text-xl"></i>
                        <span class="block text-[8px] uppercase font-bold tracking-wider mt-0.5">Logo</span>
                      </div>
                      <!-- Overlay on hover -->
                      <div v-if="teamLogoPreview" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition duration-300">
                        <i class="fas fa-edit text-xs"></i>
                      </div>
                    </div>
                    
                    <div class="space-y-0.5">
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logo Đội</label>
                      <p class="text-[8px] text-gray-500 leading-tight">JPG, PNG. Tối đa 5MB.</p>
                      <button type="button" @click="triggerTeamLogoInput" class="text-xs font-bold text-[#ff4655] hover:text-[#ff5e6b] transition">
                        Tải logo
                      </button>
                      <input 
                        ref="teamLogoInputRef"
                        type="file" 
                        accept="image/*" 
                        class="hidden" 
                        @change="handleTeamLogoChange" 
                      />
                    </div>
                  </div>
                </div>

                <!-- Section Header -->
                <div class="flex items-center justify-between pb-3 border-b border-white/10">
                  <span class="text-md font-bold text-[#ff4655] uppercase tracking-wider font-valorant">
                    {{ currentStep === 1 ? 'Đội trưởng (Thành viên 1)' : `Thành viên ${currentStep}` }}
                  </span>
                  <span class="text-xs text-gray-400 font-semibold font-valorant">Bước {{ currentStep }} / 5</span>
                </div>

                <!-- Fields Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  
                  <!-- Left Column: Personal Info -->
                  <div class="space-y-5">
                    <div class="flex items-center gap-2 pb-2 border-b border-white/5">
                      <i class="fas fa-user-circle text-[#ff4655]"></i>
                      <span class="text-xs font-bold uppercase tracking-wider text-gray-300">Thông tin cá nhân</span>
                    </div>

                    <!-- Avatar Selector -->
                    <div class="flex items-center gap-5 p-4 rounded-xl border border-white/5 bg-white/5">
                      <div class="relative group cursor-pointer w-16 h-16 rounded-full border-2 border-dashed border-white/20 hover:border-[#ff4655] flex items-center justify-center overflow-hidden bg-white/10 transition duration-300 shrink-0" @click="triggerFileInput">
                        <img v-if="members[currentStep - 1].avatarPreview" :src="members[currentStep - 1].avatarPreview" class="w-full h-full object-cover" />
                        <div v-else class="text-center text-gray-500 group-hover:text-[#ff4655] transition duration-300">
                          <i class="fas fa-camera text-lg mb-1"></i>
                          <span class="block text-[8px] uppercase font-bold tracking-wider">Tải lên</span>
                        </div>
                        <div v-if="members[currentStep - 1].avatarPreview" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition duration-300">
                          <i class="fas fa-edit text-xs"></i>
                        </div>
                      </div>
                      
                      <div class="space-y-0.5">
                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ảnh đại diện tuyển thủ</label>
                        <p class="text-[8px] text-gray-500 leading-tight">JPG, PNG, GIF. Tự động thay đổi & nén.</p>
                        <button type="button" @click="triggerFileInput" class="text-xs font-bold text-[#ff4655] hover:text-[#ff5e6b] transition">
                          Chọn ảnh
                        </button>
                        <input 
                          ref="fileInputRef"
                          type="file" 
                          accept="image/*" 
                          class="hidden" 
                          @change="handleFileChange" 
                        />
                      </div>
                    </div>

                    <!-- Full Name -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Họ và tên <span class="text-[#ff4655]">*</span></label>
                      <input 
                        v-model="members[currentStep - 1].fullName" 
                        type="text" 
                        required
                        placeholder="Nhập họ và tên tuyển thủ" 
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200"
                      />
                    </div>

                    <!-- Gender -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Giới tính <span class="text-[#ff4655]">*</span></label>
                      <select 
                        v-model="members[currentStep - 1].gender" 
                        required
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200"
                      >
                        <option value="" disabled class="bg-[#0f172a] text-white">Chọn giới tính</option>
                        <option value="Male" class="bg-[#0f172a] text-white">Nam</option>
                        <option value="Female" class="bg-[#0f172a] text-white">Nữ</option>
                        <option value="Other" class="bg-[#0f172a] text-white">Khác</option>
                      </select>
                    </div>

                    <!-- Facebook Link -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Liên kết Facebook <span class="text-[#ff4655]">*</span></label>
                      <div class="flex gap-2">
                        <input 
                          v-model="members[currentStep - 1].facebookLink" 
                          type="url" 
                          required
                          placeholder="https://facebook.com/username" 
                          class="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200"
                        />
                        <button 
                          type="button" 
                          @click="checkFacebookLink" 
                          :disabled="!members[currentStep - 1].facebookLink"
                          class="px-4 py-3 bg-[#ff4655]/10 hover:bg-[#ff4655] border border-[#ff4655]/30 hover:border-transparent text-[#ff4655] hover:text-black font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>Kiểm tra</span>
                        </button>
                      </div>
                    </div>

                    <!-- Discord Username -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username Discord <span class="text-[#ff4655]">*</span></label>
                      <input 
                        v-model="members[currentStep - 1].nickname" 
                        type="text" 
                        required
                        placeholder="Nhập username Discord" 
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200"
                      />
                    </div>
                  </div>

                  <!-- Right Column: Game Info -->
                  <div class="space-y-5">
                    <div class="flex items-center gap-2 pb-2 border-b border-white/5">
                      <i class="fas fa-gamepad text-[#ff4655]"></i>
                      <span class="text-xs font-bold uppercase tracking-wider text-gray-300">Hồ sơ Game</span>
                    </div>

                    <!-- Riot ID -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Riot ID <span class="text-[#ff4655]">*</span></label>
                      <div class="flex gap-2">
                        <input 
                          v-model="members[currentStep - 1].riotId" 
                          type="text" 
                          required
                          placeholder="Name#TAG (ví dụ: TenZ#NA1)" 
                          class="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200"
                        />
                        <button 
                          type="button" 
                          @click="checkRiotId" 
                          :disabled="!members[currentStep - 1].riotId || !members[currentStep - 1].riotId.includes('#')"
                          class="px-4 py-3 bg-[#ff4655]/10 hover:bg-[#ff4655] border border-[#ff4655]/30 hover:border-transparent text-[#ff4655] hover:text-black font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>Tracker</span>
                        </button>
                      </div>
                    </div>

                    <!-- Peak Rank -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Peak Rank <span class="text-[#ff4655]">*</span></label>
                      <select 
                        v-model="members[currentStep - 1].rankName" 
                        required
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200"
                      >
                        <option value="" disabled class="bg-[#0f172a] text-white">Chọn Peak Rank</option>
                        <option 
                          v-for="rank in rankList" 
                          :key="rank" 
                          :value="rank"
                          class="bg-[#0f172a] text-white"
                        >
                          {{ rank }}
                        </option>
                      </select>
                    </div>

                    <!-- Favorite Agent -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Đặc vụ yêu thích <span class="text-[#ff4655]">*</span></label>
                      <select 
                        v-model="members[currentStep - 1].favoriteAgent" 
                        required
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200"
                      >
                        <option value="" disabled class="bg-[#0f172a] text-white">Chọn đặc vụ</option>
                        <option 
                          v-for="agent in agentList" 
                          :key="agent" 
                          :value="agent"
                          class="bg-[#0f172a] text-white"
                        >
                          {{ agent }}
                        </option>
                      </select>
                    </div>

                    <!-- Preferred Roles -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vai trò sở trường <span class="text-[#ff4655]">*</span></label>
                      <div class="grid grid-cols-2 gap-3">
                        <label 
                          v-for="role in rolesList" 
                          :key="role"
                          class="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[#ff4655]/50 hover:bg-[#ff4655]/5 transition duration-150"
                          :class="{'border-[#ff4655] bg-[#ff4655]/10': members[currentStep - 1].preferredRoles.includes(role)}"
                        >
                          <input 
                            type="checkbox" 
                            :value="role" 
                            v-model="members[currentStep - 1].preferredRoles"
                            class="w-4 h-4 rounded border-gray-300 text-[#ff4655] focus:ring-[#ff4655]"
                          />
                          <span class="text-xs font-bold text-gray-300">{{ role }}</span>
                        </label>
                      </div>
                    </div>

                    <!-- Strengths -->
                    <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Điểm mạnh / Lối chơi</label>
                      <textarea 
                        v-model="members[currentStep - 1].strengths" 
                        placeholder="Mô tả điểm mạnh, lối chơi hoặc kinh nghiệm..."
                        rows="3"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4655] transition duration-200 resize-none"
                      ></textarea>
                    </div>
                  </div>

                </div>

              </div>
            </Transition>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-white/10 gap-4">
              <!-- Back button -->
              <button 
                v-if="currentStep > 1" 
                type="button" 
                @click="prevStep"
                class="flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition duration-200 font-semibold"
              >
                <i class="fas fa-arrow-left"></i> Quay lại
              </button>
              
              <div v-else></div> <!-- Spacer if back button is hidden -->

              <!-- Action buttons group -->
              <div class="flex items-center gap-3 ml-auto">
                <button 
                  type="button" 
                  @click="fillFakeData"
                  class="flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg border border-[#ff4655]/30 hover:border-[#ff4655] bg-[#ff4655]/5 hover:bg-[#ff4655]/10 text-[#ff4655] font-bold transition duration-200"
                >
                  <i class="fas fa-magic animate-pulse"></i> Fake CV
                </button>

                <button 
                  v-if="currentStep < 5" 
                  type="button" 
                  @click="nextStep"
                  class="flex items-center justify-center gap-1.5 px-6 py-3 rounded-lg bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold transition duration-200 shadow-lg shadow-[#ff4655]/30"
                >
                  Tiếp tục <i class="fas fa-arrow-right"></i>
                </button>

                <button 
                  v-else
                  type="submit" 
                  :disabled="submitting"
                  class="flex items-center justify-center gap-1.5 px-6 py-3 rounded-lg bg-[#00f599] hover:bg-[#1efaa6] text-[#0f1923] font-bold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  <span v-if="submitting">Đang lưu...</span>
                  <span v-else>{{ isUpdating ? 'Cập nhật hồ sơ' : 'Gửi đăng ký' }}</span>
                  <i v-if="!submitting" class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayer } from '../composables/usePlayer.js'
import { useTournament } from '../composables/useTournament.js'
import Auth from '../assets/js/auth.js'

const router = useRouter()
const { registerTeam } = usePlayer()
const { tournaments, fetchTournaments } = useTournament()
const tournament = ref(null)

const currentStep = ref(1)
const transitionName = ref('slide-next')
const submitting = ref(false)
const isUpdating = ref(false)
const statusMessage = ref('')
const statusType = ref('error')

const maxPlayers = ref(50) // e.g. 50 teams limit
const playerCount = ref(12) // e.g. 12 teams registered

const isLimitReached = computed(() => {
  if (isUpdating.value) return false
  if (maxPlayers.value === null || maxPlayers.value === undefined) return false
  return playerCount.value >= maxPlayers.value
})

const stepLabels = ['Đội trưởng', 'Thành viên 2', 'Thành viên 3', 'Thành viên 4', 'Thành viên 5']

const fileInputRef = ref(null)
const teamLogoInputRef = ref(null)

const teamName = ref('')
const teamLogo = ref('')
const teamLogoPreview = ref('')
const members = ref(Array.from({ length: 5 }, () => ({
  fullName: '',
  gender: '',
  facebookLink: '',
  riotId: '',
  nickname: '',
  rankName: '',
  preferredRoles: [],
  favoriteAgent: '',
  strengths: '',
  avatar: '',
  avatarPreview: ''
})))

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

const rolesList = ['Duelist', 'Sentinel', 'Initiator', 'Controller']

const agentList = [
  'Astra', 'Breach', 'Brimstone', 'Chamber', 'Clove', 'Cypher', 'Deadlock',
  'Fade', 'Gekko', 'Harbor', 'Iso', 'Jett', 'KAY/O', 'Killjoy', 'Miks',
  'Neon', 'Omen', 'Phoenix', 'Raze', 'Reyna', 'Sage', 'Skye', 'Sova',
  'Tejo', 'Viper', 'Vyse', 'Waylay', 'Yoru'
].sort()

const progressPercent = computed(() => {
  return ((currentStep.value - 1) / 4) * 100
})

const fetchExistingTeam = async () => {
  const currentUser = Auth.getUser()
  if (!currentUser) return

  try {
    const response = await fetch('http://localhost:3000/api/teams')
    if (!response.ok) throw new Error('Không thể tải danh sách đội')
    const teams = await response.json()

    const matchingTeam = teams.find(team => {
      const isUserIdMatch = team.user_id && team.user_id === currentUser.id
      const isCaptainMatch = team.captain && team.captain.nickname.toLowerCase() === currentUser.username.toLowerCase()
      const isMemberMatch = team.members && team.members.some(m => m.nickname.toLowerCase() === currentUser.username.toLowerCase())
      return isUserIdMatch || isCaptainMatch || isMemberMatch
    })

    if (matchingTeam) {
      isUpdating.value = true
      teamName.value = matchingTeam.name || ''
      teamLogo.value = matchingTeam.logo || ''
      teamLogoPreview.value = matchingTeam.logo || ''

      const captain = matchingTeam.captain
      const teamMembersList = captain ? [captain, ...matchingTeam.members] : matchingTeam.members

      for (let i = 0; i < 5; i++) {
        if (teamMembersList[i]) {
          const m = teamMembersList[i]
          let preferredRolesArr = []
          if (m.preferred_role) {
            preferredRolesArr = typeof m.preferred_role === 'string'
              ? m.preferred_role.split(',').map(r => r.trim())
              : Array.isArray(m.preferred_role)
                ? m.preferred_role
                : []
          }
          
          members.value[i] = {
            fullName: m.full_name || '',
            gender: m.gender || '',
            facebookLink: m.facebook_link || '',
            riotId: m.riot_id || '',
            nickname: m.nickname || '',
            rankName: m.rank_name || '',
            preferredRoles: preferredRolesArr,
            favoriteAgent: m.favorite_agent || '',
            strengths: m.strengths || '',
            avatar: m.avatar || '',
            avatarPreview: m.avatar || ''
          }
        }
      }
    }
  } catch (err) {
    console.error("Lỗi khi tải thông tin đội hiện tại:", err)
  }
}

onMounted(async () => {
  await fetchTournaments()
  if (tournaments.value.length > 0) {
    const active = tournaments.value.find(t => t.status === 'register' || t.status === 'running')
    tournament.value = active || tournaments.value[0]
    
    if (tournament.value) {
      maxPlayers.value = tournament.value.max_teams || 50
      playerCount.value = tournament.value.registered_teams_count || 0
    }
  }
  await fetchExistingTeam()
})

function normalizeRiotId(member) {
  if (member.riotId && member.riotId.includes('#')) {
    const parts = member.riotId.split('#')
    member.riotId = parts.map(p => p.trim()).join('#')
  }
}

function checkFacebookLink() {
  const currentMember = members.value[currentStep.value - 1]
  if (!currentMember.facebookLink) return
  let url = currentMember.facebookLink.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  
  const fbRegex = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.com|fb\.me)\/.+/i
  if (!fbRegex.test(url)) {
    statusMessage.value = 'Đường dẫn Facebook không hợp lệ.'
    statusType.value = 'error'
    return
  }
  
  statusMessage.value = ''
  window.open(url, '_blank', 'noopener,noreferrer')
}

function checkRiotId() {
  const currentMember = members.value[currentStep.value - 1]
  if (!currentMember.riotId || !currentMember.riotId.includes('#')) return
  normalizeRiotId(currentMember)
  const url = 'https://tracker.gg/valorant/profile/riot/' + encodeURIComponent(currentMember.riotId.trim()) + '/overview'
  window.open(url, '_blank', 'noopener,noreferrer')
}

function prevStep() {
  if (currentStep.value > 1) {
    transitionName.value = 'slide-prev'
    currentStep.value--
    statusMessage.value = ''
  }
}

// Emits slide-prev or next validation
function goToStep(step) {
  if (step === currentStep.value) return
  
  if (step > currentStep.value) {
    nextStep()
    return
  }

  transitionName.value = 'slide-prev'
  currentStep.value = step
  statusMessage.value = ''
}

function nextStep() {
  statusMessage.value = ''
  
  // Validate team name on step 1
  if (currentStep.value === 1) {
    if (!teamName.value || !teamName.value.trim()) {
      statusMessage.value = 'Vui lòng nhập Tên đội.'
      statusType.value = 'error'
      return
    }
  }

  const currentMember = members.value[currentStep.value - 1]

  // Validate required fields
  if (!currentMember.fullName || !currentMember.gender || !currentMember.facebookLink) {
    statusMessage.value = 'Vui lòng điền đầy đủ các thông tin cá nhân bắt buộc.'
    statusType.value = 'error'
    return
  }

  let url = currentMember.facebookLink.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
    currentMember.facebookLink = url
  }
  
  const fbRegex = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.com|fb\.me)\/.+/i
  if (!fbRegex.test(url)) {
    statusMessage.value = 'Đường dẫn Facebook của tuyển thủ không đúng định dạng.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.riotId || !currentMember.nickname) {
    statusMessage.value = 'Vui lòng nhập Riot ID và Username Discord.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.riotId.includes('#')) {
    statusMessage.value = 'Riot ID phải chứa ký tự # (ví dụ: TenZ#1234)'
    statusType.value = 'error'
    return
  }
  
  normalizeRiotId(currentMember)
  
  const parts = currentMember.riotId.split('#')
  if (!parts[0] || !parts[1]) {
    statusMessage.value = 'Riot ID không hợp lệ. Vui lòng nhập đúng định dạng Tên#Tag.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.rankName) {
    statusMessage.value = 'Vui lòng chọn Peak Rank.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.favoriteAgent) {
    statusMessage.value = 'Vui lòng chọn đặc vụ yêu thích.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.preferredRoles || currentMember.preferredRoles.length === 0) {
    statusMessage.value = 'Vui lòng chọn ít nhất một vai trò sở trường.'
    statusType.value = 'error'
    return
  }

  transitionName.value = 'slide-next'
  currentStep.value++
}

function fillFakeData() {
  const step = currentStep.value;
  const m = members.value[step - 1];
  
  if (step === 1) {
    teamName.value = "Draft Kings Esports";
    m.fullName = "Nguyễn Văn Nam";
    m.gender = "Male";
    m.facebookLink = "https://facebook.com/nam.nguyen";
    m.nickname = "Nam#1234";
    m.riotId = "Nam#VN1";
    m.rankName = "Ascendant 1";
    m.favoriteAgent = "Jett";
    m.preferredRoles = ["Duelist"];
    m.strengths = "Đội trưởng, vai trò Duelist chính.";
  } else if (step === 2) {
    m.fullName = "Trần Huy Khánh";
    m.gender = "Male";
    m.facebookLink = "https://facebook.com/khanh.tran";
    m.nickname = "Khanh#5678";
    m.riotId = "Khanh#VN2";
    m.rankName = "Diamond 3";
    m.favoriteAgent = "Omen";
    m.preferredRoles = ["Controller"];
    m.strengths = "Controller kiểm soát bản đồ tốt.";
  } else if (step === 3) {
    m.fullName = "Lê Minh Hoàng";
    m.gender = "Male";
    m.facebookLink = "https://facebook.com/hoang.le";
    m.nickname = "Hoang#9012";
    m.riotId = "Hoang#VN3";
    m.rankName = "Platinum 2";
    m.favoriteAgent = "Sova";
    m.preferredRoles = ["Initiator"];
    m.strengths = "Khởi tranh thông tin tốt.";
  } else if (step === 4) {
    m.fullName = "Phạm Tuấn Anh";
    m.gender = "Male";
    m.facebookLink = "https://facebook.com/anh.tuan";
    m.nickname = "TuanAnh#3456";
    m.riotId = "TuanAnh#VN4";
    m.rankName = "Gold 3";
    m.favoriteAgent = "Cypher";
    m.preferredRoles = ["Sentinel"];
    m.strengths = "Sentinel bảo vệ khu vực vững chắc.";
  } else if (step === 5) {
    m.fullName = "Vũ Thùy Linh";
    m.gender = "Female";
    m.facebookLink = "https://facebook.com/linh.vu";
    m.nickname = "Linh#7890";
    m.riotId = "Linh#VN5";
    m.rankName = "Silver 3";
    m.favoriteAgent = "Sage";
    m.preferredRoles = ["Sentinel"];
    m.strengths = "Support đồng đội, trị thương.";
  }
  
  statusMessage.value = `Đã tự động điền dữ liệu giả lập cho ${step === 1 ? 'Đội trưởng' : 'Thành viên ' + step}!`;
  statusType.value = 'success';
}

function triggerTeamLogoInput() {
  if (teamLogoInputRef.value) {
    teamLogoInputRef.value.click()
  }
}

function handleTeamLogoChange(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    statusMessage.value = 'Vui lòng chọn một tệp hình ảnh hợp lệ.'
    statusType.value = 'error'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    statusMessage.value = 'Kích thước ảnh quá lớn (tối đa 5MB).'
    statusType.value = 'error'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.src = e.target.result
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const targetSize = 150
      canvas.width = targetSize
      canvas.height = targetSize

      let srcX = 0
      let srcY = 0
      let srcWidth = img.width
      let srcHeight = img.height

      if (img.width > img.height) {
        srcWidth = img.height
        srcX = (img.width - img.height) / 2
      } else {
        srcHeight = img.width
        srcY = (img.height - img.width) / 2
      }

      ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, targetSize, targetSize)
      
      const base64 = canvas.toDataURL('image/jpeg', 0.7)
      teamLogo.value = base64
      teamLogoPreview.value = base64
    }
  }
  reader.readAsDataURL(file)
}

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    statusMessage.value = 'Vui lòng chọn một tệp hình ảnh hợp lệ.'
    statusType.value = 'error'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    statusMessage.value = 'Kích thước ảnh quá lớn (tối đa 5MB).'
    statusType.value = 'error'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.src = e.target.result
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const targetSize = 150
      canvas.width = targetSize
      canvas.height = targetSize

      let srcX = 0
      let srcY = 0
      let srcWidth = img.width
      let srcHeight = img.height

      if (img.width > img.height) {
        srcWidth = img.height
        srcX = (img.width - img.height) / 2
      } else {
        srcHeight = img.width
        srcY = (img.height - img.width) / 2
      }

      ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, targetSize, targetSize)
      
      const base64 = canvas.toDataURL('image/jpeg', 0.7)
      
      const currentMember = members.value[currentStep.value - 1]
      currentMember.avatar = base64
      currentMember.avatarPreview = base64
    }
  }
  reader.readAsDataURL(file)
}

async function handleSubmit() {
  statusMessage.value = ''
  
  // Validate step 5
  const currentMember = members.value[currentStep.value - 1]

  if (!currentMember.fullName || !currentMember.gender || !currentMember.facebookLink) {
    statusMessage.value = 'Vui lòng điền đầy đủ các thông tin cá nhân bắt buộc.'
    statusType.value = 'error'
    return
  }

  let url = currentMember.facebookLink.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
    currentMember.facebookLink = url
  }
  
  const fbRegex = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.com|fb\.me)\/.+/i
  if (!fbRegex.test(url)) {
    statusMessage.value = 'Đường dẫn Facebook của tuyển thủ không đúng định dạng.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.riotId || !currentMember.nickname) {
    statusMessage.value = 'Vui lòng nhập Riot ID và Username Discord.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.riotId.includes('#')) {
    statusMessage.value = 'Riot ID phải chứa ký tự # (ví dụ: TenZ#1234)'
    statusType.value = 'error'
    return
  }
  
  normalizeRiotId(currentMember)
  
  const parts = currentMember.riotId.split('#')
  if (!parts[0] || !parts[1]) {
    statusMessage.value = 'Riot ID không hợp lệ. Vui lòng nhập đúng định dạng Tên#Tag.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.rankName) {
    statusMessage.value = 'Vui lòng chọn Peak Rank.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.favoriteAgent) {
    statusMessage.value = 'Vui lòng chọn đặc vụ yêu thích.'
    statusType.value = 'error'
    return
  }

  if (!currentMember.preferredRoles || currentMember.preferredRoles.length === 0) {
    statusMessage.value = 'Vui lòng chọn ít nhất một vai trò sở trường.'
    statusType.value = 'error'
    return
  }

  // Final check: Validate all preceding members just in case
  for (let i = 0; i < 4; i++) {
    const prev = members.value[i]
    if (!prev.fullName || !prev.gender || !prev.facebookLink || !prev.riotId || !prev.nickname || !prev.rankName || !prev.favoriteAgent || prev.preferredRoles.length === 0) {
      statusMessage.value = `Thông tin thành viên ${i + 1} chưa đầy đủ. Vui lòng kiểm tra lại.`
      statusType.value = 'error'
      currentStep.value = i + 1
      return
    }
  }

  // 1. Payload created for Team (POST /api/teams or equivalent)
  const teamPayload = {
    name: teamName.value,
    logo: teamLogo.value
  }

  // 2. Payloads created for 5 individual players (POST /api/players)
  const playerPayloads = members.value.map((m, idx) => ({
    team_id: "<ID_TEAM_VUA_TAO>",
    riot_id: m.riotId,
    nickname: m.nickname,
    full_name: m.fullName,
    gender: m.gender,
    facebook_link: m.facebookLink,
    favorite_agent: m.favoriteAgent,
    strengths: m.strengths,
    avatar: m.avatar,
    rank_name: m.rankName,
    preferred_role: Array.isArray(m.preferredRoles) ? m.preferredRoles.join(', ') : m.preferredRoles,
    is_captain: idx === 0
  }))

  console.log("=== BƯỚC 1: PAYLOAD TẠO TEAM ===")
  console.log(JSON.stringify(teamPayload, null, 2))

  console.log("=== BƯỚC 2: PAYLOAD TẠO 5 TUYỂN THỦ TUẦN TỰ (GỬI 5 LẦN POST /api/players) ===")
  playerPayloads.forEach((payload, idx) => {
    console.log(`--- Thành viên ${idx + 1} (${idx === 0 ? 'Đội trưởng' : 'Thành viên'}): ---`)
    console.log(JSON.stringify(payload, null, 2))
  })

  // Validate duplicate inputs among members in the form
  const riotIds = members.value.map(m => m.riotId?.toLowerCase().trim()).filter(Boolean)
  if (new Set(riotIds).size !== riotIds.length) {
    statusMessage.value = 'Riot ID của các thành viên không được trùng nhau!'
    statusType.value = 'error'
    return
  }

  const nicknames = members.value.map(m => m.nickname?.toLowerCase().trim()).filter(Boolean)
  if (new Set(nicknames).size !== nicknames.length) {
    statusMessage.value = 'Biệt danh Server (Discord Username) của các thành viên không được trùng nhau!'
    statusType.value = 'error'
    return
  }

  const fbLinks = members.value.map(m => m.facebookLink?.toLowerCase().trim()).filter(Boolean)
  if (new Set(fbLinks).size !== fbLinks.length) {
    statusMessage.value = 'Liên kết Facebook của các thành viên không được trùng nhau!'
    statusType.value = 'error'
    return
  }

  submitting.value = true

  const currentUser = Auth.getUser()
  const submitData = {
    teamName: teamName.value,
    teamLogo: teamLogo.value,
    userId: currentUser ? currentUser.id : null,
    members: members.value.map((m, idx) => ({
      fullName: m.fullName,
      gender: m.gender,
      facebookLink: m.facebookLink,
      riotId: m.riotId,
      discordUsername: m.nickname,
      rankName: m.rankName,
      preferredRoles: m.preferredRoles,
      favoriteAgent: m.favoriteAgent,
      strengths: m.strengths,
      avatar: m.avatar
    }))
  }

  try {
    await registerTeam(submitData)
    
    // Update logged in user role to captain in localStorage so FE updates instantly
    if (currentUser) {
      currentUser.role = 'captain'
      localStorage.setItem('user', JSON.stringify(currentUser))
      window.dispatchEvent(new Event('storage'))
    }

    statusMessage.value = isUpdating.value 
      ? 'Cập nhật thông tin đăng ký đội thành công!' 
      : 'Đăng ký đội tham gia giải đấu thành công!'
    statusType.value = 'success'
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    statusMessage.value = err.message || 'Lỗi khi đăng ký đội tuyển.'
    statusType.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* slide-next: enters from right (+30px), leaves to left (-30px) */
.slide-next-enter-active, .slide-next-leave-active,
.slide-prev-enter-active, .slide-prev-leave-active {
  transition: all 0.3s ease-out;
}

.slide-next-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* slide-prev: enters from left (-30px), leaves to right (+30px) */
.slide-prev-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.35s ease-out forwards;
}

@font-face {
  font-family: 'Valorant';
  src: url('/assets/Chakra_Petch/ChakraPetch-SemiBold.ttf') format('truetype');
}

.font-valorant {
  font-family: 'Valorant', 'Chakra Petch', sans-serif;
}

/* Fix dropdown option colors in browser dark modes */
select option {
  background-color: #0f172a;
  color: #ffffff;
}
</style>
