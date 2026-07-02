<template>
  <div class="relative w-full h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl transition-all duration-300 hover:border-[#5865f2]/30">
    <!-- Cyberpunk & Discord Blur Accents -->
    <div class="absolute -right-16 -top-16 w-64 h-64 bg-[#5865f2]/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-[#ff4655]/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 h-full items-center p-6 md:p-6 gap-6">
      <!-- Left Column: Discord Promotion Info -->
      <div class="md:col-span-8 flex flex-col justify-center text-left">
        <!-- Badge -->
        <div class="inline-flex items-center px-3 py-1 rounded bg-[#5865f2]/10 border border-[#5865f2]/30 text-[#5865f2] text-xs font-semibold uppercase tracking-widest w-fit mb-4 animate-pulse">
          <span class="w-1.5 h-1.5 rounded-full bg-[#5865f2] mr-1.5"></span>
          Cộng đồng Discord
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-extrabold text-white font-valorant tracking-wider mb-3 leading-tight uppercase">
          KẾT NỐI <span class="text-[#5865f2]">DISCORD</span> CỦA CHÚNG TÔI
        </h1>

        <!-- Call-to-action text -->
        <p class="text-gray-300 text-sm md:text-base mb-6 font-medium max-w-xl italic leading-relaxed">
          "Nơi giao lưu, lập đội chiến game, thảo luận chiến thuật và cập nhật thông báo giải đấu nhanh chóng nhất. Tham gia ngay cùng hàng trăm game thủ Valorant khác!"
        </p>

        <!-- Features Grid -->
        <div class="flex flex-wrap items-center gap-6 text-sm">
          <div class="flex items-center text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
            <div>
              <span class="block text-[10px] text-gray-500 uppercase font-semibold">Giao lưu</span>
              <span class="font-bold text-white">Tìm đồng đội dễ dàng</span>
            </div>
          </div>

          <div class="flex items-center text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
            <div>
              <span class="block text-[10px] text-gray-500 uppercase font-semibold">Tốc độ</span>
              <span class="font-bold text-white">Cập nhật tin tức 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Join Button and Large Logo -->
      <div class="md:col-span-4 flex flex-col items-center md:items-end justify-center gap-4 w-full">
        <!-- Giant Glowing DK Logo (Decorative) -->
        <div class="hidden md:flex items-center justify-center w-24 h-24 rounded-3xl bg-[#5865f2]/10 border border-[#5865f2]/20 shadow-lg shadow-[#5865f2]/5 mb-2 hover:scale-105 transition duration-300 p-4">
          <img src="/assets/logo/DKlogo.png" class="w-full h-full object-contain" alt="DK Logo" />
        </div>

        <!-- Join Button -->
        <a 
          href="https://discord.gg/nX8XCrPgpe"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative flex justify-center items-center gap-2.5 w-full md:w-auto md:min-w-[200px] px-8 py-5 bg-[#5865f2] hover:bg-[#6a77f3] text-white text-center font-bold text-lg tracking-wider rounded-lg shadow-lg shadow-[#5865f2]/30 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
        >
          <!-- Slanted effect layer -->
          <div class="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></div>
          
          <i class="fab fa-discord text-xl relative z-10"></i>
          <span class="relative z-10 uppercase text-center font-valorant">Tham gia ngay</span>
          <i class="fas fa-arrow-right relative z-10 transition-transform duration-300 group-hover:translate-x-2"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// Discord banner logic is fully static and links to the discord URL
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
