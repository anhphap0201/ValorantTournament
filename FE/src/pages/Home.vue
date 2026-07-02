<template>
  <div class="cyber-grid flex-grow py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-[95%] mx-auto space-y-10">
      
      <!-- Carousel Slider -->
      <div v-if="banners.length > 0" class="relative w-full overflow-hidden pb-4">
        <!-- Slide Track Container -->
        <div class="relative w-full h-[640px] xs:h-[580px] sm:h-[520px] md:h-[460px] lg:h-[400px] overflow-hidden">
          <div 
            class="flex w-full h-full cursor-grab select-none active:cursor-grabbing"
            :style="trackStyle"
            @mousedown="touchStart"
            @mousemove="touchMove"
            @mouseup="touchEnd"
            @mouseleave="touchEnd"
            @touchstart="touchStart($event)"
            @touchmove="touchMove($event)"
            @touchend="touchEnd"
            @click.capture="handleClickCapture"
            @transitionend="handleTransitionEnd"
          >
            <div 
              v-for="(banner, index) in displayBanners" 
              :key="index"
              class="w-[78%] mr-[1.5%] h-full flex-shrink-0"
              :class="[
                index === activeIndex ? 'opacity-100 scale-100 z-20' : 'opacity-25 scale-95 pointer-events-none z-10'
              ]"
              :style="{
                transition: 'opacity 0.8s, transform 0.8s, scale 0.8s',
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)'
              }"
            >
              <component :is="banner.component" />
            </div>
          </div>
        </div>

        <!-- Slider Dots Indicators -->
        <div v-if="banners.length > 1" class="flex justify-center items-center gap-2 mt-4">
          <button 
            v-for="(banner, index) in banners" 
            :key="banner.id"
            @click="selectBanner(index)"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="(activeIndex - 1 + banners.length) % (banners.length || 1) === index ? 'bg-[#ff4655] w-6' : 'bg-white/20 hover:bg-white/40'"
            :aria-label="'Slide ' + (index + 1)"
          ></button>
        </div>
      </div>

      <!-- Latest Notification Banner -->
      <div v-if="latestNotification" class="animate-fadeIn">
        <div class="glass-card rounded-2xl border border-[#ff4655]/25 bg-[#0b141d]/90 p-6 shadow-2xl relative overflow-hidden group">
          <!-- Glow Accent Effect -->
          <div class="absolute top-0 left-0 w-[3px] h-full bg-[#ff4655] group-hover:shadow-[0_0_15px_#ff4655] transition-all"></div>
          
          <!-- Banner Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4 text-left">
            <div class="flex items-center gap-3">
              <div class="bg-[#ff4655]/10 p-2 rounded-lg text-[#ff4655] animate-pulse">
                <i class="fas fa-bullhorn"></i>
              </div>
              <div>
                <h4 class="text-base font-bold text-white mt-1">{{ latestNotification.title }}</h4>
              </div>
            </div>
            
            <div class="flex items-center gap-3 self-start sm:self-center">
              <span class="text-xs text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full font-medium">
                <i class="far fa-clock"></i> {{ formatDate(latestNotification.created_at) }}
              </span>
              <router-link to="/notifications" class="text-xs font-bold text-[#ff4655] hover:text-[#ff5e6b] transition flex items-center gap-1">
                Xem tất cả <i class="fas fa-arrow-right text-[10px]"></i>
              </router-link>
            </div>
          </div>

          <!-- Banner Body Content -->
          <div class="text-gray-300 text-sm leading-relaxed text-left max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-html="formatNotificationContent(latestNotification.content)"></div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="glass-card rounded-2xl border border-white/5 p-8 text-center bg-[#0b141d]/50">
        <i class="fas fa-spinner fa-spin text-[#ff4655] text-xl mb-2"></i>
        <p class="text-gray-400 text-xs">Đang tải bản tin...</p>
      </div>

    </div>
  </div>
</template>

<!-- <script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import RegisterBanner from '../components/banner/Register.vue'
import DiscordBanner from '../components/banner/Discord.vue'
import VotePlayer from '../components/banner/VotePlayer.vue'
import CaptainsBanner from '../components/banner/Captains.vue'
import AuctionBanner from '../components/banner/Auction.vue'
import API from '../assets/js/api.js'

const latestNotification = ref(null)
const loading = ref(false)

// Carousel setup
const componentMap = {
  register: RegisterBanner,
  discord: DiscordBanner,
  vote: VotePlayer,
  captains: CaptainsBanner,
  auction: AuctionBanner
}
const banners = ref([])
const displayBanners = ref([])
const activeIndex = ref(0)
const isTransitioning = ref(true)
let autoplayInterval = null
let transitionTimeout = null

// Dragging/swiping setup
const isDragging = ref(false)
const startX = ref(0)
const dragOffset = ref(0)
let hasDragged = false

const trackStyle = computed(() => {
  if (banners.value.length <= 1) {
    return {
      transform: 'none',
      transition: 'none',
      justifyContent: 'center',
      display: 'flex',
      width: '100%',
      height: '100%'
    }
  }
  const baseTranslate = - (activeIndex.value * 79.5) + 11
  const transitionStyle = isTransitioning.value && !isDragging.value 
    ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' 
    : 'none'
  return {
    display: 'flex',
    width: '100%',
    height: '100%',
    transform: `translateX(calc(${baseTranslate}% + ${dragOffset.value}px))`,
    transition: transitionStyle
  }
})

function touchStart(e) {
  if (banners.value.length <= 1) return
  isDragging.value = true
  startX.value = e.touches ? e.touches[0].clientX : e.clientX
  dragOffset.value = 0
  hasDragged = false
  stopAutoplay()
}

function touchMove(e) {
  if (banners.value.length <= 1) return
  if (!isDragging.value) return
  const currentX = e.touches ? e.touches[0].clientX : e.clientX
  const delta = currentX - startX.value
  dragOffset.value = delta

  if (Math.abs(delta) > 10) {
    hasDragged = true
    if (e.cancelable) e.preventDefault()
  }
}

function changeSlide(newIndex) {
  if (banners.value.length <= 1) return
  
  isTransitioning.value = true
  activeIndex.value = newIndex
  
  if (transitionTimeout) {
    clearTimeout(transitionTimeout)
  }
  
  // Wrap-around jump exactly after transition completes (800ms)
  transitionTimeout = setTimeout(() => {
    const len = banners.value.length
    if (activeIndex.value === len + 1) {
      isTransitioning.value = false
      activeIndex.value = 1
    } else if (activeIndex.value === 0) {
      isTransitioning.value = false
      activeIndex.value = len
    }
  }, 800)
}

function touchEnd() {
  if (banners.value.length <= 1) return
  if (!isDragging.value) return
  isDragging.value = false

  const threshold = 60 // px threshold to trigger slide shift
  if (dragOffset.value < -threshold) {
    nextSlide()
  } else if (dragOffset.value > threshold) {
    prevSlide()
  } else {
    // Realign to the current slide if threshold not met
    changeSlide(activeIndex.value)
  }

  dragOffset.value = 0
  startAutoplay()
}

function handleClickCapture(e) {
  if (hasDragged) {
    e.preventDefault()
    e.stopPropagation()
  }
}

function startAutoplay() {
  if (banners.value.length <= 1) return
  stopAutoplay()
  autoplayInterval = setInterval(() => {
    nextSlide()
  }, 10000) // 10 seconds
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

function nextSlide() {
  changeSlide(activeIndex.value + 1)
}

function prevSlide() {
  changeSlide(activeIndex.value - 1)
}

function selectBanner(index) {
  changeSlide(index + 1)
  startAutoplay()
}

async function fetchBanners() {
  try {
    const res = await API.request('/auth/banners')
    if (res.success) {
      banners.value = res.data
        .filter(b => b.is_active === 1 || b.is_active === true)
        .map(b => ({
          id: b.banner_key,
          component: componentMap[b.banner_key]
        }))
        .filter(b => b.component)

      if (banners.value.length > 1) {
        displayBanners.value = [
          banners.value[banners.value.length - 1],
          ...banners.value,
          banners.value[0]
        ]
        activeIndex.value = 1
        startAutoplay()
      } else {
        displayBanners.value = banners.value
        activeIndex.value = 0
      }
    }
  } catch (error) {
    console.error("Failed to fetch active banners:", error)
  }
}

async function fetchLatestNotification() {
  loading.value = true
  try {
    const res = await API.request('/auth/notifications')
    if (res.success && res.data.length > 0) {
      latestNotification.value = res.data[0] // Get the most recent one
    }
  } catch (error) {
    console.error("Failed to fetch latest announcement:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLatestNotification()
  fetchBanners()
})

onUnmounted(() => {
  stopAutoplay()
})

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
}

function formatNotificationContent(text) {
  if (!text) return '';
  
  // HTML escape first
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Format bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#ff4655] font-extrabold font-semibold">$1</strong>');
  
  // Format headers (# **text** or # text)
  html = html.replace(/^#\s+\*\*(.*?)\*\*/gm, '<h4 class="text-base font-bold text-white border-b border-[#ff4655]/20 pb-1.5 mb-3 tracking-wider uppercase font-valorant">$1</h4>');
  html = html.replace(/^#\s+(.*?)$/gm, '<h4 class="text-base font-bold text-white border-b border-[#ff4655]/20 pb-1.5 mb-3 tracking-wider uppercase font-valorant">$1</h4>');
  
  // Format links (https://...)
  html = html.replace(/(https?:\/\/[^\s\n]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline transition font-medium">$1</a>');
  
  // Format list items (lines starting with "- ")
  html = html.replace(/^-\s+(.*?)$/gm, '<li class="flex items-start gap-2 text-gray-300 ml-4 my-1.5"><span class="text-[#ff4655] mt-1.5 text-[8px]">&#9670;</span> <span>$1</span></li>');

  // Replace line breaks with <br> except inside block tags
  html = html.split('\n').map(line => {
    if (line.trim().startsWith('<h4') || line.trim().startsWith('<li') || line.trim().startsWith('</li')) {
      return line;
    }
    return line + '<br>';
  }).join('\n');
  
  return html;
}
</script> -->

<style scoped>
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 70, 85, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 70, 85, 0.4);
}
</style>
