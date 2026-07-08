<template>
  <div class="min-h-screen bg-[#0b0e14] text-white py-12 flex justify-center items-start">
    <div class="w-full lg:w-[95%] max-w-[1700px] px-4 sm:px-6 lg:px-8 space-y-10">
      
      <!-- Tab Header -->
      <div class="border-b border-white/10 pb-px flex items-center justify-start gap-4 sm:gap-8 overflow-x-auto select-none custom-scrollbar">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="selectTab(tab.id)"
          :class="[
            'pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 relative font-valorant outline-none whitespace-nowrap',
            activeTab === tab.id ? 'text-[#ff4655]' : 'text-gray-400 hover:text-white'
          ]"
        >
          {{ tab.name }}
          <span 
            v-if="activeTab === tab.id" 
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff4655] animate-growWidth"
          ></span>
        </button>
      </div>

      <!-- Tab Contents -->
      <!-- Tab 1: Giới thiệu (Tournament Info) -->
      <TournamentIntro 
        v-if="activeTab === 'intro'" 
        :tournament="tournament" 
        :loading="loadingTournament" 
      />
      
      <!-- Tab 2: Thể lệ -->
      <TournamentRules 
        v-else-if="activeTab === 'rules'" 
        :tournament="tournament" 
      />
      
      <!-- Tab 3: Đội tuyển -->
      <TournamentTeams 
        v-else-if="activeTab === 'teams'" 
        :teams="apiTeams && apiTeams.length ? apiTeams : teams" 
        :loading="loadingTeams" 
      />



    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTournament } from '../composables/useTournament.js'

// Import tournament components
import TournamentIntro from '../components/tournament/TournamentIntro.vue'
import TournamentTeams from '../components/tournament/TournamentTeams.vue'
import TournamentRules from '../components/tournament/TournamentRules.vue'

const { tournaments, loading: loadingTournament, fetchTournaments } = useTournament()
import { useTeam } from '../composables/useTeam.js'

const { teams: apiTeams, loading: loadingTeams, fetchTeams } = useTeam()

const tournament = ref(null)
const activeTab = ref('intro')

const tabs = [
  { id: 'intro', name: 'Giới thiệu' },
  { id: 'rules', name: 'Thể lệ' },
  { id: 'teams', name: 'Đội tuyển' }
]

const selectTab = (tabId) => {
  activeTab.value = tabId
}

const teams = ref([
  {
    id: 1,
    name: "T1 VALORANT",
    captain_nickname: "Sayaplayer",
    tokens_remaining: 150,
    captain: {
      nickname: "Sayaplayer",
      avatar: "",
      full_name: "Ha Jung-woo",
      riot_id: "Sayaplayer#T1",
      favorite_agent: "Jett",
      strengths: "Aim thần sầu, Entry cực mạnh",
      rank_name: "Radiant",
      preferred_role: "Duelist",
      bought_price: 300
    },
    members: [
      {
        nickname: "Carpe",
        avatar: "",
        full_name: "Lee Jae-hyeok",
        riot_id: "Carpe#T1",
        favorite_agent: "Gekko",
        strengths: "Initiator xuất sắc, bọc lót tốt",
        rank_name: "Immortal 3",
        preferred_role: "Initiator",
        bought_price: 200
      },
      {
        nickname: "xccurate",
        avatar: "",
        full_name: "Kevin Susanto",
        riot_id: "xccurate#T1",
        favorite_agent: "Chamber",
        strengths: "OP/Sniper cực bén",
        rank_name: "Radiant",
        preferred_role: "Sentinel",
        bought_price: 250
      },
      {
        nickname: "iZu",
        avatar: "",
        full_name: "Ham Woo-joo",
        riot_id: "iZu#T1",
        favorite_agent: "Omen",
        strengths: "Lurker khó lường, smoke chuẩn",
        rank_name: "Immortal 2",
        preferred_role: "Controller",
        bought_price: 180
      }
    ]
  },
  {
    id: 2,
    name: "PRX FANCLUB",
    captain_nickname: "f0rsakeN",
    tokens_remaining: 80,
    captain: {
      nickname: "f0rsakeN",
      avatar: "",
      full_name: "Jason Susanto",
      riot_id: "f0rsakeN#PRX",
      favorite_agent: "Yoru",
      strengths: "Flex cực đỉnh, tay cực to",
      rank_name: "Radiant",
      preferred_role: "Duelist, Controller",
      bought_price: 350
    },
    members: [
      {
        nickname: "something",
        avatar: "",
        full_name: "Ilya Petrov",
        riot_id: "something#PRX",
        favorite_agent: "Jett",
        strengths: "Entry thần tốc, phản xạ quái vật",
        rank_name: "Radiant",
        preferred_role: "Duelist",
        bought_price: 320
      },
      {
        nickname: "mindfreak",
        avatar: "",
        full_name: "Aaron Leonhart",
        riot_id: "mindfreak#PRX",
        favorite_agent: "Viper",
        strengths: "Clutch ván đấu bình tĩnh",
        rank_name: "Immortal 3",
        preferred_role: "Controller",
        bought_price: 150
      },
      {
        nickname: "d4v41",
        avatar: "",
        full_name: "Khalish Rusyaidee",
        riot_id: "d4v41#PRX",
        favorite_agent: "Skye",
        strengths: "Gánh kèo toàn diện, hỗ trợ tốt",
        rank_name: "Immortal 3",
        preferred_role: "Initiator",
        bought_price: 180
      },
      {
        nickname: "Jinggg",
        avatar: "",
        full_name: "Wang Jing Jie",
        riot_id: "Jinggg#PRX",
        favorite_agent: "Raze",
        strengths: "Ném mìn thần sầu, sấy nhiệt",
        rank_name: "Radiant",
        preferred_role: "Duelist",
        bought_price: 280
      }
    ]
  }
])

onMounted(async () => {
  await fetchTournaments()
  if (tournaments.value.length > 0) {
    const active = tournaments.value.find(t => t.status === 'register' || t.status === 'running')
    tournament.value = active || tournaments.value[0]
  }
  
  if (tournament.value) {
    await fetchTeams(tournament.value.id)
  } else {
    await fetchTeams()
  }
})
</script>

<style scoped>
@keyframes growWidth {
  from { width: 0; }
  to { width: 100%; }
}

.animate-growWidth {
  animation: growWidth 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

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
