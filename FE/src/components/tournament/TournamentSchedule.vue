<template>
  <div class="space-y-8 animate-fadeIn text-left">
    <!-- Messages Alert -->
    <div v-if="successMsg" class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="fas fa-check-circle"></i>
        <span>{{ successMsg }}</span>
      </div>
      <button @click="successMsg = ''" class="hover:text-white transition">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ errorMsg }}</span>
      </div>
      <button @click="errorMsg = ''" class="hover:text-white transition">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Tournament Format Check -->
    <div v-if="tournament && tournament.format !== 'Round Robin' && tournament.format !== 'Swiss'" class="glass-card rounded-2xl p-8 border border-white/5 text-center space-y-4">
      <i class="fas fa-info-circle text-4xl text-[#ff4655] opacity-80"></i>
      <h3 class="text-xl font-bold uppercase tracking-wider font-valorant text-white">Lịch trình thi đấu</h3>
      <p class="text-gray-400 text-sm max-w-md mx-auto">
        Hiện tại hệ thống hỗ trợ xem lịch trình và bảng xếp hạng tự động đối với thể thức <b>Round Robin</b> (Vòng tròn) và <b>Swiss System</b> (Hệ Thụy Sĩ).
      </p>
      <div class="text-xs text-gray-500">Thể thức hiện tại của giải đấu này: {{ tournament.format || 'Khác' }}</div>
    </div>

    <template v-else-if="tournament">
      <!-- Admin Controls Header Banner -->
      <div v-if="isAdmin" class="bg-[#12161f] border border-[#ff4655]/20 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-[#ff4655] text-white text-[9px] font-bold uppercase rounded tracking-wider">ADMIN MODE</span>
            <h4 class="text-white font-bold text-sm uppercase tracking-wider font-valorant">Bảng Điều Hành Giải Đấu</h4>
          </div>
          <p class="text-xs text-gray-400">
            Bạn có quyền xếp cặp thi đấu, điền tỉ số trận đấu, điều chỉnh điểm bảng xếp hạng trực tiếp và chốt vòng bảng.
          </p>
        </div>

        <div class="flex items-center flex-wrap gap-3">
          <!-- Swiss Config Inputs -->
          <div v-if="tournament.format === 'Swiss' && matches.length === 0" class="flex items-center gap-3 bg-white/5 p-2 px-3 rounded-xl border border-white/5">
            <div class="flex items-center gap-1.5 text-xs text-gray-300">
              <span class="font-bold text-[10px] uppercase tracking-wide">Thắng đi tiếp:</span>
              <input 
                type="number" 
                v-model="swissWinsRequired" 
                class="w-10 text-center bg-[#0b0e14] border border-white/10 rounded py-0.5 text-xs text-white font-bold outline-none"
                min="1"
              />
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-300">
              <span class="font-bold text-[10px] uppercase tracking-wide">Thua bị loại:</span>
              <input 
                type="number" 
                v-model="swissLossesRequired" 
                class="w-10 text-center bg-[#0b0e14] border border-white/10 rounded py-0.5 text-xs text-white font-bold outline-none"
                min="1"
              />
            </div>
          </div>

          <!-- Generate Schedule Button -->
          <button 
            @click="handleGenerateSchedule"
            :disabled="actionLoading"
            class="px-4 py-2 bg-gradient-to-r from-[#ff4655] to-[#ff4655]/80 hover:from-[#ff4655]/90 hover:to-[#ff4655]/70 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 shadow-lg shadow-[#ff4655]/10 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="actionLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-random"></i>
            <span>{{ matches.length > 0 ? 'Xếp Lại Cặp Đấu' : 'Xếp Cặp Đấu' }}</span>
          </button>

          <!-- Swiss Next Round Button -->
          <button 
            v-if="tournament.format === 'Swiss' && matches.length > 0 && showNextRoundButton"
            @click="handleGenerateNextRound"
            :disabled="actionLoading"
            class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="actionLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-arrow-right"></i>
            <span>Tạo Vòng Tiếp Theo</span>
          </button>

          <!-- Finalize Standings Button -->
          <button 
            v-if="matches.length > 0 && showFinalizeButton"
            @click="handleFinalizeStandings"
            :disabled="actionLoading"
            class="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="actionLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-lock"></i>
            <span>Chốt Bảng Điểm (Tạo Bán Kết)</span>
          </button>
        </div>
      </div>

      <!-- Lịch Trình Trận Đấu Header Card (Full Width) -->
      <div class="glass-card rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-bold text-white uppercase tracking-wider border-l-2 border-[#ff4655] pl-3 font-valorant">
            Lịch Trình Trận Đấu
          </h3>
          
          <!-- Quick Save Button -->
          <button 
            v-if="isAdmin && editingMatches.size > 0"
            @click="handleSaveAllScores"
            :disabled="actionLoading"
            class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 disabled:opacity-50"
            title="Lưu nhanh tất cả các tỉ số đang sửa"
          >
            <i v-if="actionLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-check-double"></i>
            <span>Lưu nhanh ({{ editingMatches.size }})</span>
          </button>
        </div>
        
        <!-- Round Filter Pills -->
        <div v-if="matches.length > 0" class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 custom-scrollbar">
          <button 
            v-for="r in availableRounds" 
            :key="r.id"
            @click="selectedRound = r.id"
            :class="[
              'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition duration-200 outline-none whitespace-nowrap cursor-pointer',
              selectedRound === r.id 
                ? 'bg-[#ff4655] text-white' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            ]"
          >
            {{ r.name }}
          </button>
        </div>
      </div>

      <!-- Main Columns: Left (Matches List), Right (Standings Board) -->
      <div :class="[ selectedRound === 'playoffs' ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-3 gap-8 items-start' ]">
        
        <!-- Left Side: Matches Schedule (Spans 2 columns, or full width for playoffs) -->
        <div :class="[ selectedRound === 'playoffs' ? 'w-full space-y-6' : 'lg:col-span-2 space-y-6' ]">
          <div class="glass-card rounded-2xl p-6 border border-white/5">

            <!-- Matches List State -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-16">
              <i class="fas fa-spinner fa-spin text-2xl text-[#ff4655] mb-2"></i>
              <p class="text-gray-400 text-xs">Đang tải lịch thi đấu...</p>
            </div>

            <div v-else-if="matches.length === 0" class="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <i class="fas fa-calendar-times text-4xl text-gray-600"></i>
              <h4 class="text-white font-bold text-sm uppercase font-valorant">Chưa có lịch thi đấu</h4>
              <p class="text-gray-400 text-xs max-w-xs mx-auto">
                {{ isAdmin ? 'Ấn vào nút "Xếp Cặp Đấu" ở trên để tự động sắp xếp lịch thi đấu vòng tròn tính điểm cho 8 đội tuyển.' : 'Ban tổ chức đang chuẩn bị lịch thi đấu. Vui lòng quay lại sau.' }}
              </p>
              <div v-if="isAdmin" class="text-[11px] text-amber-500/80 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10">
                Lưu ý: Yêu cầu đủ 8 đội đăng ký tham gia (Hiện có: {{ teams.length }} đội).
              </div>
            </div>

            <!-- Playoff Bracket Layout -->
            <div v-else-if="selectedRound === 'playoffs'" class="py-4 space-y-12">
              
              <!-- Bracket Tree -->
              <div class="overflow-x-auto custom-scrollbar pb-4">
                <div class="min-w-[700px] flex items-center justify-center gap-0 px-4">
                  
                  <!-- Column 1: Semi Finals -->
                  <div class="flex flex-col justify-between h-[340px] w-[300px] shrink-0">
                    
                    <div class="bg-[#12161f]/60 border border-white/5 rounded-2xl p-4 transition duration-300 hover:border-white/15 relative min-h-[130px] h-auto flex flex-col justify-center py-4">
                      <div class="text-[8px] text-gray-500 font-extrabold tracking-widest uppercase mb-1 flex items-center justify-between">
                        <span>Bán kết 1</span>
                        <span v-if="playoffBracket.sf1" class="flex items-center gap-1 font-sans text-[8px] font-bold tracking-normal normal-case text-gray-400">
                          <i class="far fa-calendar-alt text-[#ff4655]/70"></i>
                          {{ formatMatchTime(playoffBracket.sf1.match_time) }}
                        </span>
                      </div>
                      
                      <div v-if="playoffBracket.sf1" class="space-y-1.5">
                        <!-- Team A -->
                        <div class="flex items-center justify-between min-w-0">
                          <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                              <img v-if="playoffBracket.sf1.team_a_logo" :src="playoffBracket.sf1.team_a_logo" class="w-4 h-4 object-contain rounded" />
                              <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                            </div>
                            <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.sf1.status === 'completed' && playoffBracket.sf1.winner_id != playoffBracket.sf1.team_a_id ? 'text-gray-500' : 'text-white'">
                              {{ playoffBracket.sf1.team_a_name || 'Đội tuyển A' }}
                            </span>
                          </div>
                          <span class="text-xs font-black font-valorant" :class="playoffBracket.sf1.status === 'completed' ? (playoffBracket.sf1.winner_id == playoffBracket.sf1.team_a_id ? 'text-[#ff4655]' : 'text-gray-500') : 'text-gray-400'">
                            {{ playoffBracket.sf1.team_a_score }}
                          </span>
                        </div>
                        
                        <!-- Team B -->
                        <div class="flex items-center justify-between min-w-0">
                          <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                              <img v-if="playoffBracket.sf1.team_b_logo" :src="playoffBracket.sf1.team_b_logo" class="w-4 h-4 object-contain rounded" />
                              <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                            </div>
                            <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.sf1.status === 'completed' && playoffBracket.sf1.winner_id != playoffBracket.sf1.team_b_id ? 'text-gray-500' : 'text-white'">
                              {{ playoffBracket.sf1.team_b_name || 'Đội tuyển B' }}
                            </span>
                          </div>
                          <span class="text-xs font-black font-valorant" :class="playoffBracket.sf1.status === 'completed' ? (playoffBracket.sf1.winner_id == playoffBracket.sf1.team_b_id ? 'text-[#ff4655]' : 'text-gray-500') : 'text-gray-400'">
                            {{ playoffBracket.sf1.team_b_score }}
                          </span>
                        </div>

                        <!-- Admin Controls -->
                        <div v-if="isAdmin && isEditingMatch(playoffBracket.sf1.id)" class="space-y-1.5 mt-1.5 pt-1.5 border-t border-white/5">
                          <div class="flex flex-col gap-0.5 w-full text-left">
                            <span class="text-[8px] text-gray-500 uppercase font-bold">Đặt lịch:</span>
                            <input 
                              type="datetime-local" 
                              v-model="matchForm[playoffBracket.sf1.id].match_time"
                              class="w-full bg-[#161a24] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white outline-none font-sans cursor-pointer focus:border-[#ff4655]"
                            />
                          </div>
                          <div class="flex justify-center gap-1">
                            <button 
                              @click="handleSaveMatchScore(playoffBracket.sf1)"
                              :disabled="actionLoading"
                              class="px-2 py-0.5 bg-[#ff4655] hover:bg-[#ff4655]/80 text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                            >
                              Lưu
                            </button>
                            <button 
                              @click="cancelEditMatch(playoffBracket.sf1.id)"
                              class="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>

                        <div v-else-if="isAdmin && playoffBracket.sf1.status === 'pending'" class="border-t border-white/5 pt-1.5 mt-1.5 flex flex-col gap-1.5">
                          <div class="flex gap-1.5 justify-center">
                            <button @click="handleSelectPlayoffWinner(playoffBracket.sf1.id, playoffBracket.sf1.team_a_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] cursor-pointer">
                              {{ playoffBracket.sf1.team_a_name }} thắng
                            </button>
                            <button @click="handleSelectPlayoffWinner(playoffBracket.sf1.id, playoffBracket.sf1.team_b_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] cursor-pointer">
                              {{ playoffBracket.sf1.team_b_name }} thắng
                            </button>
                          </div>
                          <button @click="startEditMatch(playoffBracket.sf1)" class="text-[8px] text-gray-500 hover:text-white transition cursor-pointer self-center">
                            <i class="far fa-calendar-plus mr-1"></i>Đặt lịch thi đấu
                          </button>
                        </div>
                        
                        <div v-else-if="isAdmin && playoffBracket.sf1.status === 'completed'" class="text-center pt-1 border-t border-white/[3%] mt-1">
                          <button @click="startEditMatch(playoffBracket.sf1)" class="text-[8px] text-[#ff4655]/60 hover:text-[#ff4655] transition cursor-pointer">
                            <i class="fas fa-edit mr-1"></i>Sửa kết quả
                          </button>
                        </div>
                      </div>
                      <div v-else class="text-center py-2 text-gray-600 text-xs italic">Chưa xác định</div>
                    </div>

                    <div class="bg-[#12161f]/60 border border-white/5 rounded-2xl p-4 transition duration-300 hover:border-white/15 relative min-h-[130px] h-auto flex flex-col justify-center py-4">
                      <div class="text-[8px] text-gray-500 font-extrabold tracking-widest uppercase mb-1 flex items-center justify-between">
                        <span>Bán kết 2</span>
                        <span v-if="playoffBracket.sf2" class="flex items-center gap-1 font-sans text-[8px] font-bold tracking-normal normal-case text-gray-400">
                          <i class="far fa-calendar-alt text-[#ff4655]/70"></i>
                          {{ formatMatchTime(playoffBracket.sf2.match_time) }}
                        </span>
                      </div>
                      
                      <div v-if="playoffBracket.sf2" class="space-y-1.5">
                        <!-- Team A -->
                        <div class="flex items-center justify-between min-w-0">
                          <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                              <img v-if="playoffBracket.sf2.team_a_logo" :src="playoffBracket.sf2.team_a_logo" class="w-4 h-4 object-contain rounded" />
                              <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                            </div>
                            <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.sf2.status === 'completed' && playoffBracket.sf2.winner_id != playoffBracket.sf2.team_a_id ? 'text-gray-500' : 'text-white'">
                              {{ playoffBracket.sf2.team_a_name || 'Đội tuyển A' }}
                            </span>
                          </div>
                          <span class="text-xs font-black font-valorant" :class="playoffBracket.sf2.status === 'completed' ? (playoffBracket.sf2.winner_id == playoffBracket.sf2.team_a_id ? 'text-[#ff4655]' : 'text-gray-500') : 'text-gray-400'">
                            {{ playoffBracket.sf2.team_a_score }}
                          </span>
                        </div>
                        
                        <!-- Team B -->
                        <div class="flex items-center justify-between min-w-0">
                          <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                              <img v-if="playoffBracket.sf2.team_b_logo" :src="playoffBracket.sf2.team_b_logo" class="w-4 h-4 object-contain rounded" />
                              <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                            </div>
                            <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.sf2.status === 'completed' && playoffBracket.sf2.winner_id != playoffBracket.sf2.team_b_id ? 'text-gray-500' : 'text-white'">
                              {{ playoffBracket.sf2.team_b_name || 'Đội tuyển B' }}
                            </span>
                          </div>
                          <span class="text-xs font-black font-valorant" :class="playoffBracket.sf2.status === 'completed' ? (playoffBracket.sf2.winner_id == playoffBracket.sf2.team_b_id ? 'text-[#ff4655]' : 'text-gray-500') : 'text-gray-400'">
                            {{ playoffBracket.sf2.team_b_score }}
                          </span>
                        </div>

                        <!-- Admin Controls -->
                        <div v-if="isAdmin && isEditingMatch(playoffBracket.sf2.id)" class="space-y-1.5 mt-1.5 pt-1.5 border-t border-white/5">
                          <div class="flex flex-col gap-0.5 w-full text-left">
                            <span class="text-[8px] text-gray-500 uppercase font-bold">Đặt lịch:</span>
                            <input 
                              type="datetime-local" 
                              v-model="matchForm[playoffBracket.sf2.id].match_time"
                              class="w-full bg-[#161a24] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white outline-none font-sans cursor-pointer focus:border-[#ff4655]"
                            />
                          </div>
                          <div class="flex justify-center gap-1">
                            <button 
                              @click="handleSaveMatchScore(playoffBracket.sf2)"
                              :disabled="actionLoading"
                              class="px-2 py-0.5 bg-[#ff4655] hover:bg-[#ff4655]/80 text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                            >
                              Lưu
                            </button>
                            <button 
                              @click="cancelEditMatch(playoffBracket.sf2.id)"
                              class="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>

                        <div v-else-if="isAdmin && playoffBracket.sf2.status === 'pending'" class="border-t border-white/5 pt-1.5 mt-1.5 flex flex-col gap-1.5">
                          <div class="flex gap-1.5 justify-center">
                            <button @click="handleSelectPlayoffWinner(playoffBracket.sf2.id, playoffBracket.sf2.team_a_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] cursor-pointer">
                              {{ playoffBracket.sf2.team_a_name }} thắng
                            </button>
                            <button @click="handleSelectPlayoffWinner(playoffBracket.sf2.id, playoffBracket.sf2.team_b_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] cursor-pointer">
                              {{ playoffBracket.sf2.team_b_name }} thắng
                            </button>
                          </div>
                          <button @click="startEditMatch(playoffBracket.sf2)" class="text-[8px] text-gray-500 hover:text-white transition cursor-pointer self-center">
                            <i class="far fa-calendar-plus mr-1"></i>Đặt lịch thi đấu
                          </button>
                        </div>
                        
                        <div v-else-if="isAdmin && playoffBracket.sf2.status === 'completed'" class="text-center pt-1 border-t border-white/[3%] mt-1">
                          <button @click="startEditMatch(playoffBracket.sf2)" class="text-[8px] text-[#ff4655]/60 hover:text-[#ff4655] transition cursor-pointer">
                            <i class="fas fa-edit mr-1"></i>Sửa kết quả
                          </button>
                        </div>
                      </div>
                      <div v-else class="text-center py-2 text-gray-600 text-xs italic">Chưa xác định</div>
                    </div>

                  </div>

                  <!-- Connector SVG area -->
                  <div class="w-[80px] h-[340px] shrink-0 text-[#ff4655]/20">
                    <svg class="w-full h-full" viewBox="0 0 80 340" fill="none">
                      <!-- Path connecting SF1 (y=65) to Grand Final center (y=170) -->
                      <path d="M 0,65 L 40,65 L 40,170 L 80,170" stroke="currentColor" stroke-width="2" />
                      <!-- Path connecting SF2 (y=275) to Grand Final center (y=170) -->
                      <path d="M 0,275 L 40,275 L 40,170 L 80,170" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>

                  <!-- Column 2: Grand Final -->
                  <div class="flex flex-col justify-center h-[340px] w-[300px] shrink-0">
                    <div class="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center mb-2">CHUNG KẾT 👑</div>
                    
                    <div class="bg-[#1a1c24]/80 border border-yellow-500/20 rounded-2xl p-5 transition duration-300 hover:border-yellow-500/40 relative shadow-xl shadow-yellow-500/[2%] min-h-[150px] h-auto flex flex-col justify-center py-4">
                      
                      <div v-if="playoffBracket.finalMatch" class="space-y-2">
                        <div class="flex items-center justify-between text-[8px] text-gray-500 font-extrabold tracking-widest uppercase mb-1">
                          <span>Chung Kết</span>
                          <span class="flex items-center gap-1 font-sans text-[8px] font-bold tracking-normal normal-case text-gray-400">
                            <i class="far fa-calendar-alt text-yellow-500/70"></i>
                            {{ formatMatchTime(playoffBracket.finalMatch.match_time) }}
                          </span>
                        </div>

                        <!-- Team A -->
                        <div class="flex items-center justify-between min-w-0">
                          <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                              <img v-if="playoffBracket.finalMatch.team_a_logo" :src="playoffBracket.finalMatch.team_a_logo" class="w-4 h-4 object-contain rounded" />
                              <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                            </div>
                            <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.finalMatch.status === 'completed' && playoffBracket.finalMatch.winner_id != playoffBracket.finalMatch.team_a_id ? 'text-gray-500' : 'text-white'">
                              {{ playoffBracket.finalMatch.team_a_name || 'Hạt giống SF1' }}
                            </span>
                          </div>
                          <span class="text-sm font-black font-valorant" :class="playoffBracket.finalMatch.status === 'completed' ? (playoffBracket.finalMatch.winner_id == playoffBracket.finalMatch.team_a_id ? 'text-yellow-400' : 'text-gray-500') : 'text-gray-400'">
                            {{ playoffBracket.finalMatch.team_a_score }}
                          </span>
                        </div>
                        
                        <!-- Team B -->
                        <div class="flex items-center justify-between min-w-0">
                          <div class="flex items-center gap-2 min-w-0">
                            <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                              <img v-if="playoffBracket.finalMatch.team_b_logo" :src="playoffBracket.finalMatch.team_b_logo" class="w-4 h-4 object-contain rounded" />
                              <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                            </div>
                            <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.finalMatch.status === 'completed' && playoffBracket.finalMatch.winner_id != playoffBracket.finalMatch.team_b_id ? 'text-gray-500' : 'text-white'">
                              {{ playoffBracket.finalMatch.team_b_name || 'Hạt giống SF2' }}
                            </span>
                          </div>
                          <span class="text-sm font-black font-valorant" :class="playoffBracket.finalMatch.status === 'completed' ? (playoffBracket.finalMatch.winner_id == playoffBracket.finalMatch.team_b_id ? 'text-yellow-400' : 'text-gray-500') : 'text-gray-400'">
                            {{ playoffBracket.finalMatch.team_b_score }}
                          </span>
                        </div>

                        <!-- Admin Controls -->
                        <div v-if="isAdmin && isEditingMatch(playoffBracket.finalMatch.id)" class="space-y-1.5 mt-1.5 pt-1.5 border-t border-white/5">
                          <div class="flex flex-col gap-0.5 w-full text-left">
                            <span class="text-[8px] text-gray-500 uppercase font-bold">Đặt lịch:</span>
                            <input 
                              type="datetime-local" 
                              v-model="matchForm[playoffBracket.finalMatch.id].match_time"
                              class="w-full bg-[#161a24] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white outline-none font-sans cursor-pointer focus:border-[#ff4655]"
                            />
                          </div>
                          <div class="flex justify-center gap-1">
                            <button 
                              @click="handleSaveMatchScore(playoffBracket.finalMatch)"
                              :disabled="actionLoading"
                              class="px-2 py-0.5 bg-[#ff4655] hover:bg-[#ff4655]/80 text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                            >
                              Lưu
                            </button>
                            <button 
                              @click="cancelEditMatch(playoffBracket.finalMatch.id)"
                              class="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>

                        <div v-else-if="isAdmin && playoffBracket.finalMatch.status === 'pending' && playoffBracket.finalMatch.team_a_id && playoffBracket.finalMatch.team_b_id" class="border-t border-white/5 pt-1.5 mt-1.5 flex flex-col gap-1.5">
                          <div class="flex gap-1.5 justify-center">
                            <button @click="handleSelectPlayoffWinner(playoffBracket.finalMatch.id, playoffBracket.finalMatch.team_a_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-yellow-500/20 bg-white/5 text-gray-300 hover:border-yellow-500 hover:text-yellow-500 cursor-pointer">
                              {{ playoffBracket.finalMatch.team_a_name }} thắng
                            </button>
                            <button @click="handleSelectPlayoffWinner(playoffBracket.finalMatch.id, playoffBracket.finalMatch.team_b_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-yellow-500/20 bg-white/5 text-gray-300 hover:border-yellow-500 hover:text-yellow-500 cursor-pointer">
                              {{ playoffBracket.finalMatch.team_b_name }} thắng
                            </button>
                          </div>
                          <button @click="startEditMatch(playoffBracket.finalMatch)" class="text-[8px] text-gray-500 hover:text-white transition cursor-pointer self-center">
                            <i class="far fa-calendar-plus mr-1"></i>Đặt lịch thi đấu
                          </button>
                        </div>
                        
                        <div v-else-if="isAdmin && playoffBracket.finalMatch.status === 'completed'" class="text-center pt-1 border-t border-white/[3%] mt-1">
                          <button @click="startEditMatch(playoffBracket.finalMatch)" class="text-[8px] text-[#ff4655]/60 hover:text-[#ff4655] transition cursor-pointer">
                            <i class="fas fa-edit mr-1"></i>Sửa kết quả
                          </button>
                        </div>
                      </div>
                      <div v-else class="text-center py-4 text-gray-600 text-xs italic">Đang đợi Bán Kết hoàn thành</div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Third Place Row (Below the Bracket) -->
              <div v-if="playoffBracket.thirdPlaceMatch" class="flex flex-col items-center justify-center pt-4 border-t border-white/5">
                <div class="w-[300px] space-y-2 text-center">
                  <div class="text-[10px] font-black text-gray-500 uppercase tracking-widest">TRANH HẠNG BA 🥉</div>
                  <div class="bg-[#12161f]/40 border border-white/5 rounded-2xl p-4 transition duration-300 hover:border-white/10 relative text-left">
                    
                    <div class="space-y-2">
                      <div class="flex items-center justify-between text-[8px] text-gray-500 font-extrabold tracking-widest uppercase mb-1">
                        <span>Tranh Hạng 3</span>
                        <span v-if="playoffBracket.thirdPlaceMatch" class="flex items-center gap-1 font-sans text-[8px] font-bold tracking-normal normal-case text-gray-400">
                          <i class="far fa-calendar-alt text-[#ff4655]/70"></i>
                          {{ formatMatchTime(playoffBracket.thirdPlaceMatch.match_time) }}
                        </span>
                      </div>

                      <!-- Team A -->
                      <div class="flex items-center justify-between min-w-0">
                        <div class="flex items-center gap-2 min-w-0">
                          <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                            <img v-if="playoffBracket.thirdPlaceMatch.team_a_logo" :src="playoffBracket.thirdPlaceMatch.team_a_logo" class="w-4 h-4 object-contain rounded" />
                            <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                          </div>
                          <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.thirdPlaceMatch.status === 'completed' && playoffBracket.thirdPlaceMatch.winner_id != playoffBracket.thirdPlaceMatch.team_a_id ? 'text-gray-500' : 'text-white'">
                            {{ playoffBracket.thirdPlaceMatch.team_a_name || 'Thua cuộc Bán kết 1' }}
                          </span>
                        </div>
                        <span class="text-sm font-black font-valorant" :class="playoffBracket.thirdPlaceMatch.status === 'completed' ? (playoffBracket.thirdPlaceMatch.winner_id == playoffBracket.thirdPlaceMatch.team_a_id ? 'text-[#ff4655]' : 'text-gray-500') : 'text-gray-400'">
                          {{ playoffBracket.thirdPlaceMatch.team_a_score }}
                        </span>
                      </div>
                      
                      <!-- Team B -->
                      <div class="flex items-center justify-between min-w-0">
                        <div class="flex items-center gap-2 min-w-0">
                          <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                            <img v-if="playoffBracket.thirdPlaceMatch.team_b_logo" :src="playoffBracket.thirdPlaceMatch.team_b_logo" class="w-4 h-4 object-contain rounded" />
                            <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                          </div>
                          <span class="font-bold text-xs truncate uppercase tracking-wider font-valorant" :class="playoffBracket.thirdPlaceMatch.status === 'completed' && playoffBracket.thirdPlaceMatch.winner_id != playoffBracket.thirdPlaceMatch.team_b_id ? 'text-gray-500' : 'text-white'">
                            {{ playoffBracket.thirdPlaceMatch.team_b_name || 'Thua cuộc Bán kết 2' }}
                          </span>
                        </div>
                        <span class="text-sm font-black font-valorant" :class="playoffBracket.thirdPlaceMatch.status === 'completed' ? (playoffBracket.thirdPlaceMatch.winner_id == playoffBracket.thirdPlaceMatch.team_b_id ? 'text-[#ff4655]' : 'text-gray-500') : 'text-gray-400'">
                          {{ playoffBracket.thirdPlaceMatch.team_b_score }}
                        </span>
                      </div>

                      <!-- Admin Controls -->
                      <div v-if="isAdmin && isEditingMatch(playoffBracket.thirdPlaceMatch.id)" class="space-y-1.5 mt-1.5 pt-1.5 border-t border-white/5">
                        <div class="flex flex-col gap-0.5 w-full text-left">
                          <span class="text-[8px] text-gray-500 uppercase font-bold">Đặt lịch:</span>
                          <input 
                            type="datetime-local" 
                            v-model="matchForm[playoffBracket.thirdPlaceMatch.id].match_time"
                            class="w-full bg-[#161a24] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white outline-none font-sans cursor-pointer focus:border-[#ff4655]"
                          />
                        </div>
                        <div class="flex justify-center gap-1">
                          <button 
                            @click="handleSaveMatchScore(playoffBracket.thirdPlaceMatch)"
                            :disabled="actionLoading"
                            class="px-2 py-0.5 bg-[#ff4655] hover:bg-[#ff4655]/80 text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                          >
                            Lưu
                          </button>
                          <button 
                            @click="cancelEditMatch(playoffBracket.thirdPlaceMatch.id)"
                            class="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[8px] font-bold uppercase rounded cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>

                      <div v-else-if="isAdmin && playoffBracket.thirdPlaceMatch.status === 'pending' && playoffBracket.thirdPlaceMatch.team_a_id && playoffBracket.thirdPlaceMatch.team_b_id" class="border-t border-white/5 pt-1.5 mt-1.5 flex flex-col gap-1.5">
                        <div class="flex gap-1.5 justify-center">
                          <button @click="handleSelectPlayoffWinner(playoffBracket.thirdPlaceMatch.id, playoffBracket.thirdPlaceMatch.team_a_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] cursor-pointer">
                            {{ playoffBracket.thirdPlaceMatch.team_a_name }} thắng
                          </button>
                          <button @click="handleSelectPlayoffWinner(playoffBracket.thirdPlaceMatch.id, playoffBracket.thirdPlaceMatch.team_b_id)" class="px-2 py-0.5 text-[8px] font-bold uppercase rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] cursor-pointer">
                            {{ playoffBracket.thirdPlaceMatch.team_b_name }} thắng
                          </button>
                        </div>
                        <button @click="startEditMatch(playoffBracket.thirdPlaceMatch)" class="text-[8px] text-gray-500 hover:text-white transition cursor-pointer self-center">
                          <i class="far fa-calendar-plus mr-1"></i>Đặt lịch thi đấu
                        </button>
                      </div>
                      
                      <div v-else-if="isAdmin && playoffBracket.thirdPlaceMatch.status === 'completed'" class="text-center pt-1 border-t border-white/[3%] mt-1">
                        <button @click="startEditMatch(playoffBracket.thirdPlaceMatch)" class="text-[8px] text-[#ff4655]/60 hover:text-[#ff4655] transition cursor-pointer">
                          <i class="fas fa-edit mr-1"></i>Sửa kết quả
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Render Swiss Matches Grouped by Round & Branch -->
            <div v-else-if="tournament.format === 'Swiss'" class="space-y-8">
              <div v-for="roundGroup in groupedSwissMatches" :key="roundGroup.round" class="space-y-6">
                <!-- Round Header (only show if selectedRound === 'all') -->
                <div v-if="selectedRound === 'all'" class="flex items-center gap-3 border-b border-white/5 pb-2">
                  <h4 class="text-sm font-bold text-white uppercase tracking-wider font-valorant">{{ roundGroup.roundLabel }}</h4>
                  <span class="w-1.5 h-1.5 bg-[#ff4655] rounded-full"></span>
                  <span class="text-[10px] text-gray-500 font-medium">{{ roundGroup.branches.reduce((acc, b) => acc + b.matches.length, 0) }} trận đấu</span>
                </div>

                <!-- Branches within this Round -->
                <div v-for="branch in roundGroup.branches" :key="branch.label" class="space-y-4">
                  <!-- Branch Subheader (only show if round is > 1) -->
                  <div v-if="roundGroup.round > 1" class="flex items-center gap-2 text-[10px] font-bold tracking-wider text-gray-400 bg-white/[2%] p-2 rounded-lg border border-white/5 w-fit">
                    <i class="fas fa-code-branch text-[#ff4655]"></i>
                    <span class="uppercase font-valorant text-white">{{ branch.label }}</span>
                  </div>
                  
                  <!-- Matches in this branch -->
                  <div class="grid grid-cols-1 gap-4">
                    <div 
                      v-for="match in branch.matches" 
                      :key="match.id" 
                      class="bg-[#12161f]/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition duration-300 relative overflow-hidden"
                    >
                      <!-- Decorative background elements -->
                      <div v-if="match.status === 'completed'" class="absolute right-0 top-0 w-24 h-24 bg-[#ff4655]/[0.02] rounded-full blur-2xl pointer-events-none"></div>

                      <!-- Match Header: Status -->
                      <div class="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2.5 mb-4">
                        <div class="flex items-center gap-2">
                          <span class="text-gray-400">Trận {{ match.match_order }}</span>
                          <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
                          <span class="text-gray-400 flex items-center gap-1">
                            <i class="far fa-calendar-alt text-[#ff4655]/70"></i>
                            {{ formatMatchTime(match.match_time) }}
                          </span>
                        </div>
                        <div class="flex items-center gap-1.5" v-if="match.status === 'completed'">
                          <span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-[#ff4655]/10 text-[#ff4655]">
                            Đã kết thúc
                          </span>
                        </div>
                      </div>

                      <!-- Match Score Section -->
                      <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                        
                        <!-- Team A -->
                        <div class="flex items-center gap-3 md:justify-end">
                          <div class="text-left md:text-right min-w-0 flex-1">
                            <div class="font-bold text-sm text-white truncate uppercase tracking-wider font-valorant" :class="{ 'text-gray-500': match.status === 'completed' && match.winner_id && match.winner_id != match.team_a_id }">
                              {{ match.team_a_name || 'Đội tuyển A' }}
                            </div>
                          </div>
                          <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                            <img v-if="match.team_a_logo" :src="match.team_a_logo" class="w-7 h-7 object-contain rounded" />
                            <i v-else class="fas fa-shield-alt text-gray-600 text-lg"></i>
                          </div>
                        </div>

                        <!-- VS and Score displays -->
                        <div class="flex flex-col items-center justify-center py-2 md:py-0 border-y md:border-y-0 md:border-x border-white/5 px-4 space-y-2">
                          <!-- Read-Only Score -->
                          <div v-if="!isAdmin || match.status === 'completed' && !isEditingMatch(match.id)" class="flex items-center gap-4">
                            <span class="text-2xl font-black font-valorant" :class="[ match.status === 'completed' ? (match.winner_id == match.team_a_id ? 'text-white' : 'text-gray-500') : 'text-gray-400' ]">
                              {{ match.team_a_score }}
                            </span>
                            <span class="text-[10px] text-gray-600 font-bold uppercase tracking-wider">VS</span>
                            <span class="text-2xl font-black font-valorant" :class="[ match.status === 'completed' ? (match.winner_id == match.team_b_id ? 'text-white' : 'text-gray-500') : 'text-gray-400' ]">
                              {{ match.team_b_score }}
                            </span>
                          </div>

                          <!-- Admin Editing Score Inputs -->
                          <div v-if="isAdmin && (match.status === 'pending' || isEditingMatch(match.id))" class="space-y-3 w-full border-t border-white/5 pt-3 mt-3">
                            <!-- Schedule/Date-time picker -->
                            <div class="flex flex-col gap-1 w-full text-left">
                              <span class="text-[8px] text-gray-500 uppercase font-bold flex items-center gap-1">
                                <i class="far fa-calendar-alt"></i> Lên lịch thi đấu:
                              </span>
                              <input 
                                type="datetime-local" 
                                v-model="matchForm[match.id].match_time"
                                class="w-full bg-[#161a24] border border-white/10 rounded px-2.5 py-1 text-[10px] text-white outline-none font-sans cursor-pointer focus:border-[#ff4655]"
                              />
                            </div>

                            <!-- Swiss winner selection buttons -->
                            <div class="flex flex-col items-center gap-1.5 w-full">
                              <span class="text-[9px] text-gray-500 uppercase font-bold">Chọn đội thắng (1 - 0):</span>
                              <div class="flex items-center gap-1.5 justify-center w-full">
                                <button 
                                  @click="selectWinnerRR(match.id, 'team_a')"
                                  :class="[
                                    'px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition duration-200 cursor-pointer w-full text-center truncate',
                                    matchForm[match.id]?.team_a_score === 1 
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                      : 'bg-[#1a212d] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                                  ]"
                                >
                                  {{ match.team_a_name }} thắng
                                </button>
                                <button 
                                  @click="selectWinnerRR(match.id, 'team_b')"
                                  :class="[
                                    'px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition duration-200 cursor-pointer w-full text-center truncate',
                                    matchForm[match.id]?.team_b_score === 1 
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                      : 'bg-[#1a212d] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                                  ]"
                                >
                                  {{ match.team_b_name }} thắng
                                </button>
                              </div>
                            </div>

                            <!-- Action Button for Swiss -->
                            <div class="flex justify-center gap-1.5">
                              <button 
                                @click="handleSaveMatchScore(match)"
                                :disabled="actionLoading"
                                class="px-3 py-1 bg-[#ff4655] hover:bg-[#ff4655]/80 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              >
                                <i class="fas fa-save"></i>
                                <span>Lưu</span>
                              </button>
                              <button 
                                v-if="match.status === 'completed'"
                                @click="cancelEditMatch(match.id)"
                                class="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>

                          <!-- Edit Trigger Button for Completed matches -->
                          <button 
                            v-if="isAdmin && match.status === 'completed' && !isEditingMatch(match.id)" 
                            @click="startEditMatch(match)" 
                            class="text-[9px] text-[#ff4655] hover:underline flex items-center gap-1 opacity-60 hover:opacity-100 transition cursor-pointer"
                          >
                            <i class="fas fa-edit"></i>
                            <span>Sửa kết quả</span>
                          </button>
                        </div>

                        <!-- Team B -->
                        <div class="flex items-center gap-3 md:justify-start">
                          <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                            <img v-if="match.team_b_logo" :src="match.team_b_logo" class="w-7 h-7 object-contain rounded" />
                            <i v-else class="fas fa-shield-alt text-gray-600 text-lg"></i>
                          </div>
                          <div class="text-left min-w-0 flex-1">
                            <div class="font-bold text-sm text-white truncate uppercase tracking-wider font-valorant" :class="{ 'text-gray-500': match.status === 'completed' && match.winner_id && match.winner_id != match.team_b_id }">
                              {{ match.team_b_name || (match.team_b_id === null ? 'BYE (Nghỉ đấu)' : 'Đội tuyển B') }}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Render Matches list -->
            <div v-else class="space-y-4">
              <div 
                v-for="match in filteredMatches" 
                :key="match.id" 
                class="bg-[#12161f]/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition duration-300 relative overflow-hidden"
              >
                <!-- Decorative background elements -->
                <div v-if="match.status === 'completed'" class="absolute right-0 top-0 w-24 h-24 bg-[#ff4655]/[0.02] rounded-full blur-2xl pointer-events-none"></div>

                <!-- Match Header: Round & Stage -->
                <div class="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2.5 mb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-400">{{ getMatchStageLabel(match.stage) }}</span>
                    <span v-if="match.stage === 'round_robin' || match.stage === 'swiss'" class="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span v-if="match.stage === 'round_robin' || match.stage === 'swiss'" class="text-gray-400">Vòng {{ match.round }}</span>
                    <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span class="text-gray-400 flex items-center gap-1">
                      <i class="far fa-calendar-alt text-[#ff4655]/70"></i>
                      {{ formatMatchTime(match.match_time) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5" v-if="match.status === 'completed'">
                    <span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-[#ff4655]/10 text-[#ff4655]">
                      Đã kết thúc
                    </span>
                  </div>
                </div>

                <!-- Match Score Section -->
                <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                  
                  <!-- Team A -->
                  <div class="flex items-center gap-3 md:justify-end">
                    <div class="text-left md:text-right min-w-0 flex-1">
                      <div class="font-bold text-sm text-white truncate uppercase tracking-wider font-valorant" :class="{ 'text-gray-500': match.status === 'completed' && match.winner_id && match.winner_id != match.team_a_id }">
                        {{ match.team_a_name || 'Đội tuyển A' }}
                      </div>
                    </div>
                    <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                      <img v-if="match.team_a_logo" :src="match.team_a_logo" class="w-7 h-7 object-contain rounded" />
                      <i v-else class="fas fa-shield-alt text-gray-600 text-lg"></i>
                    </div>
                  </div>

                  <!-- VS and Score displays -->
                  <div class="flex flex-col items-center justify-center py-2 md:py-0 border-y md:border-y-0 md:border-x border-white/5 px-4 space-y-2">
                    <!-- Read-Only Score -->
                    <div v-if="!isAdmin || match.status === 'completed' && !isEditingMatch(match.id)" class="flex items-center gap-4">
                      <span class="text-2xl font-black font-valorant" :class="[ match.status === 'completed' ? (match.winner_id == match.team_a_id ? 'text-white' : 'text-gray-500') : 'text-gray-400' ]">
                        {{ match.team_a_score }}
                      </span>
                      <span class="text-[10px] text-gray-600 font-bold uppercase tracking-wider">VS</span>
                      <span class="text-2xl font-black font-valorant" :class="[ match.status === 'completed' ? (match.winner_id == match.team_b_id ? 'text-white' : 'text-gray-500') : 'text-gray-400' ]">
                        {{ match.team_b_score }}
                      </span>
                    </div>

                    <!-- Admin Editing Score Inputs -->
                    <div v-if="isAdmin && (match.status === 'pending' || isEditingMatch(match.id))" class="space-y-3 w-full border-t border-white/5 pt-3 mt-3">
                      <!-- Schedule/Date-time picker -->
                      <div class="flex flex-col gap-1 w-full text-left">
                        <span class="text-[8px] text-gray-500 uppercase font-bold flex items-center gap-1">
                          <i class="far fa-calendar-alt"></i> Lên lịch thi đấu:
                        </span>
                        <input 
                          type="datetime-local" 
                          v-model="matchForm[match.id].match_time"
                          class="w-full bg-[#161a24] border border-white/10 rounded px-2.5 py-1 text-[10px] text-white outline-none font-sans cursor-pointer focus:border-[#ff4655]"
                        />
                      </div>

                      <!-- Round Robin and Swiss regular match inputs -> Winner selection buttons -->
                      <div v-if="match.stage === 'round_robin' || match.stage === 'swiss'" class="flex flex-col items-center gap-1.5 w-full">
                        <span class="text-[9px] text-gray-500 uppercase font-bold">Chọn đội thắng (1 - 0):</span>
                        <div class="flex items-center gap-1.5 justify-center w-full">
                          <button 
                            @click="selectWinnerRR(match.id, 'team_a')"
                            :class="[
                              'px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition duration-200 cursor-pointer w-full text-center truncate',
                              matchForm[match.id]?.team_a_score === 1 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-[#1a212d] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                            ]"
                          >
                            {{ match.team_a_name }} thắng
                          </button>
                          <button 
                            @click="selectWinnerRR(match.id, 'team_b')"
                            :class="[
                              'px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition duration-200 cursor-pointer w-full text-center truncate',
                              matchForm[match.id]?.team_b_score === 1 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-[#1a212d] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                            ]"
                          >
                            {{ match.team_b_name }} thắng
                          </button>
                        </div>
                      </div>

                      <!-- Playoff match winner selector -->
                      <div v-else class="flex flex-col items-center gap-2">
                        <span class="text-[9px] text-gray-500 uppercase font-bold">Chọn đội đi tiếp:</span>
                        <div class="flex items-center gap-1.5 justify-center w-full">
                          <button 
                            @click="handleSelectPlayoffWinner(match.id, match.team_a_id)"
                            :disabled="actionLoading"
                            class="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] transition duration-200 cursor-pointer disabled:opacity-50"
                          >
                            {{ match.team_a_name }}
                          </button>
                          <button 
                            @click="handleSelectPlayoffWinner(match.id, match.team_b_id)"
                            :disabled="actionLoading"
                            class="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border border-white/10 bg-white/5 text-gray-300 hover:border-[#ff4655] hover:text-[#ff4655] transition duration-200 cursor-pointer disabled:opacity-50"
                          >
                            {{ match.team_b_name }}
                          </button>
                        </div>
                      </div>

                      <!-- Action Button for Round Robin & Swiss -->
                      <div v-if="match.stage === 'round_robin' || match.stage === 'swiss'" class="flex justify-center gap-1.5">
                        <button 
                          @click="handleSaveMatchScore(match)"
                          :disabled="actionLoading"
                          class="px-3 py-1 bg-[#ff4655] hover:bg-[#ff4655]/80 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <i class="fas fa-save"></i>
                          <span>Lưu</span>
                        </button>
                        <button 
                          v-if="match.status === 'completed'"
                          @click="cancelEditMatch(match.id)"
                          class="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>

                    <!-- Edit Trigger Button for Completed matches -->
                    <button 
                      v-if="isAdmin && match.status === 'completed' && !isEditingMatch(match.id)" 
                      @click="startEditMatch(match)" 
                      class="text-[9px] text-[#ff4655] hover:underline flex items-center gap-1 opacity-60 hover:opacity-100 transition cursor-pointer"
                    >
                      <i class="fas fa-edit"></i>
                      <span>Sửa kết quả</span>
                    </button>
                  </div>

                  <!-- Team B -->
                  <div class="flex items-center gap-3 md:justify-start">
                    <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                      <img v-if="match.team_b_logo" :src="match.team_b_logo" class="w-7 h-7 object-contain rounded" />
                      <i v-else class="fas fa-shield-alt text-gray-600 text-lg"></i>
                    </div>
                    <div class="text-left min-w-0 flex-1">
                      <div class="font-bold text-sm text-white truncate uppercase tracking-wider font-valorant" :class="{ 'text-gray-500': match.status === 'completed' && match.winner_id && match.winner_id != match.team_b_id }">
                        {{ match.team_b_name || (match.team_b_id === null && match.stage === 'swiss' ? 'BYE (Nghỉ đấu)' : 'Đội tuyển B') }}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Side: Standings Scoreboard (Spans 1 column, hidden in playoffs) -->
        <div v-if="selectedRound !== 'playoffs'" class="lg:col-span-1 space-y-6">
          <div class="glass-card rounded-2xl p-6 border border-white/5">
            <h3 class="text-lg font-bold text-white uppercase tracking-wider border-l-2 border-[#ff4655] pl-3 font-valorant mb-6">
              Bảng Xếp Hạng Điểm
            </h3>

            <!-- Loading Standing -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-12">
              <i class="fas fa-spinner fa-spin text-xl text-[#ff4655] mb-2"></i>
              <p class="text-gray-400 text-xs">Đang tải xếp hạng...</p>
            </div>

            <!-- Empty Standing -->
            <div v-else-if="teams.length === 0" class="text-center py-12 text-gray-500 text-xs">
              Chưa có thông tin đội tuyển đăng ký.
            </div>

            <!-- Render Standing Table -->
            <div v-else class="space-y-4">
              <div class="w-full overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-white/5 pb-2 text-[9px] text-gray-500 font-extrabold uppercase tracking-wider">
                      <th class="py-2.5 pr-2 w-10 text-center">Hạng</th>
                      <th class="py-2.5">Đội tuyển</th>
                      <th class="py-2.5 w-12 text-center">T/B</th>
                      <th class="py-2.5 w-16 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(team, index) in sortedStandings" 
                      :key="team.id"
                      class="border-b border-white/[2%] hover:bg-white/[1%] transition duration-200"
                    >
                      <!-- Rank -->
                      <td class="py-3 pr-2 text-center">
                        <span 
                          :class="[
                            'w-5 h-5 rounded-full flex items-center justify-center font-black text-xs font-valorant mx-auto',
                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                            index === 1 ? 'bg-slate-300/20 text-slate-300' :
                            index === 2 ? 'bg-amber-600/20 text-amber-500' :
                            'bg-white/5 text-gray-400'
                          ]"
                        >
                          {{ index + 1 }}
                        </span>
                      </td>

                      <!-- Team Name & Logo -->
                      <td class="py-3 flex items-center gap-2 min-w-0 pr-2">
                        <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                          <img v-if="team.logo" :src="team.logo" class="w-4 h-4 object-contain rounded" />
                          <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="font-bold text-xs text-white truncate uppercase tracking-wide block max-w-[120px]" :title="team.name">
                            {{ team.name }}
                          </span>
                          <!-- Swiss Status Badges -->
                          <div v-if="tournament.format === 'Swiss'" class="flex items-center gap-1 mt-0.5">
                            <span v-if="(team.wins || 0) >= swissWinsRequired" class="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-bold uppercase tracking-wide shrink-0">Đủ điều kiện</span>
                            <span v-else-if="(team.losses || 0) >= swissLossesRequired" class="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 rounded font-bold uppercase tracking-wide shrink-0">Bị loại</span>
                            <span v-else class="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 rounded font-bold uppercase tracking-wide shrink-0">Đang đấu</span>
                          </div>
                        </div>
                      </td>

                      <!-- Wins / Losses -->
                      <td class="py-3 text-center">
                        <div v-if="!isAdmin || !isEditingStanding(team.id)" class="text-[11px] text-gray-400 font-bold">
                          {{ team.wins || 0 }}/{{ team.losses || 0 }}
                        </div>
                        <div v-else class="flex items-center gap-1 justify-center">
                          <input 
                            type="number" 
                            v-model="standingForm[team.id].wins"
                            class="w-8 text-center bg-[#1a212d] border border-white/10 rounded py-0.5 text-[10px] font-bold text-white outline-none"
                            min="0"
                          />
                          <span class="text-gray-600">/</span>
                          <input 
                            type="number" 
                            v-model="standingForm[team.id].losses"
                            class="w-8 text-center bg-[#1a212d] border border-white/10 rounded py-0.5 text-[10px] font-bold text-white outline-none"
                            min="0"
                          />
                        </div>
                      </td>

                      <!-- Points -->
                      <td class="py-3 text-center">
                        <!-- Read-only View -->
                        <div v-if="!isAdmin" class="text-sm font-extrabold text-[#ff4655] font-valorant">
                          {{ team.points || 0 }}
                        </div>

                        <!-- Admin View -->
                        <div v-else class="flex items-center justify-center gap-1.5">
                          <template v-if="!isEditingStanding(team.id)">
                            <span class="text-sm font-extrabold text-[#ff4655] font-valorant pr-1">
                              {{ team.points || 0 }}
                            </span>
                            <button 
                              @click="startEditStanding(team)"
                              class="text-[9px] text-gray-500 hover:text-white transition cursor-pointer"
                              title="Chỉnh sửa điểm trực tiếp"
                            >
                              <i class="fas fa-pen"></i>
                            </button>
                          </template>
                          
                          <template v-else>
                            <input 
                              type="number" 
                              v-model="standingForm[team.id].points"
                              class="w-10 text-center bg-[#1a212d] border border-white/10 rounded py-0.5 text-[10px] font-bold text-white outline-none"
                            />
                            <div class="flex items-center gap-0.5">
                              <button 
                                @click="handleSaveTeamStanding(team.id)"
                                :disabled="actionLoading"
                                class="text-emerald-400 hover:text-emerald-300 transition text-[10px] p-0.5 cursor-pointer"
                                  title="Lưu điểm"
                              >
                                <i class="fas fa-check"></i>
                              </button>
                              <button 
                                @click="cancelEditStanding(team.id)"
                                class="text-gray-500 hover:text-gray-300 transition text-[10px] p-0.5 cursor-pointer"
                                title="Hủy"
                              >
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                          </template>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Top 4 cut-off line legend -->
              <div class="text-[10px] text-gray-500 italic mt-4 pt-4 border-t border-white/5 space-y-1">
                <template v-if="tournament.format === 'Swiss'">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500/50"></span>
                    <span>Đội đạt {{ swissWinsRequired }} trận thắng sẽ giành vé đi tiếp vào Bán Kết.</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500/50"></span>
                    <span>Đội nhận {{ swissLossesRequired }} trận thua sẽ bị loại khỏi giải đấu.</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-yellow-500/50"></span>
                    <span>Top 4 đội đầu bảng sẽ giành vé vào vòng Bán Kết.</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500/50"></span>
                    <span>Điểm thắng: +1 điểm, Thua: +0 điểm.</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps({
  tournament: {
    type: Object,
    default: null
  }
})

// Authentication & Roles
const isAdmin = ref(false)
const checkAdminStatus = () => {
  const storedUser = localStorage.getItem("user")
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      isAdmin.value = user.role === 'admin'
    } catch (e) {
      isAdmin.value = false
    }
  } else {
    isAdmin.value = false
  }
}

// Data state
const matches = ref([])
const teams = ref([])
const loading = ref(false)
const actionLoading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

// Selected Round Filter
const selectedRound = ref('all')

const swissWinsRequired = ref(3)
const swissLossesRequired = ref(3)

// Forms for Admin modification
const matchForm = ref({}) // Format: { [matchId]: { team_a_score, team_b_score } }
const editingMatches = ref(new Set())

const standingForm = ref({}) // Format: { [teamId]: { points, wins, losses } }
const editingStandings = ref(new Set())

// Fetching functions
const fetchTeams = async () => {
  if (!props.tournament) return
  try {
    const response = await fetch(`http://localhost:3000/api/teams?tournament_id=${props.tournament.id}`)
    if (response.ok) {
      teams.value = await response.json()
    }
  } catch (err) {
    console.error("Lỗi fetch teams:", err)
  }
}

const fetchMatches = async (isInitial = false) => {
  if (!props.tournament) return
  if (isInitial) loading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/${props.tournament.id}/matches`)
    if (response.ok) {
      matches.value = await response.json()
      
      matches.value.forEach(m => {
        if (!matchForm.value[m.id]) {
          matchForm.value[m.id] = {
            team_a_score: m.team_a_score,
            team_b_score: m.team_b_score,
            match_time: m.match_time ? formatForDateTimeInput(m.match_time) : ''
          }
        } else {
          matchForm.value[m.id].team_a_score = m.team_a_score
          matchForm.value[m.id].team_b_score = m.team_b_score
          if (!editingMatches.value.has(m.id)) {
            matchForm.value[m.id].match_time = m.match_time ? formatForDateTimeInput(m.match_time) : ''
          }
        }
      })
      
      if (isInitial) {
        const hasPlayoffs = matches.value.some(m => m.stage === 'semi_final' || m.stage === 'third_place' || m.stage === 'final')
        if (hasPlayoffs) {
          selectedRound.value = 'playoffs'
        } else {
          selectedRound.value = 'all'
        }
      }
    }
  } catch (err) {
    console.error("Lỗi fetch matches:", err)
  } finally {
    if (isInitial) loading.value = false
  }
}

const formatMatchTime = (timeStr) => {
  if (!timeStr) return 'Chưa đặt lịch'
  const d = new Date(timeStr)
  if (isNaN(d.getTime())) return 'Chưa đặt lịch'
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  return `${hours}:${minutes} - ${day}/${month}/${year}`
}

const formatForDateTimeInput = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  if (isNaN(d.getTime())) return ''
  
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
}

const reloadAllData = async (isInitial = false) => {
  await fetchTeams()
  await fetchMatches(isInitial)
}

// Round Filters logic
const availableRounds = computed(() => {
  const list = [{ id: 'all', name: 'Tất cả' }]
  
  const stages = new Set(matches.value.map(m => m.stage))
  const rounds = new Set(matches.value.filter(m => m.stage === 'round_robin' || m.stage === 'swiss').map(m => m.round))
  
  // Sort round numbers
  const sortedRounds = Array.from(rounds).sort((a, b) => a - b)
  sortedRounds.forEach(r => {
    list.push({ id: `round_${r}`, name: `Vòng ${r}` })
  })

  if (stages.has('semi_final') || stages.has('third_place') || stages.has('final')) {
    list.push({ id: 'playoffs', name: 'Playoffs' })
  }
  
  return list
})

// Filtered matches mapping
const filteredMatches = computed(() => {
  if (selectedRound.value === 'all') {
    return matches.value
  } else if (selectedRound.value === 'playoffs') {
    return matches.value.filter(m => m.stage === 'semi_final' || m.stage === 'third_place' || m.stage === 'final')
  } else if (selectedRound.value.startsWith('round_')) {
    const rNum = parseInt(selectedRound.value.replace('round_', ''), 10)
    return matches.value.filter(m => (m.stage === 'round_robin' || m.stage === 'swiss') && m.round === rNum)
  }
  return matches.value
})

// Helper to calculate team wins/losses before a specific round
const getTeamRecordBeforeRound = (teamId, roundNum) => {
  if (!teamId) return { wins: 0, losses: 0 }
  
  let wins = 0
  let losses = 0
  
  const completedPrevMatches = matches.value.filter(m => 
    m.stage === 'swiss' && 
    m.round < roundNum && 
    m.status === 'completed' &&
    (m.team_a_id == teamId || m.team_b_id == teamId)
  )
  
  completedPrevMatches.forEach(m => {
    if (m.winner_id == teamId) {
      wins++
    } else {
      losses++
    }
  })
  
  return { wins, losses }
}

// Group Swiss Matches by Round and Branch
const groupedSwissMatches = computed(() => {
  if (!props.tournament || props.tournament.format !== 'Swiss' || selectedRound.value === 'playoffs') {
    return []
  }

  // Get matches to display
  const list = filteredMatches.value
  
  // Group by round
  const roundGroups = {}
  list.forEach(m => {
    if (!roundGroups[m.round]) {
      roundGroups[m.round] = []
    }
    roundGroups[m.round].push(m)
  })

  // For each round, group by branch
  const result = []
  const sortedRounds = Object.keys(roundGroups).map(Number).sort((a, b) => a - b)
  
  sortedRounds.forEach(r => {
    const roundMatches = roundGroups[r]
    const branchGroups = {}
    
    roundMatches.forEach(m => {
      // Calculate team A record before this round starts
      const record = getTeamRecordBeforeRound(m.team_a_id, r)
      const branchKey = `${record.wins}-${record.losses}`
      
      if (!branchGroups[branchKey]) {
        branchGroups[branchKey] = {
          label: `Nhánh ${record.wins}-${record.losses}`,
          wins: record.wins,
          losses: record.losses,
          matches: []
        }
      }
      branchGroups[branchKey].matches.push(m)
    })
    
    // Sort branches: higher wins first
    const sortedBranches = Object.values(branchGroups).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      return a.losses - b.losses
    })
    
    result.push({
      round: r,
      roundLabel: `Vòng ${r}`,
      branches: sortedBranches
    })
  })

  return result
})

// Sorted Standings
const sortedStandings = computed(() => {
  if (props.tournament && props.tournament.format === 'Swiss') {
    return [...teams.value].sort((a, b) => {
      const isAQualified = (a.wins || 0) >= swissWinsRequired.value
      const isBQualified = (b.wins || 0) >= swissWinsRequired.value
      const isAEliminated = (a.losses || 0) >= swissLossesRequired.value
      const isBEliminated = (b.losses || 0) >= swissLossesRequired.value
      
      const statusA = isAQualified ? 2 : (isAEliminated ? 0 : 1)
      const statusB = isBQualified ? 2 : (isBEliminated ? 0 : 1)
      
      if (statusA !== statusB) return statusB - statusA // Qualified (2) > Active (1) > Eliminated (0)
      if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0)
      if ((a.losses || 0) !== (b.losses || 0)) return (a.losses || 0) - (b.losses || 0)
      return a.id - b.id
    })
  }

  return [...teams.value].sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0)
    }
    if ((b.wins || 0) !== (a.wins || 0)) {
      return (b.wins || 0) - (a.wins || 0)
    }
    return a.id - b.id
  })
})

const showNextRoundButton = computed(() => {
  if (!props.tournament || props.tournament.format !== 'Swiss') return false
  const swissMatches = matches.value.filter(m => m.stage === 'swiss')
  if (swissMatches.length === 0) return false
  
  const currentRoundNum = Math.max(...swissMatches.map(m => m.round))
  const currentRoundMatches = swissMatches.filter(m => m.round === currentRoundNum)
  const allCompleted = currentRoundMatches.every(m => m.status === 'completed')
  
  const winsRequired = swissWinsRequired.value
  const lossesRequired = swissLossesRequired.value
  const hasActiveTeams = teams.value.some(t => (t.wins || 0) < winsRequired && (t.losses || 0) < lossesRequired)
  
  return allCompleted && hasActiveTeams
})

const showFinalizeButton = computed(() => {
  if (!props.tournament) return false
  if (props.tournament.format === 'Round Robin') {
    return matches.value.some(m => m.stage === 'round_robin')
  }
  if (props.tournament.format === 'Swiss') {
    const swissMatches = matches.value.filter(m => m.stage === 'swiss')
    if (swissMatches.length === 0) return false
    
    const winsRequired = swissWinsRequired.value
    const lossesRequired = swissLossesRequired.value
    const hasActiveTeams = teams.value.some(t => (t.wins || 0) < winsRequired && (t.losses || 0) < lossesRequired)
    
    const currentRoundNum = Math.max(...swissMatches.map(m => m.round))
    const currentRoundMatches = swissMatches.filter(m => m.round === currentRoundNum)
    const allCompleted = currentRoundMatches.every(m => m.status === 'completed')
    
    return allCompleted && !hasActiveTeams
  }
  return false
})

const playoffBracket = computed(() => {
  const sfMatches = matches.value.filter(m => m.stage === 'semi_final')
  const tpMatches = matches.value.filter(m => m.stage === 'third_place')
  const finalMatches = matches.value.filter(m => m.stage === 'final')
  
  return {
    sf1: sfMatches.find(m => m.match_order === 1) || null,
    sf2: sfMatches.find(m => m.match_order === 2) || null,
    finalMatch: finalMatches[0] || null,
    thirdPlaceMatch: tpMatches[0] || null
  }
})

// Playoff standings for top 4
const playoffStandings = computed(() => {
  const sfMatches = matches.value.filter(m => m.stage === 'semi_final')
  const tpMatches = matches.value.filter(m => m.stage === 'third_place')
  const finalMatches = matches.value.filter(m => m.stage === 'final')
  
  const standings = [
    { rank: 1, label: 'Hạng 1 (Vô địch)', team: null },
    { rank: 2, label: 'Hạng 2 (Á quân)', team: null },
    { rank: 3, label: 'Hạng 3', team: null },
    { rank: 4, label: 'Hạng 4', team: null }
  ]
  
  const finalMatch = finalMatches[0]
  if (finalMatch) {
    if (finalMatch.status === 'completed' && finalMatch.winner_id) {
      const winnerId = finalMatch.winner_id
      const loserId = winnerId == finalMatch.team_a_id ? finalMatch.team_b_id : finalMatch.team_a_id
      standings[0].team = teams.value.find(t => t.id == winnerId)
      standings[1].team = teams.value.find(t => t.id == loserId)
    } else {
      standings[0].team = { name: "Chờ Chung Kết", logo: "" }
      standings[1].team = { name: "Chờ Chung Kết", logo: "" }
    }
  }
  
  const tpMatch = tpMatches[0]
  if (tpMatch) {
    if (tpMatch.status === 'completed' && tpMatch.winner_id) {
      const winnerId = tpMatch.winner_id
      const loserId = winnerId == tpMatch.team_a_id ? tpMatch.team_b_id : tpMatch.team_a_id
      standings[2].team = teams.value.find(t => t.id == winnerId)
      standings[3].team = teams.value.find(t => t.id == loserId)
    } else {
      standings[2].team = { name: "Chờ Tranh Hạng 3", logo: "" }
      standings[3].team = { name: "Chờ Tranh Hạng 3", logo: "" }
    }
  }
  
  if (!finalMatch && !tpMatch && sortedStandings.value.length >= 4) {
    standings[0].label = 'Hạt giống 1'
    standings[0].team = sortedStandings.value[0]
    standings[1].label = 'Hạt giống 2'
    standings[1].team = sortedStandings.value[1]
    standings[2].label = 'Hạt giống 3'
    standings[2].team = sortedStandings.value[2]
    standings[3].label = 'Hạt giống 4'
    standings[3].team = sortedStandings.value[3]
  }
  
  return standings
})

// Labels translation
const getMatchStageLabel = (stage) => {
  switch (stage) {
    case 'round_robin': return 'Vòng bảng'
    case 'swiss': return 'Vòng bảng (Swiss)'
    case 'semi_final': return 'Bán kết'
    case 'third_place': return 'Tranh hạng 3'
    case 'final': return 'Chung kết'
    default: return stage
  }
}

// Admin Match Editing status
const isEditingMatch = (matchId) => editingMatches.value.has(matchId)

const startEditMatch = (match) => {
  matchForm.value[match.id] = {
    team_a_score: match.team_a_score,
    team_b_score: match.team_b_score,
    match_time: match.match_time ? formatForDateTimeInput(match.match_time) : ''
  }
  editingMatches.value.add(match.id)
}

const selectWinnerRR = (matchId, winnerSide) => {
  if (!matchForm.value[matchId]) {
    matchForm.value[matchId] = { team_a_score: 0, team_b_score: 0 }
  }
  if (winnerSide === 'team_a') {
    matchForm.value[matchId].team_a_score = 1
    matchForm.value[matchId].team_b_score = 0
  } else {
    matchForm.value[matchId].team_a_score = 0
    matchForm.value[matchId].team_b_score = 1
  }
  editingMatches.value.add(matchId)
}

const handleSaveAllScores = async () => {
  if (editingMatches.value.size === 0) return
  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const promises = Array.from(editingMatches.value).map(async (matchId) => {
      const formData = matchForm.value[matchId]
      if (!formData) return
      
      const payload = {}
      const scoreA = parseInt(formData.team_a_score, 10)
      const scoreB = parseInt(formData.team_b_score, 10)
      
      const isScoreSet = (scoreA === 1 && scoreB === 0) || (scoreA === 0 && scoreB === 1)
      if (isScoreSet) {
        payload.team_a_score = scoreA
        payload.team_b_score = scoreB
        payload.status = 'completed'
      }
      
      payload.match_time = formData.match_time ? new Date(formData.match_time).toISOString() : null
      
      const response = await fetch(`http://localhost:3000/api/tournaments/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || `Lỗi lưu trận đấu.`)
      }
    })
    
    await Promise.all(promises)
    successMsg.value = "Đã lưu tất cả thay đổi thành công!"
    editingMatches.value.clear()
    await reloadAllData()
  } catch (err) {
    errorMsg.value = err.message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    actionLoading.value = false
  }
}

const cancelEditMatch = (matchId) => {
  editingMatches.value.delete(matchId)
  delete matchForm.value[matchId]
}

// Admin Standing Editing status
const isEditingStanding = (teamId) => editingStandings.value.has(teamId)

const startEditStanding = (team) => {
  standingForm.value[team.id] = {
    points: team.points || 0,
    wins: team.wins || 0,
    losses: team.losses || 0
  }
  editingStandings.value.add(team.id)
}

const cancelEditStanding = (teamId) => {
  editingStandings.value.delete(teamId)
  delete standingForm.value[teamId]
}

// Action Handlers
const handleGenerateSchedule = async () => {
  if (!props.tournament) return
  if (matches.value.length > 0) {
    const cf = confirm("Lưu ý: Hành động này sẽ XÓA TOÀN BỘ lịch thi đấu và tỉ số hiện tại của giải đấu và xếp lại từ đầu. Bạn có chắc chắn muốn tiếp tục?")
    if (!cf) return
  }

  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const payload = {}
    if (props.tournament.format === 'Swiss') {
      payload.swissWinsRequired = swissWinsRequired.value
      payload.swissLossesRequired = swissLossesRequired.value
    }

    const response = await fetch(`http://localhost:3000/api/tournaments/${props.tournament.id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Lỗi xếp cặp đấu")
    }
    successMsg.value = data.message || "Xếp cặp đấu thành công!"
    await reloadAllData()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    actionLoading.value = false
  }
}

const handleGenerateNextRound = async () => {
  if (!props.tournament) return
  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/${props.tournament.id}/next-round`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Lỗi tạo vòng đấu tiếp theo")
    }
    successMsg.value = data.message || "Tạo vòng đấu tiếp theo thành công!"
    await reloadAllData()

    // Auto switch to the new round tab
    const swissMatches = matches.value.filter(m => m.stage === 'swiss')
    const nextRoundNum = Math.max(...swissMatches.map(m => m.round))
    if (nextRoundNum > 0) {
      selectedRound.value = `round_${nextRoundNum}`
    }
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    actionLoading.value = false
  }
}

const handleSaveMatchScore = async (match) => {
  const formData = matchForm.value[match.id]
  if (!formData) return

  const payload = {}
  
  const scoreA = parseInt(formData.team_a_score, 10)
  const scoreB = parseInt(formData.team_b_score, 10)
  
  const isScoreSet = (scoreA === 1 && scoreB === 0) || (scoreA === 0 && scoreB === 1)
  
  if (isScoreSet) {
    payload.team_a_score = scoreA
    payload.team_b_score = scoreB
    payload.status = 'completed'
  } else {
    if (match.status === 'completed') {
      errorMsg.value = "Tỉ số trận đấu chỉ có thể là 1-0 hoặc 0-1."
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }

  payload.match_time = formData.match_time ? new Date(formData.match_time).toISOString() : null

  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/matches/${match.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Lỗi lưu trận đấu")
    }
    
    successMsg.value = data.message || "Đã cập nhật trận đấu thành công!"
    editingMatches.value.delete(match.id)
    await reloadAllData()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    actionLoading.value = false
  }
}

const handleSelectPlayoffWinner = async (matchId, winnerId) => {
  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/matches/${matchId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner_id: winnerId })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Lỗi chọn đội thắng")
    }

    successMsg.value = data.message || "Đã lưu đội thắng và tạo trận tiếp theo!"
    await reloadAllData()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    actionLoading.value = false
  }
}

const handleFinalizeStandings = async () => {
  if (!props.tournament) return
  const cf = confirm("Hành động này sẽ CHỐT bảng điểm xếp hạng hiện tại và tạo ra 2 trận Bán kết (1 vs 4, 2 vs 3). Bạn có chắc chắn muốn chốt?")
  if (!cf) return

  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/${props.tournament.id}/finalize`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Lỗi chốt bảng điểm")
    }

    successMsg.value = data.message || "Đã chốt bảng điểm và tạo 2 trận đấu bán kết!"
    await reloadAllData()
    selectedRound.value = 'playoffs'
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    actionLoading.value = false
  }
}

const handleSaveTeamStanding = async (teamId) => {
  const formData = standingForm.value[teamId]
  if (!formData) return

  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/teams/${teamId}/standings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        points: formData.points,
        wins: formData.wins,
        losses: formData.losses
      })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Lỗi cập nhật bảng xếp hạng")
    }

    successMsg.value = data.message || "Đã cập nhật điểm số đội tuyển trực tiếp!"
    editingStandings.value.delete(teamId)
    await reloadAllData()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    actionLoading.value = false
  }
}

// Watchers & Life Cycle Hooks
watch(() => props.tournament, async (newVal) => {
  if (newVal) {
    swissWinsRequired.value = newVal.swiss_wins_required || 3
    swissLossesRequired.value = newVal.swiss_losses_required || 3
    await reloadAllData(true)
  }
}, { immediate: true })

onMounted(async () => {
  checkAdminStatus()
  window.addEventListener("auth-state-changed", checkAdminStatus)
  window.addEventListener("role-changed", checkAdminStatus)
  
  if (props.tournament) {
    await reloadAllData(true)
    
    // Auto populate forms
    matches.value.forEach(m => {
      if (m.status === 'pending') {
        matchForm.value[m.id] = { team_a_score: 0, team_b_score: 0 }
      }
    })
  }
})

onUnmounted(() => {
  window.removeEventListener("auth-state-changed", checkAdminStatus)
  window.removeEventListener("role-changed", checkAdminStatus)
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@font-face {
  font-family: 'Valorant';
  src: url('/assets/Chakra_Petch/ChakraPetch-SemiBold.ttf') format('truetype');
}

.font-valorant {
  font-family: 'Valorant', 'Chakra Petch', sans-serif;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 70, 85, 0.2);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 70, 85, 0.5);
}
</style>
