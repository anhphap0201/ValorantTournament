<template>
  <div class="space-y-8 animate-fadeIn">
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 bg-[#0b141d]/50 border border-white/5 rounded-2xl">
      <i class="fas fa-spinner fa-spin text-2xl text-[#ff4655] mb-2"></i>
      <p class="text-gray-400 text-xs sm:text-sm">Đang tải danh sách đội tuyển...</p>
    </div>

    <div v-else-if="!teams.length" class="flex flex-col items-center justify-center py-16 bg-[#0b141d]/50 border border-white/5 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
      <div class="h-16 w-16 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl">
        <i class="fas fa-shield-alt"></i>
      </div>
      <h4 class="text-base font-bold text-white font-valorant uppercase tracking-wider">Chưa có đội tuyển</h4>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full mx-auto">
      <div 
        v-for="team in teams" 
        :key="team.id" 
        class="bg-gradient-to-b from-red-950/10 to-[#0e1622]/95 border border-[#ff4655]/20 rounded-3xl p-4 lg:p-5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <!-- Top Accent line -->
        <div class="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#ff4655] via-orange-500 to-[#ff4655] z-10"></div>

        <!-- Team Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3 z-10 text-left">
          <div class="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <div class="relative w-12 h-12 rounded-xl p-0.5 bg-gradient-to-tr from-[#ff4655] to-orange-500 shrink-0">
              <img 
                :src="getPlayerAvatar(getCaptain(team))" 
                @error="handleAvatarError($event, getCaptain(team))"
                class="w-full h-full rounded-lg object-cover bg-[#0f1923]" 
              />
              <div class="absolute -top-1.5 -right-1.5 bg-[#ff4655] border border-red-400 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">
                👑
              </div>
            </div>
            <div class="text-left min-w-0">
              <h3 class="font-valorant text-base sm:text-lg font-black text-[#ff4655] leading-none uppercase truncate">
                {{ team.name }}
              </h3>
              <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Captain: <span class="text-white font-extrabold">{{ team.captain_nickname || 'Chưa rõ' }}</span>
              </p>
            </div>
          </div>
          
          <div class="flex gap-2 w-full sm:w-auto justify-between sm:justify-start mt-2 sm:mt-0">
            <div class="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-1 text-center shrink-0 flex-1 sm:flex-initial">
              <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Thành viên</span>
              <span class="text-xs font-black text-white font-valorant">{{ getMembers(team).length }}/4</span>
            </div>
          </div>
        </div>

        <!-- Team Members Grid (Grid of 4 slots) -->
        <div class="grid grid-cols-2 gap-3 mt-4 z-10">
          <div 
            v-for="i in 4" 
            :key="i"
            class="group relative border rounded-2xl p-2 bg-[#0b131a]/85 transition-all duration-300 hover:border-[#ff4655]/40 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(255,70,85,0.12)] text-left flex flex-row items-stretch gap-2 overflow-hidden w-full min-h-[110px] max-h-[130px] lg:min-h-[120px] lg:max-h-[140px] lg:p-3 lg:gap-3"
            :class="getMembers(team)[i-1] ? 'border-[#ff4655]/25 shadow-[0_4px_16px_rgba(255,70,85,0.06)]' : 'border-white/5'"
          >
            <!-- Filled member slot -->
            <template v-if="getMembers(team)[i-1]">
              <!-- Left Column: Avatar, Rank Icon, and Roles -->
              <div class="w-[48px] lg:w-[60px] flex-shrink-0 flex flex-col items-center justify-center py-0.5 z-10 relative border-r border-white/5 pr-1.5 lg:pr-2 gap-1 lg:gap-1.5">
                <img 
                  :src="getPlayerAvatar(getMembers(team)[i-1])" 
                  class="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border border-white/10 flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:border-[#ff4655]/40" 
                  @error="handleAvatarError($event, getMembers(team)[i-1])"
                />
                <img 
                  v-if="getMembers(team)[i-1].rank_name"
                  :src="getRankIcon(getMembers(team)[i-1].rank_name)" 
                  class="w-3.5 h-3.5 lg:w-5 lg:h-5 object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110" 
                  :title="getMembers(team)[i-1].rank_name"
                  @error="$event.target.style.display='none'"
                />
                <div class="flex gap-0.5 justify-center items-center flex-wrap w-full">
                  <img 
                    v-for="icon in getRoleIcons(getMembers(team)[i-1].preferred_role)" 
                    :key="icon.src" 
                    :src="icon.src" 
                    :title="icon.label" 
                    class="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 object-contain opacity-85 hover:opacity-100 transition"
                  />
                </div>
              </div>

              <!-- Right Column: Nickname, Ranks, Strengths, Price tag -->
              <div class="flex-grow flex flex-col justify-between min-w-0 z-10 relative text-left">
                <!-- Top Line: Nickname & Tracker link -->
                <div class="flex items-center justify-between gap-1">
                  <a 
                    :href="'https://tracker.gg/valorant/profile/riot/' + encodeURIComponent(getMembers(team)[i-1].riot_id) + '/overview'"
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-[10px] lg:text-[12px] font-extrabold text-[#ff4655] hover:text-red-400 hover:underline truncate inline-flex items-center gap-1 min-w-0 max-w-full font-valorant"
                    title="Xem Tracker.gg"
                    @click.stop
                  >
                    <span class="truncate">{{ getMembers(team)[i-1].nickname }}</span>
                    <i class="fas fa-external-link-alt text-[6px] opacity-75"></i>
                  </a>
                </div>

                <!-- Meta details: Real name & Agent -->
                <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] lg:text-[9px] text-gray-400 mt-0.5">
                  <div class="truncate text-left">
                    <span class="text-gray-500 font-semibold block text-[6px] lg:text-[7px] uppercase tracking-wider font-valorant leading-none mb-0.5">Tên thật</span>
                    <span class="text-white font-medium truncate">{{ getMembers(team)[i-1].full_name || 'Chưa cung cấp' }}</span>
                  </div>
                  <div class="truncate text-left">
                    <span class="text-gray-500 font-semibold block text-[6px] lg:text-[7px] uppercase tracking-wider font-valorant leading-none mb-0.5">Agent</span>
                    <span class="text-white font-medium truncate">{{ getMembers(team)[i-1].favorite_agent || 'Chưa chọn' }}</span>
                  </div>
                </div>

                <!-- Strengths (Compact) -->
                <div class="text-[8px] lg:text-[9px] text-gray-400 border-t border-white/5 pt-0.5 lg:pt-1 mt-0.5 lg:mt-1 text-left">
                  <span class="text-gray-500 font-semibold block text-[6px] lg:text-[7px] uppercase tracking-wider font-valorant leading-none">Điểm mạnh</span>
                  <p class="text-gray-300 line-clamp-1 mt-0.5" :title="getMembers(team)[i-1].strengths">{{ getMembers(team)[i-1].strengths || 'Chưa cung cấp' }}</p>
                </div>
              </div>
            </template>

            <!-- Empty slot -->
            <template v-else>
              <div class="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-700 text-xs lg:text-sm shrink-0 select-none my-auto ml-1.5">
                ?
              </div>
              <div class="text-left flex-grow flex flex-col justify-center min-w-0 pr-2 pl-1">
                <span class="font-valorant text-[9px] lg:text-xs font-bold text-slate-600 uppercase tracking-widest leading-none">Trống</span>
                <p class="text-[7px] lg:text-[10px] text-slate-700 mt-0.5 leading-none">Chưa tuyển chọn</p>
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
