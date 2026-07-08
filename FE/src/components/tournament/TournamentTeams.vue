<template>
  <div class="space-y-8 animate-fadeIn w-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 bg-[#0b141d]/50 border border-white/5 rounded-2xl">
      <i class="fas fa-spinner fa-spin text-2xl text-[#ff4655] mb-2"></i>
      <p class="text-gray-400 text-xs sm:text-sm">Đang tải danh sách đội tuyển...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!teams.length" class="flex flex-col items-center justify-center py-16 bg-[#0b141d]/50 border border-white/5 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
      <div class="h-16 w-16 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl">
        <i class="fas fa-shield-alt"></i>
      </div>
      <h4 class="text-base font-bold text-white font-valorant uppercase tracking-wider">Chưa có đội tuyển</h4>
    </div>

    <!-- Teams List (One Team per Row) -->
    <div v-else class="space-y-8 w-full">
      <div 
        v-for="team in teams" 
        :key="team.id" 
        class="bg-gradient-to-b from-[#0f141d] to-[#0e1622] border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden w-full text-left"
      >
        <!-- Accent lines at the top of the team row -->
        <div class="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#ff4655] via-orange-500 to-[#ff4655] z-10"></div>

        <!-- Team Header: Name, Logo, & Tokens -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-4 z-10">
          <div class="flex items-center gap-4">
            <!-- Team Logo -->
            <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img v-if="team.logo" :src="team.logo" class="w-full h-full object-cover" />
              <i v-else class="fas fa-shield-alt text-2xl text-gray-500"></i>
            </div>
            
            <!-- Team Info -->
            <div>
              <h3 class="font-valorant text-xl sm:text-2xl font-black text-[#ff4655] uppercase tracking-wider leading-none">
                {{ team.name }}
              </h3>
              <p class="text-[10px] sm:text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                Captain: <span class="text-white font-extrabold">{{ team.captain_nickname || 'Chưa rõ' }}</span>
              </p>
            </div>
          </div>
          
          <!-- Tokens and Stats -->
          <div class="flex gap-3 items-center justify-between sm:justify-start">
            <div class="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2 text-center shrink-0">
              <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Thành viên</span>
              <span class="text-sm font-black text-white font-valorant">{{ getMembers(team).length + (getCaptain(team) ? 1 : 0) }}/5</span>
            </div>
            <div class="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2 text-center shrink-0">
              <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Koin còn</span>
              <span class="text-sm font-black text-[#fbbf24] font-valorant">{{ team.tokens_remaining }} Koin</span>
            </div>
          </div>
        </div>

        <!-- 5 Player Cards Grid (Captain + 4 Members) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2 z-10">
          
          <!-- Card 1: Đội trưởng (Captain) -->
          <div 
            class="group relative border border-[#ff4655]/40 rounded-2xl p-4 bg-[#0b131a]/85 transition-all duration-300 hover:border-[#ff4655] hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,70,85,0.15)] text-left flex flex-col justify-between overflow-hidden min-h-[150px]"
          >
            <!-- Crown Indicator -->
            <div class="absolute top-2 right-2 bg-[#ff4655] border border-red-400 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white font-valorant flex items-center gap-1 z-20">
              👑 Captain
            </div>

            <!-- Top: Avatar & Riot ID -->
            <div class="flex items-start gap-3">
              <div class="relative w-12 h-12 rounded-xl border border-white/10 shrink-0 overflow-hidden bg-[#0f1923]">
                <img 
                  :src="getPlayerAvatar(getCaptain(team))" 
                  @error="handleAvatarError($event, getCaptain(team))"
                  class="w-full h-full object-cover" 
                />
              </div>
              <div class="min-w-0 flex-grow text-left">
                <a 
                  v-if="getCaptain(team)"
                  :href="'https://tracker.gg/valorant/profile/riot/' + encodeURIComponent(getCaptain(team).riot_id) + '/overview'"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-xs sm:text-sm font-extrabold text-[#ff4655] hover:text-red-400 hover:underline truncate block font-valorant"
                  title="Xem Tracker.gg"
                >
                  {{ getCaptain(team).nickname }}
                  <i class="fas fa-external-link-alt text-[7px] opacity-75 ml-1"></i>
                </a>
                <span v-else class="text-xs sm:text-sm font-extrabold text-slate-500 font-valorant block">Chưa rõ</span>
                
                <!-- Rank Name -->
                <div class="flex items-center gap-1.5 mt-1">
                  <img 
                    v-if="getCaptain(team)?.rank_name"
                    :src="getRankIcon(getCaptain(team).rank_name)" 
                    class="w-4 h-4 object-contain" 
                    :title="getCaptain(team).rank_name"
                    @error="$event.target.style.display='none'"
                  />
                  <span class="text-[9px] text-gray-400 truncate">{{ getCaptain(team)?.rank_name || 'Không rank' }}</span>
                </div>
              </div>
            </div>

            <!-- Mid: Details -->
            <div class="grid grid-cols-2 gap-2 text-[9px] text-gray-400 border-t border-white/5 pt-2.5 mt-2.5">
              <div>
                <span class="text-gray-500 font-bold block text-[7px] uppercase tracking-wider leading-none mb-0.5">Tên thật</span>
                <span class="text-white font-semibold truncate block">{{ getCaptain(team)?.full_name || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-gray-500 font-bold block text-[7px] uppercase tracking-wider leading-none mb-0.5">Agent tủ</span>
                <span class="text-white font-semibold truncate block">{{ getCaptain(team)?.favorite_agent || 'N/A' }}</span>
              </div>
            </div>

            <!-- Bottom: Roles and Label -->
            <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
              <div class="flex gap-1 items-center">
                <img 
                  v-for="icon in getRoleIcons(getCaptain(team)?.preferred_role)" 
                  :key="icon.src" 
                  :src="icon.src" 
                  :title="icon.label" 
                  class="w-4 h-4 object-contain opacity-80"
                />
              </div>
              <span class="text-[8px] font-black text-[#ff4655] font-valorant bg-red-950/20 border border-[#ff4655]/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                Đội trưởng
              </span>
            </div>
          </div>

          <!-- Cards 2-5: Thành viên (Members 1 to 4) -->
          <div 
            v-for="idx in 4" 
            :key="idx"
            class="group relative border rounded-2xl p-4 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden min-h-[150px]"
            :class="getMembers(team)[idx-1] 
              ? 'border-white/10 bg-[#0b131a]/85 hover:border-[#ff4655]/50 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,70,85,0.1)]' 
              : 'border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center'"
          >
            <!-- Filled Member Slot -->
            <template v-if="getMembers(team)[idx-1]">
              <!-- Top: Avatar & Riot ID -->
              <div class="flex items-start gap-3">
                <div class="relative w-12 h-12 rounded-xl border border-white/10 shrink-0 overflow-hidden bg-[#0f1923]">
                  <img 
                    :src="getPlayerAvatar(getMembers(team)[idx-1])" 
                    @error="handleAvatarError($event, getMembers(team)[idx-1])"
                    class="w-full h-full object-cover" 
                  />
                </div>
                <div class="min-w-0 flex-grow text-left">
                  <a 
                    :href="'https://tracker.gg/valorant/profile/riot/' + encodeURIComponent(getMembers(team)[idx-1].riot_id) + '/overview'"
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-xs sm:text-sm font-extrabold text-white group-hover:text-[#ff4655] hover:underline truncate block font-valorant transition duration-200"
                    title="Xem Tracker.gg"
                  >
                    {{ getMembers(team)[idx-1].nickname }}
                    <i class="fas fa-external-link-alt text-[7px] opacity-75 ml-1"></i>
                  </a>
                  
                  <div class="flex items-center gap-1.5 mt-1">
                    <img 
                      v-if="getMembers(team)[idx-1].rank_name"
                      :src="getRankIcon(getMembers(team)[idx-1].rank_name)" 
                      class="w-4 h-4 object-contain" 
                      :title="getMembers(team)[idx-1].rank_name"
                      @error="$event.target.style.display='none'"
                    />
                    <span class="text-[9px] text-gray-400 truncate">{{ getMembers(team)[idx-1].rank_name || 'Không rank' }}</span>
                  </div>
                </div>
              </div>

              <!-- Mid: Details -->
              <div class="grid grid-cols-2 gap-2 text-[9px] text-gray-400 border-t border-white/5 pt-2.5 mt-2.5">
                <div>
                  <span class="text-gray-500 font-bold block text-[7px] uppercase tracking-wider leading-none mb-0.5">Tên thật</span>
                  <span class="text-white font-semibold truncate block">{{ getMembers(team)[idx-1].full_name || 'N/A' }}</span>
                </div>
                <div>
                  <span class="text-gray-500 font-bold block text-[7px] uppercase tracking-wider leading-none mb-0.5">Agent tủ</span>
                  <span class="text-white font-semibold truncate block">{{ getMembers(team)[idx-1].favorite_agent || 'N/A' }}</span>
                </div>
              </div>

              <!-- Bottom: Roles and Label -->
              <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                <div class="flex gap-1 items-center">
                  <img 
                    v-for="icon in getRoleIcons(getMembers(team)[idx-1].preferred_role)" 
                    :key="icon.src" 
                    :src="icon.src" 
                    :title="icon.label" 
                    class="w-4 h-4 object-contain opacity-80"
                  />
                </div>
                <span class="text-[8px] font-black text-slate-300 font-valorant bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Player {{ idx }}
                </span>
              </div>
            </template>

            <!-- Empty Slot -->
            <template v-else>
              <div class="flex flex-col items-center justify-center text-center space-y-2 py-6">
                <div class="w-10 h-10 rounded-full border border-dashed border-white/10 flex items-center justify-center text-slate-600 text-sm select-none">
                  ?
                </div>
                <div>
                  <span class="font-valorant text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none block">Trống</span>
                  <span class="text-[8px] text-slate-600 uppercase tracking-wider font-semibold block mt-1">Player {{ idx }}</span>
                </div>
              </div>
            </template>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  teams: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const getCaptain = (team) => {
  return team.captain || null
}

const getMembers = (team) => {
  return team.members || []
}

const getPlayerAvatar = (player) => {
  if (player && player.avatar) return player.avatar
  if (player && player.favorite_agent) {
    const cleanAgent = player.favorite_agent.toLowerCase().trim()
    return `/assets/agent_face/${cleanAgent}.png`
  }
  return '/assets/agent_face/jett.png'
}

const handleAvatarError = (event, player) => {
  event.target.src = '/assets/agent_face/jett.png'
}

const getRankIcon = (rankName) => {
  if (!rankName) return ''
  let cleanRank = rankName.trim().replace(/\s+/g, '_')
  return `/assets/rank_png/${cleanRank}_Rank.png`
}

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
</script>
