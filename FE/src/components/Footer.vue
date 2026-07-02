<template>
  <footer class="bg-[#070c12] border-t border-white/10">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">

        <!-- Logo & Description -->
        <div>
          <div class="flex-shrink-0 flex items-center ">
            <img
              src="/assets/logo/DKlogo.png"
              class="h-8 w-auto object-contain"
              alt="DK Logo"
            >
            <span class="text-[#ff4655] text-2xl font-bold font-valorant tracking-wider relative top-2">
              GROUP
            </span>
          </div>

          <p class="mt-4 text-gray-400 text-sm">
            Hệ thống theo dõi giải đấu, bảng xếp hạng và tổ chức giải đấu cho các sự kiện của DK GROUP.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="text-sm font-semibold tracking-wider uppercase font-valorant text-[#ff4655]">
            Liên kết
          </h3>

          <ul class="mt-4 space-y-2 text-sm text-gray-400">

            <li>
              <router-link
                to="/matches"
                class="hover:text-white transition"
              >
                Trận đấu & Kết quả
              </router-link>
            </li>

            <li>
              <router-link
                to="/players"
                class="hover:text-white transition"
              >
                Bảng xếp hạng tuyển thủ
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-sm font-semibold tracking-wider uppercase font-valorant text-[#ff4655]">
            Liên hệ
          </h3>

          <ul class="mt-4 space-y-3 text-sm text-gray-400">
            <li>
              <a
                href="https://www.facebook.com/pele.khanh"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 hover:text-[#ff4655] transition duration-300"
              >
                <i class="fab fa-facebook text-lg"></i>
                <span>Facebook</span>
              </a>
            </li>

            <li>
              <a
                href="https://discord.gg/nX8XCrPgpe"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 hover:text-[#ff4655] transition duration-300"
              >
                <i class="fab fa-discord text-lg"></i>
                <span>Discord</span>
              </a>
            </li>

            <li>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 hover:text-[#ff4655] transition duration-300"
              >
                <i class="fab fa-youtube text-lg"></i>
                <span>YouTube</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Copyright -->
        <div>
          <h3 class="text-sm font-semibold tracking-wider uppercase font-valorant text-[#ff4655]">
            Hỗ trợ & Bản quyền
          </h3>

          <p class="mt-4 text-sm text-gray-400">
            Dự án phục vụ cộng đồng Valorant.
            Riot Games và Valorant là thương hiệu đã đăng ký của Riot Games,
            Inc.
          </p>

          <p class="mt-2 text-xs text-gray-500">
            &copy; {{ currentYear }} DK GROUP. Bảo lưu mọi quyền.
          </p>
        </div>

      </div>

      <!-- Bottom Bar -->
      <div class="mt-10 pt-6 border-t border-white/10">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-gray-500 text-center md:text-left">
            Hệ thống giải đấu DK GROUP
          </p>

          <div class="flex items-center gap-4 text-gray-500">
            <a
              href="#"
              target="_blank"
              class="hover:text-[#ff4655] transition"
            >
              <i class="fab fa-facebook-f"></i>
            </a>

            <a
              href="https://discord.gg/nX8XCrPgpe"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-[#ff4655] transition"
            >
              <i class="fab fa-discord"></i>
            </a>

            <a
              href="#"
              target="_blank"
              class="hover:text-[#ff4655] transition"
            >
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>