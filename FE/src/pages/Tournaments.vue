<template>
  <div class="min-h-screen bg-[#0b0e14] text-white">
    <!-- Navigation Sub-tabs -->
    <div class="bg-[#0f131a]/60 border-b border-white/5 sticky top-16 z-40 backdrop-blur-md">
       <div class="max-w-6xl mx-auto px-6">
          <div class="flex space-x-8">
             <button 
               v-for="tab in tabs" 
               :key="tab.id"
               @click="currentTab = tab.id"
               class="py-4 border-b-2 font-bold text-sm transition relative select-none"
               :class="currentTab === tab.id ? 'text-[#ff4655] border-[#ff4655]' : 'text-gray-400 hover:text-white border-transparent'"
             >
                {{ tab.name }}
             </button>
          </div>
       </div>
    </div>

    <!-- Tab Content -->
    <div class="max-w-6xl mx-auto px-6 py-10">
       <div v-if="loading" class="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <div class="w-8 h-8 rounded-full border-2 border-dashed border-[#ff4655] animate-spin"></div>
          <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Đang tải thông tin giải đấu...</span>
       </div>
       
       <div v-else-if="!selectedTournament" class="py-20 text-center text-gray-500">
          <p class="text-lg font-bold text-white">Không tìm thấy giải đấu nào</p>
          <p class="text-sm mt-1">Vui lòng tạo giải đấu mới trong trang quản trị Admin trước.</p>
       </div>

       <!-- Tab: Thông tin (Info) -->
       <div v-else-if="currentTab === 'info'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
          <!-- Left Column: Details & Rules -->
          <div class="lg:col-span-8 space-y-8">
             <!-- Card: General Info -->
             <div class="bg-[#0f131a]/40 border border-white/5 rounded-2xl p-6 space-y-6">
                <h3 class="text-lg font-bold uppercase tracking-wider text-white border-l-4 border-[#ff4655] pl-3">Thông Tin Chi Tiết</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                   <div class="bg-white/2 border border-white/5 p-4 rounded-xl space-y-1">
                      <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Thể thức thi đấu</span>
                      <span class="text-base text-white font-extrabold block">{{ selectedTournament.format || 'Double Elimination' }}</span>
                   </div>
                   <div class="bg-white/2 border border-white/5 p-4 rounded-xl space-y-1">
                      <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Số đội tối đa</span>
                      <span class="text-base text-white font-extrabold block">{{ selectedTournament.max_teams || 8 }} Đội tuyển</span>
                   </div>
                   <div class="bg-white/2 border border-white/5 p-4 rounded-xl space-y-1">
                      <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Ngày khởi tranh</span>
                      <span class="text-base text-white font-extrabold block">{{ formatDate(selectedTournament.start_date) }}</span>
                   </div>
                   <div class="bg-white/2 border border-white/5 p-4 rounded-xl space-y-1">
                      <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Ngày kết thúc</span>
                      <span class="text-base text-white font-extrabold block">{{ formatDate(selectedTournament.end_date) }}</span>
                   </div>
                </div>
             </div>

             <!-- Card: Rules & Format Explanation -->
             <div class="bg-[#0f131a]/40 border border-white/5 rounded-2xl p-6 space-y-6">
                <h3 class="text-lg font-bold uppercase tracking-wider text-white border-l-4 border-[#ff4655] pl-3">Quy Tắc Và Thể Lệ</h3>
                <div class="space-y-4 text-sm text-gray-300 leading-relaxed font-semibold">
                   <p>1. <strong>Đăng ký:</strong> Mỗi đội đăng ký tham gia phải có đúng 5 thành viên chính thức. Chỉ Đội trưởng mới được quyền đại diện đăng ký đội.</p>
                   <p>2. <strong>Riot ID chính xác:</strong> Mọi thành viên phải cung cấp Riot ID chính xác theo cấu trúc <code>Name#Tag</code> (ví dụ: <code>Tennguoichoi#VN1</code>). Việc nhập sai Riot ID có thể dẫn đến việc hủy tư cách tham gia đấu.</p>
                   <p>3. <strong>Thời gian thi đấu:</strong> Các đội phải có mặt trong phòng đấu trước 15 phút so với lịch thi đấu đã ấn định. Đội nào trễ quá 10 phút sẽ bị xử thua trận đấu đó.</p>
                   <p>4. <strong>Gian lận & Cư xử:</strong> Tuyệt đối nghiêm cấm mọi phần mềm bên thứ ba hack/cheat hoặc hành vi thiếu tôn trọng, lăng mạ đối thủ. Ban Tổ Chức (Admin) có quyền loại trực tiếp bất cứ đội tuyển nào vi phạm.</p>
                </div>
             </div>
          </div>

          <!-- Right Column: Sidebar (Prize & Timeline) -->
          <div class="lg:col-span-4 space-y-8">
             <!-- Prize Pool Card -->
             <div class="bg-[#0f131a]/60 border border-[#00f599]/20 rounded-2xl p-6 text-center shadow-lg shadow-[#00f599]/5 relative overflow-hidden">
                <div class="absolute -right-8 -top-8 w-24 h-24 bg-[#00f599]/10 rounded-full blur-xl pointer-events-none"></div>
                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tổng giải thưởng</span>
                <span class="text-3xl font-black font-valorant text-[#00f599] tracking-wider uppercase">
                   {{ selectedTournament.prize_pool || 'Chưa công bố' }}
                </span>
                <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase">
                   <svg class="w-4 h-4 text-[#00f599]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V7"></path>
                   </svg>
                   Tiền mặt + Quà lưu niệm
                </div>
             </div>

             <!-- Timeline Card -->
             <div class="bg-[#0f131a]/40 border border-white/5 rounded-2xl p-6 space-y-6">
                <h3 class="text-sm font-bold uppercase tracking-widest text-gray-400">Tiến Trình Giải Đấu</h3>
                <div class="space-y-6 relative pl-6 border-l-2 border-white/5">
                   <!-- Step 1: Upcoming -->
                   <div class="relative">
                      <div 
                        class="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
                        :class="selectedTournament.status === 'upcoming' ? 'bg-[#ff4655] border-[#ff4655]' : 'bg-[#0f131a] border-white/10 text-gray-500'"
                      >
                         <span v-if="selectedTournament.status === 'upcoming'">&bull;</span>
                      </div>
                      <h4 class="text-sm font-bold" :class="selectedTournament.status === 'upcoming' ? 'text-[#ff4655]' : 'text-gray-400'">Chuẩn Bị Giải Đấu</h4>
                      <p class="text-xs text-gray-500 mt-0.5">Lên kế hoạch và truyền thông thông tin giải đấu.</p>
                   </div>
                   
                   <!-- Step 2: Register -->
                   <div class="relative">
                      <div 
                        class="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
                        :class="selectedTournament.status === 'register' ? 'bg-[#ff4655] border-[#ff4655]' : 'bg-[#0f131a] border-white/10 text-gray-500'"
                      >
                         <span v-if="selectedTournament.status === 'register'">&bull;</span>
                      </div>
                      <h4 class="text-sm font-bold" :class="selectedTournament.status === 'register' ? 'text-[#ff4655]' : 'text-gray-400'">Mở Cổng Đăng Ký</h4>
                      <p class="text-xs text-gray-500 mt-0.5">Các đội tuyển đăng ký tham gia thi đấu.</p>
                   </div>

                   <!-- Step 3: Running -->
                   <div class="relative">
                      <div 
                        class="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
                        :class="selectedTournament.status === 'running' ? 'bg-[#ff4655] border-[#ff4655]' : 'bg-[#0f131a] border-white/10 text-gray-500'"
                      >
                         <span v-if="selectedTournament.status === 'running'">&bull;</span>
                      </div>
                      <h4 class="text-sm font-bold" :class="selectedTournament.status === 'running' ? 'text-[#ff4655]' : 'text-gray-400'">Đang Thi Đấu</h4>
                      <p class="text-xs text-gray-500 mt-0.5">Các trận tranh tài diễn ra gay cấn.</p>
                   </div>

                   <!-- Step 4: Finished -->
                   <div class="relative">
                      <div 
                        class="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
                        :class="selectedTournament.status === 'finished' ? 'bg-[#ff4655] border-[#ff4655]' : 'bg-[#0f131a] border-white/10 text-gray-500'"
                      >
                         <span v-if="selectedTournament.status === 'finished'">&bull;</span>
                      </div>
                      <h4 class="text-sm font-bold" :class="selectedTournament.status === 'finished' ? 'text-[#ff4655]' : 'text-gray-400'">Kết Thúc & Trao Giải</h4>
                      <p class="text-xs text-gray-500 mt-0.5">Vinh danh nhà vô địch và trao thưởng.</p>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <!-- Tab Placeholder for Others -->
       <div v-else class="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-4">
          <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
             <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096L9 21zm0 0h-9m11.813-15.904L15 21m0 0l-.813-5.096L15 21zm0 0h9"></path>
             </svg>
          </div>
          <p class="font-bold text-lg text-white">Nội dung đang được thiết kế</p>
          <p class="text-sm max-w-sm">Mục "{{ tabs.find(t => t.id === currentTab).name }}" sẽ sớm được tích hợp dữ liệu ở phiên bản tiếp theo.</p>
          <button @click="currentTab = 'info'" class="mt-2 px-4 py-2 rounded-lg bg-[#ff4655] hover:bg-[#ff5e6b] text-white text-xs font-bold transition">
             Quay lại trang Thông tin
          </button>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTournament } from '../composables/useTournament.js'

const { tournaments, loading, fetchTournaments } = useTournament()

const selectedTournament = ref(null)
const currentTab = ref('info')

const tabs = [
  { id: 'info', name: 'Thông tin' },
  { id: 'teams', name: 'Đội tuyển' },
  { id: 'matches', name: 'Lịch đấu' },
  { id: 'stats', name: 'Thống kê' }
]

const statusList = [
  { value: 'upcoming', label: 'Sắp diễn ra', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'register', label: 'Mở đăng ký', color: 'bg-[#00f599]/10 text-[#00f599] border-[#00f599]/20 animate-pulse' },
  { value: 'running', label: 'Đang diễn ra', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'finished', label: 'Đã kết thúc', color: 'bg-white/5 text-gray-400 border-white/10' }
]

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

onMounted(async () => {
  await fetchTournaments()
  if (tournaments.value.length > 0) {
    const active = tournaments.value.find(t => t.status === 'register' || t.status === 'running')
    selectedTournament.value = active || tournaments.value[0]
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@font-face {
  font-family: 'Valorant';
  src: url('/assets/Chakra_Petch/ChakraPetch-SemiBold.ttf') format('truetype');
}

.font-valorant {
  font-family: 'Valorant', 'Chakra Petch', sans-serif;
}
</style>
