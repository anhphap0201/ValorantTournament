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
    <div v-if="tournament && tournament.format !== 'Round Robin'" class="glass-card rounded-2xl p-8 border border-white/5 text-center space-y-4">
      <i class="fas fa-info-circle text-4xl text-[#ff4655] opacity-80"></i>
      <h3 class="text-xl font-bold uppercase tracking-wider font-valorant text-white">Lịch trình thi đấu</h3>
      <p class="text-gray-400 text-sm max-w-md mx-auto">
        Hiện tại hệ thống chỉ hỗ trợ xem lịch trình và bảng xếp hạng tự động đối với các giải đấu áp dụng thể thức <b>Round Robin</b> (Vòng tròn tính điểm).
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

        <div class="flex flex-wrap gap-3">
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

          <!-- Finalize Standings Button -->
          <button 
            v-if="matches.length > 0"
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

      <!-- Main Columns: Left (Matches List), Right (Standings Board) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <!-- Left Side: Matches Schedule (Spans 2 columns) -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-2xl p-6 border border-white/5">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 mb-6 gap-4">
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
                    <span v-if="match.stage === 'round_robin'" class="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span v-if="match.stage === 'round_robin'" class="text-gray-400">Vòng {{ match.round }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span 
                      :class="[
                        'px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide',
                        match.status === 'completed' ? 'bg-[#ff4655]/10 text-[#ff4655]' : 'bg-white/5 text-gray-400'
                      ]"
                    >
                      {{ match.status === 'completed' ? 'Đã kết thúc' : 'Chưa diễn ra' }}
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
                      <span v-if="match.status === 'completed' && match.winner_id == match.team_a_id" class="text-[8px] text-emerald-400 font-extrabold tracking-widest uppercase">CHIẾN THẮNG</span>
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
                    <div v-if="isAdmin && (match.status === 'pending' || isEditingMatch(match.id))" class="space-y-3 w-full">
                      <!-- Round Robin regular match inputs -> Winner selection buttons -->
                      <div v-if="match.stage === 'round_robin'" class="flex flex-col items-center gap-1.5 w-full">
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

                      <!-- Action Button for Round Robin -->
                      <div v-if="match.stage === 'round_robin'" class="flex justify-center gap-1.5">
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
                        {{ match.team_b_name || 'Đội tuyển B' }}
                      </div>
                      <span v-if="match.status === 'completed' && match.winner_id == match.team_b_id" class="text-[8px] text-emerald-400 font-extrabold tracking-widest uppercase">CHIẾN THẮNG</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Side: Standings Scoreboard (Spans 1 column) -->
        <div class="space-y-6">
          <div class="glass-card rounded-2xl p-6 border border-white/5">
            <h3 class="text-lg font-bold text-white uppercase tracking-wider border-l-2 border-[#ff4655] pl-3 font-valorant mb-6">
              {{ selectedRound === 'playoffs' ? 'Bảng Xếp Hạng Playoffs' : 'Bảng Xếp Hạng Điểm' }}
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

            <!-- Playoffs Standings Table (Top 4) -->
            <div v-else-if="selectedRound === 'playoffs'" class="space-y-4">
              <div class="w-full overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-white/5 pb-2 text-[9px] text-gray-500 font-extrabold uppercase tracking-wider">
                      <th class="py-2.5 pr-2 w-10 text-center">Hạng</th>
                      <th class="py-2.5">Đội tuyển</th>
                      <th class="py-2.5 text-right">Danh hiệu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="item in playoffStandings" 
                      :key="item.rank"
                      class="border-b border-white/[2%] hover:bg-white/[1%] transition duration-200"
                    >
                      <!-- Rank -->
                      <td class="py-3 pr-2 text-center font-valorant font-bold text-sm text-gray-400">
                        {{ item.rank }}
                      </td>

                      <!-- Team Name & Logo -->
                      <td class="py-3 flex items-center gap-2 min-w-0 pr-2">
                        <template v-if="item.team && item.team.name">
                          <div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                            <img v-if="item.team.logo" :src="item.team.logo" class="w-4 h-4 object-contain rounded" />
                            <i v-else class="fas fa-shield-alt text-gray-600 text-xs"></i>
                          </div>
                          <span class="font-bold text-xs text-white truncate uppercase tracking-wide block max-w-[120px]" :title="item.team.name">
                            {{ item.team.name }}
                          </span>
                        </template>
                        <span v-else class="italic text-gray-500 text-xs">Chưa xác định</span>
                      </td>

                      <!-- Honor / Crown Icon -->
                      <td class="py-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <span v-if="item.rank === 1 && item.team && item.team.id" class="text-yellow-400 text-sm animate-bounce" title="Vương miện Vô Địch">👑</span>
                          <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {{ item.label }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                        <span class="font-bold text-xs text-white truncate uppercase tracking-wide block max-w-[120px]" :title="team.name">
                          {{ team.name }}
                        </span>
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
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-yellow-500/50"></span>
                  <span>Top 4 đội đầu bảng sẽ giành vé vào vòng Bán Kết.</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-rose-500/50"></span>
                  <span>Điểm thắng: +1 điểm, Thua: +0 điểm.</span>
                </div>
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

const reloadAllData = async (isInitial = false) => {
  await fetchTeams()
  await fetchMatches(isInitial)
}

// Round Filters logic
const availableRounds = computed(() => {
  const list = [{ id: 'all', name: 'Tất cả' }]
  
  const stages = new Set(matches.value.map(m => m.stage))
  const rounds = new Set(matches.value.filter(m => m.stage === 'round_robin').map(m => m.round))
  
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
    return matches.value.filter(m => m.stage === 'round_robin' && m.round === rNum)
  }
  return matches.value
})

// Sorted Standings
const sortedStandings = computed(() => {
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
    team_b_score: match.team_b_score
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
      
      const scoreA = parseInt(formData.team_a_score, 10)
      const scoreB = parseInt(formData.team_b_score, 10)
      
      if (!((scoreA === 1 && scoreB === 0) || (scoreA === 0 && scoreB === 1))) {
        throw new Error(`Tỉ số trận đấu phải là 1-0 hoặc 0-1.`);
      }
      
      const response = await fetch(`http://localhost:3000/api/tournaments/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_score: scoreA,
          team_b_score: scoreB,
          status: 'completed'
        })
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || `Lỗi lưu tỉ số cho trận đấu.`)
      }
    })
    
    await Promise.all(promises)
    successMsg.value = "Đã lưu nhanh tất cả tỉ số thành công!"
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
    const response = await fetch(`http://localhost:3000/api/tournaments/${props.tournament.id}/schedule`, {
      method: 'POST'
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

const handleSaveMatchScore = async (match) => {
  const formData = matchForm.value[match.id]
  if (!formData) return

  const scoreA = parseInt(formData.team_a_score, 10)
  const scoreB = parseInt(formData.team_b_score, 10)

  if (!((scoreA === 1 && scoreB === 0) || (scoreA === 0 && scoreB === 1))) {
    errorMsg.value = "Tỉ số trận đấu chỉ có thể là 1-0 hoặc 0-1."
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  actionLoading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/matches/${match.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_a_score: scoreA,
        team_b_score: scoreB,
        status: 'completed'
      })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Lỗi lưu tỉ số")
    }
    
    successMsg.value = data.message || "Đã cập nhật tỉ số!"
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
