<template>
  <div class="relative w-full h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl transition-all duration-300 hover:border-[#ff4655]/30">
    <!-- Cyberpunk Decorative Elements -->
    <div class="absolute -right-16 -top-16 w-64 h-64 bg-[#ff4655]/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-[#00f599]/5 rounded-full blur-3xl pointer-events-none"></div>
  
    <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 h-full items-center p-6 md:p-6 gap-6">
      <!-- Left Column: Tournament Info -->
      <div class="md:col-span-8 flex flex-col justify-center text-left">
        <!-- Tournament Tag -->
        <div v-if="!tournament" class="inline-flex items-center px-3 py-1 rounded bg-white/5 border border-white/10 text-gray-500 text-xs font-semibold uppercase tracking-widest w-fit mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
          Đăng ký đóng
        </div>
        <div v-else-if="isLimitReached" class="inline-flex items-center px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold uppercase tracking-widest w-fit mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
          Đã đủ số lượng đội
        </div>
        <div v-else class="inline-flex items-center px-3 py-1 rounded bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs font-semibold uppercase tracking-widest w-fit mb-4 animate-pulse">
          <span class="w-1.5 h-1.5 rounded-full bg-[#ff4655] mr-1.5"></span>
          Đang mở đăng ký
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-extrabold text-white font-valorant tracking-wider mb-3 leading-tight uppercase">
          {{ tournamentName }}
        </h1>

        <!-- Provocation / Call-to-action text -->
        <p class="text-gray-300 text-sm md:text-base mb-6 font-medium max-w-xl italic leading-relaxed">
          {{ tournamentDescription }}
        </p>

        <!-- Details Grid -->
        <div class="flex flex-wrap items-center gap-6 text-sm">
          <div class="flex items-center text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
            <div>
              <span class="block text-[10px] text-gray-500 uppercase font-semibold">Đã đăng ký</span>
              <span class="font-bold text-white">
                {{ tournament ? `${playerCount} / ${maxPlayers} đội` : '0 đội' }}
              </span>
            </div>
          </div>

          <div class="flex items-center text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
            <div>
              <span class="block text-[10px] text-gray-500 uppercase font-semibold">Thời gian bắt đầu</span>
              <span class="font-bold text-white">{{ tournament ? formatDateTime(tournament.start_date) : 'Chưa có lịch' }}</span>
            </div>
          </div>
        </div>
      </div>
 
      <!-- Right Column: Registration CTA Button -->
      <div class="md:col-span-4 flex flex-col items-center md:items-end justify-center gap-3 w-full">
        <div 
          v-if="!tournament"
          class="relative flex justify-center items-center gap-2.5 w-full md:w-auto md:min-w-[200px] px-8 py-5 bg-white/5 border border-white/10 text-gray-500 text-center font-bold text-lg tracking-wider rounded-lg cursor-not-allowed uppercase font-valorant select-none"
        >
          Chưa mở giải đấu
        </div>
        <div 
          v-else-if="isLimitReached"
          class="relative flex justify-center items-center gap-2.5 w-full md:w-auto md:min-w-[200px] px-8 py-5 bg-white/5 border border-white/10 text-gray-500 text-center font-bold text-lg tracking-wider rounded-lg cursor-not-allowed uppercase font-valorant select-none"
        >
          Đủ số lượng đội
        </div>
        <router-link 
          v-else
          :to="buttonLink" 
          class="group relative flex justify-center items-center gap-2.5 w-full md:w-auto md:min-w-[200px] px-8 py-5 bg-[#ff4655] hover:bg-[#ff5e6b] text-white text-center font-bold text-lg tracking-wider rounded-lg shadow-lg shadow-[#ff4655]/30 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
        >
          <!-- Slanted effect layer -->
          <div class="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></div>
          
          <span class="relative z-10 uppercase text-center font-valorant">{{ buttonText }}</span>
          <i class="fas fa-arrow-right relative z-10 transition-transform duration-300 group-hover:translate-x-2"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, computed, onMounted } from 'vue'

const playerCount = ref(0)
const maxPlayers = ref(0)
const tournament = ref(null)

const isLimitReached = computed(() => {
  if (!tournament.value) return true
  if (maxPlayers.value === null || maxPlayers.value === undefined) return false
  return playerCount.value >= maxPlayers.value
})

const tournamentName = computed(() => {
  return tournament.value ? tournament.value.name : 'Chưa có giải đấu active'
})

const tournamentDescription = computed(() => {
  if (tournament.value && tournament.value.description) {
    return tournament.value.description
  }
  return '"Bạn đã sẵn sàng thể hiện kỹ năng, chinh phục đỉnh cao và ghi danh vào lịch sử giải đấu? Đăng ký ngay để chứng tỏ bản lĩnh, thống trị giải đấu và chạm tay vào vương miện!"'
})

const buttonLink = computed(() => {
  return "/register-player"
})

const buttonText = computed(() => {
  return "Đăng ký ngay"
})

function formatDateTime(val) {
  if (!val) return 'Chưa có lịch';
  try {
    const date = new Date(val);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch (e) {
    return 'Chưa có lịch';
  }
}

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/tournaments')
    if (response.ok) {
      const data = await response.json()
      // Find the tournament currently in 'register' status
      const activeTour = data.find(t => t.status === 'register')
      if (activeTour) {
        tournament.value = activeTour
        playerCount.value = activeTour.registered_teams_count || 0
        maxPlayers.value = activeTour.max_teams || 8
      } else {
        tournament.value = null
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải thông tin giải đấu active:', err)
  }
})
</script>
 
<style scoped>
@font-face {
  font-family: 'Valorant';
  src: url('/assets/Chakra_Petch/ChakraPetch-SemiBold.ttf') format('truetype');
}

.font-valorant {
  font-family: 'Valorant', 'Chakra Petch', sans-serif;
}
</style>