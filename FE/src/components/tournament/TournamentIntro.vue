<template>
  <div class="space-y-8 animate-fadeIn">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 bg-[#0b141d]/50 border border-white/5 rounded-2xl">
      <i class="fas fa-spinner fa-spin text-2xl text-[#ff4655] mb-2"></i>
      <p class="text-gray-400 text-xs sm:text-sm">Đang tải thông tin giải đấu...</p>
    </div>

    <template v-else-if="tournament">
      <!-- Hero Grid: Left side detailed text, Right side main stats card -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Column 1 & 2: Detailed Introduction Text -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 md:p-8 border border-white/5 text-left relative overflow-hidden">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-[#ff4655]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white font-valorant uppercase tracking-wider leading-tight">
            {{ tournament.name }}
          </h2>
          
          <p class="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium border-l-2 border-[#ff4655] pl-4 italic my-4">
            {{ tournament.description || 'Giải đấu Valorant do DK GROUP tổ chức.' }}
          </p>

          <div class="text-gray-400 text-xs sm:text-sm leading-relaxed space-y-4 pt-2">
            <p>
              Chào mừng toàn thể các tuyển thủ và người hâm mộ đến với giải đấu <b>{{ tournament.name }}</b>. Đây là sự kiện Esports bán chuyên được thiết kế nhằm xây dựng, gắn kết cộng đồng người chơi Valorant chuyên nghiệp và tạo cơ hội tranh tài gay cấn, thể hiện tư duy chiến thuật đỉnh cao của các đội tuyển.
            </p>
            <p>
              Giải đấu áp dụng thể thức thi đấu chuẩn hóa kết hợp cùng cơ chế độc đáo, nơi các Đội trưởng sẽ cân não chọn lựa đồng đội từ bể tuyển thủ chất lượng. Mọi diễn biến xếp hạng tuyển thủ, sơ tuyển, và quá trình chia đội đều được quản lý tự động và trực quan hóa hoàn toàn trên hệ thống nhằm đảm bảo sự minh bạch và công bằng tối đa cho mọi cá nhân tham gia giải đấu.
            </p>
            <p>
              Hãy sẵn sàng để chứng kiến những loạt trận đấu căng thẳng, những tình huống lật kèo kinh điển và cùng tôn vinh nhà vô địch của mùa giải!
            </p>
          </div>
        </div>

        <!-- Column 3: Stats Grid -->
        <div class="glass-card rounded-2xl p-6 border border-white/5 text-left flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-white uppercase tracking-wider border-l-2 border-[#ff4655] pl-3 mb-6 font-valorant">
              Thông tin giải đấu
            </h3>
            
            <div class="space-y-4">
              <div class="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-gray-500 uppercase font-semibold block">Số lượng tuyển thủ</span>
                  <span class="text-lg font-bold text-white font-valorant">{{ tournament.max_players || '30' }} Slots</span>
                </div>
                <i class="fas fa-users text-[#ff4655] text-xl opacity-80"></i>
              </div>

              <div class="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-gray-500 uppercase font-semibold block">Trạng thái hiện tại</span>
                  <span class="text-sm font-bold text-[#ff4655] uppercase tracking-wider font-valorant">
                    {{ getStatusLabel(tournament.status) }}
                  </span>
                </div>
                <i class="fas fa-info-circle text-[#ff4655] text-xl opacity-80 animate-pulse"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Roadmap Section -->
      <div class="glass-card rounded-2xl p-6 md:p-8 border border-white/5 text-left space-y-6">
        <h3 class="text-lg font-bold text-white uppercase tracking-wider border-l-2 border-[#ff4655] pl-3 font-valorant">
          Lộ trình giải đấu
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <!-- Phase 1: Chuẩn bị -->
          <div class="bg-white/[2%] border border-white/5 rounded-xl p-4 space-y-3 relative z-10 hover:border-[#ff4655]/30 transition duration-300">
            <div class="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">1</div>
            <div>
              <span class="text-[9px] text-gray-500 uppercase font-semibold tracking-wider block">Giai đoạn 1</span>
              <h4 class="text-xs font-bold text-white uppercase tracking-wide font-valorant mt-0.5">Chuẩn bị giải đấu</h4>
            </div>
            <p class="text-[11px] text-gray-400 leading-relaxed">Lên kế hoạch, hoàn thiện luật và chuẩn bị hệ thống giải đấu.</p>
            <div class="text-[10px] font-bold text-cyan-400 pt-1 border-t border-white/5 mt-2">
              01/06/2026 – 09/06/2026
            </div>
          </div>

          <!-- Phase 2: Đăng ký -->
          <div class="bg-white/[2%] border border-white/5 rounded-xl p-4 space-y-3 relative z-10 hover:border-[#ff4655]/30 transition duration-300">
            <div class="w-8 h-8 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">2</div>
            <div>
              <span class="text-[9px] text-gray-500 uppercase font-semibold tracking-wider block">Giai đoạn 2</span>
              <h4 class="text-xs font-bold text-white uppercase tracking-wide font-valorant mt-0.5">Đăng ký tuyển thủ</h4>
            </div>
            <p class="text-[11px] text-gray-400 leading-relaxed">Tuyển thủ đăng ký thông tin cá nhân và Riot ID trên hệ thống.</p>
            <div class="text-[10px] font-bold text-amber-400 pt-1 border-t border-white/5 mt-2">
              10/06/2026 – 27/06/2026
            </div>
          </div>

          <!-- Phase 3: Thi đấu -->
          <div class="bg-white/[2%] border border-white/5 rounded-xl p-4 space-y-3 relative z-10 hover:border-[#ff4655]/30 transition duration-300">
            <div class="w-8 h-8 rounded-full bg-orange-950/50 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs">3</div>
            <div>
              <span class="text-[9px] text-gray-500 uppercase font-semibold tracking-wider block">Giai đoạn 3</span>
              <h4 class="text-xs font-bold text-white uppercase tracking-wide font-valorant mt-0.5">Thi đấu chính thức</h4>
            </div>
            <p class="text-[11px] text-gray-400 leading-relaxed">Khởi tranh loạt trận vòng bảng Swiss & vòng loại trực tiếp Playoffs.</p>
            <div class="text-[10px] font-bold text-orange-400 pt-1 border-t border-white/5 mt-2">
              Từ 01/08/2026
            </div>
          </div>

          <!-- Phase 4: Kết thúc -->
          <div class="bg-white/[2%] border border-[#ff4655]/30 rounded-xl p-4 space-y-3 relative z-10 hover:border-[#ff4655] transition duration-300">
            <div class="w-8 h-8 rounded-full bg-rose-950/50 border border-[#ff4655]/30 text-[#ff4655] flex items-center justify-center font-bold text-xs animate-pulse">4</div>
            <div>
              <span class="text-[9px] text-gray-500 uppercase font-semibold tracking-wider block">Giai đoạn 4</span>
              <h4 class="text-xs font-bold text-white uppercase tracking-wide font-valorant mt-0.5">Kết thúc & Trao giải</h4>
            </div>
            <p class="text-[11px] text-gray-400 leading-relaxed">Bế mạc giải đấu, vinh danh nhà vô địch và trao thưởng.</p>
            <div class="text-[10px] font-bold text-[#ff4655] pt-1 border-t border-white/5 mt-2 animate-pulse">
              Cuối tháng 08/2026
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  tournament: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const statusList = [
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'register', label: 'Mở đăng ký' },
  { value: 'running', label: 'Đang diễn ra' },
  { value: 'finished', label: 'Đã kết thúc' }
]

const getStatusLabel = (statusValue) => {
  const st = statusList.find(s => s.value === statusValue)
  return st ? st.label : statusValue
}
</script>
