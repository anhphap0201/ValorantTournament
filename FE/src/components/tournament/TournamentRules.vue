<template>
  <div class="glass-card rounded-2xl p-6 md:p-8 border border-white/5 text-left w-full animate-fadeIn">
    <h3 class="text-xl font-bold text-white uppercase tracking-wider border-l-2 border-[#ff4655] pl-3 font-valorant mb-8">
      Thể lệ & Luật thi đấu giải đấu
    </h3>
    
    <div class="flex flex-col md:flex-row gap-8 items-stretch">
      <!-- Sidebar Navigation (Left) -->
      <div class="w-full md:w-72 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 pr-0 md:pr-4 custom-scrollbar">
        <button 
          v-for="cat in ruleCategories" 
          :key="cat.id"
          @click="activeRuleCategory = cat.id"
          class="flex items-center gap-3 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap md:w-full text-left"
          :class="activeRuleCategory === cat.id 
            ? 'border-l-2 border-[#ff4655] text-[#ff4655] bg-white/[3%]' 
            : 'border-l-2 border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[1%]'
          "
        >
          <i :class="[cat.icon]" class="text-xs w-4 text-center shrink-0"></i>
          <span class="truncate">{{ cat.name }}</span>
        </button>
      </div>
      
      <!-- Detail Content View (Right) -->
      <div class="flex-1 min-w-0">
        <!-- I. THÔNG TIN GIẢI ĐẤU & GIẢI THƯỞNG -->
        <div v-if="activeRuleCategory === 'cat1'" class="bg-[#12161f] border border-white/5 p-6 md:p-8 rounded-xl space-y-8 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-l-2 border-[#ff4655] pl-3 text-lg">
            I. THÔNG TIN GIẢI ĐẤU & GIẢI THƯỞNG
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tên giải đấu -->
            <div class="bg-[#1a212d] rounded-lg p-5">
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">TÊN GIẢI ĐẤU</div>
              <div class="text-xs sm:text-sm text-white font-bold uppercase">{{ tournament?.name || 'Đang tải...' }}</div>
            </div>
            <!-- Hình thức -->
            <div class="bg-[#1a212d] rounded-lg p-5">
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">HÌNH THỨC THI ĐẤU</div>
              <div class="text-xs sm:text-sm text-[#4c84a0] font-bold uppercase">ONLINE (PHÒNG THOẠI DISCORD)</div>
            </div>
            <!-- Quy mô -->
            <div class="bg-[#1a212d] rounded-lg p-5">
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">QUY MÔ</div>
              <div class="text-xs sm:text-sm text-white font-bold uppercase">
                {{ tournament?.max_teams ? (tournament.max_teams < 10 ? '0' + tournament.max_teams : tournament.max_teams) : '--' }} ĐỘI TUYỂN
              </div>
            </div>
            <!-- Lệ phí -->
            <div class="bg-[#1a212d] rounded-lg p-5">
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">LỆ PHÍ</div>
              <div class="text-xs sm:text-sm text-yellow-500 font-bold uppercase">100 VNĐ / NGƯỜI CHƠI</div>
            </div>
          </div>

          <div>
            <h5 class="text-[#ff4655] font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <i class="fas fa-trophy"></i> CƠ CẤU GIẢI THƯỞNG CHÍNH THỨC
            </h5>
            <div class="w-full text-left bg-transparent text-xs sm:text-sm">
              <div class="flex justify-between pb-3 border-b border-white/10 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <span>HẠNG GIẢI</span>
                <span>MỨC THƯỞNG TIỀN MẶT</span>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-white/5">
                <span class="text-white font-bold flex items-center gap-2"><span class="text-lg">🥇</span> VÔ ĐỊCH</span>
                <span class="text-yellow-500 font-bold font-valorant text-sm">3.500 VNĐ</span>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-white/5">
                <span class="text-white font-bold flex items-center gap-2"><span class="text-lg">🥈</span> GIẢI NHÌ</span>
                <span class="text-white font-bold font-valorant text-sm">1.000 VNĐ</span>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-white/5">
                <span class="text-white font-bold flex items-center gap-2"><span class="text-lg">🥉</span> GIẢI BA</span>
                <span class="text-yellow-500 font-bold font-valorant text-sm">500 VNĐ</span>
              </div>
              <div class="flex justify-between items-center py-4">
                <span class="text-gray-400 font-bold flex items-center gap-2"><span class="text-lg">🏅</span> TUYỂN THỦ XUẤT SẮC NHẤT (MVP)</span>
                <span class="text-gray-500 font-bold text-xs">0 VNĐ (Vinh danh danh dự)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- II. ĐIỀU KIỆN THAM GIA -->
        <div v-else-if="activeRuleCategory === 'cat2'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-user-shield text-[#ff4655]"></i>
            II. Điều kiện tham gia
          </h4>
          <ul class="space-y-4 text-xs sm:text-sm text-slate-300">
            <li class="flex items-start gap-3">
              <span class="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
              <p>Là thành viên chính thức thuộc Server Discord <strong class="text-white">DK Group</strong>.</p>
            </li>
            <li class="flex items-start gap-3">
              <span class="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
              <p>Mỗi người chơi chỉ được đăng ký và thi đấu cho <strong class="text-white">01 đội tuyển duy nhất</strong>.</p>
            </li>
            <li class="flex items-start gap-3">
              <span class="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
              <p>Tuyển thủ được phép sử dụng tài khoản Riot Games khác (clone account) nhưng phải khai báo đúng Riot ID khi đăng ký.</p>
            </li>
            <li class="flex items-start gap-3">
              <span class="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
              <p>Tên nhân vật (Riot ID), tên đội tuyển và logo không được chứa nội dung thô tục, phản cảm, xúc phạm hoặc vi phạm pháp luật.</p>
            </li>
          </ul>
        </div>

        <!-- III. LỘ TRÌNH GIẢI ĐẤU (TIMELINE) -->
        <div v-else-if="activeRuleCategory === 'cat3'" class="bg-[#12161f] border border-white/5 p-6 md:p-8 rounded-xl animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-l-2 border-[#ff4655] pl-3 text-lg mb-8">
            III. Lộ trình giải đấu chi tiết
          </h4>
          
          <div class="relative">
            <!-- Vertical line -->
            <div class="absolute top-2 bottom-2 left-[19px] w-px bg-white/10"></div>
            
            <div class="space-y-8">
              <!-- Phase 1: Chuẩn bị -->
              <div class="relative pl-12">
                <div class="absolute left-3 top-1 w-4 h-4 rounded-full border-2 border-cyan-400 bg-[#12161f]"></div>
                <div class="text-[10px] font-bold uppercase text-cyan-400 tracking-wider mb-1">GIAI ĐOẠN 1: 01/06/2026 – 09/06/2026</div>
                <div class="text-white font-bold uppercase text-sm sm:text-base mb-1">CHUẨN BỊ GIẢI ĐẤU</div>
                <div class="text-gray-400 text-xs sm:text-sm">Ban tổ chức lên kế hoạch, ban hành luật chính thức và hoàn thiện hệ thống cơ sở dữ liệu.</div>
              </div>
              
              <!-- Phase 2: Đăng ký -->
              <div class="relative pl-12">
                <div class="absolute left-3 top-1 w-4 h-4 rounded-full border-2 border-amber-400 bg-[#12161f]"></div>
                <div class="text-[10px] font-bold uppercase text-amber-400 tracking-wider mb-1">GIAI ĐOẠN 2: 10/06/2026 – 27/06/2026</div>
                <div class="text-white font-bold uppercase text-sm sm:text-base mb-1">MỞ ĐĂNG KÝ TUYỂN THỦ</div>
                <div class="text-gray-400 text-xs sm:text-sm">Tuyển thủ đăng ký thông tin cá nhân và Riot ID trên hệ thống chính thức của website giải đấu.</div>
              </div>

              <!-- Phase 3: Thi đấu -->
              <div class="relative pl-12">
                <div class="absolute left-3 top-1 w-4 h-4 rounded-full border-2 border-orange-400 bg-[#12161f]"></div>
                <div class="text-[10px] font-bold uppercase text-orange-400 tracking-wider mb-1">GIAI ĐOẠN 3: TỪ 01/08/2026</div>
                <div class="text-white font-bold uppercase text-sm sm:text-base mb-1">TRANH TÀI CHÍNH THỨC</div>
                <div class="text-gray-400 text-xs sm:text-sm">Khai mạc loạt trận đấu Vòng Bảng Swiss System và các vòng Loại trực tiếp (Playoffs).</div>
              </div>

              <!-- Phase 4: Kết thúc -->
              <div class="relative pl-12">
                <div class="absolute left-3 top-1 w-4 h-4 rounded-full border-2 border-[#ff4655] bg-[#12161f]"></div>
                <div class="text-[10px] font-bold uppercase text-[#ff4655] tracking-wider mb-1">GIAI ĐOẠN 4: CUỐI THÁNG 08/2026</div>
                <div class="text-white font-bold uppercase text-sm sm:text-base mb-1">KẾT THÚC & TRAO GIẢI</div>
                <div class="text-gray-400 text-xs sm:text-sm">Bế mạc giải đấu, trao các giải thưởng chính thức cho các đội tuyển và vinh danh nhà vô địch.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- IV. THỂ THỨC THI ĐẤU -->
        <div v-else-if="activeRuleCategory === 'cat4'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-6 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-project-diagram text-[#ff4655]"></i>
            IV. Thể thức thi đấu
          </h4>
          <div class="space-y-4">
            <div class="border-b border-white/5 pb-4 space-y-3">
              <strong class="text-white block text-sm font-bold">1. Vòng Bảng (Thể thức Thụy Sĩ - Swiss System)</strong>
              <ul class="space-y-2 text-slate-300 text-xs pl-4 list-disc">
                <li>Toàn bộ trận đấu thi đấu theo thể thức <strong>BO3</strong>. Thắng mỗi trận được <strong>1 điểm</strong>.</li>
                <li><strong>Đội thắng đủ 2 trận</strong> -> Lập tức đi tiếp vào Bán Kết.</li>
                <li><strong>Đội thua đủ 2 trận</strong> -> Bị loại khỏi giải đấu.</li>
                <li>Xếp hạt giống ban đầu dựa theo tổng giá trị KOIN đội hình giảm dần: <strong>A(900), B(800), C(700), D(600), E(500), F(400)</strong>.</li>
                <li>
                  <strong>Sắp xếp các vòng đấu:</strong>
                  <ul class="pl-4 space-y-1.5 list-none mt-2 text-slate-400">
                    <li>📍 <strong>Vòng 1:</strong> Bắt cặp hạt giống kề nhau: A-B, C-D, E-F.</li>
                    <li>📍 <strong>Vòng 2:</strong>
                      <ul class="pl-5 space-y-1 list-disc text-slate-400">
                        <li>*Cặp 1-0:* 2 đội thắng vòng 1 có KOIN cao hơn đấu với nhau.</li>
                        <li>*Cặp 0-1:* 2 đội thua vòng 1 có KOIN thấp hơn đấu với nhau.</li>
                        <li>*Cặp đấu chéo:* 2 đội còn sót lại đấu với nhau (1-0 vs 0-1).</li>
                      </ul>
                    </li>
                    <li>📍 <strong>Vòng 3:</strong>
                      <ul class="pl-5 space-y-1 list-disc text-slate-400">
                        <li>Đội 2-0 đi tiếp. Đội 0-2 bị loại.</li>
                        <li>Nhóm 1-1 thi đấu giành vé vào Bán Kết.</li>
                        <li><span class="italic text-slate-500">Lưu ý:</span> Do Bán Kết lấy 4 đội nên khi có 2 đội 0-2 bị loại, các trận đấu 1-1 còn lại có thể không cần đấu nếu các tuyển thủ đồng thuận.</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <div class="pt-2 space-y-2">
              <strong class="text-white block text-sm font-bold">2. Vòng Loại Trực Tiếp (Playoffs)</strong>
              <ul class="space-y-2 text-slate-300 text-xs pl-4 list-disc">
                <li><strong>Bán Kết (BO3):</strong> Đội hạt giống KOIN cao nhất gặp thấp nhất, 2 đội còn lại gặp nhau.</li>
                <li><strong>Tranh Hạng 3-4 (BO3):</strong> 2 đội thua Bán Kết thi đấu.</li>
                <li><strong>Chung Kết (BO3):</strong> Tranh ngôi Vô Địch.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- V. THỂ THỨC CẤM/CHỌN BẢN ĐỒ (MAP VETO) -->
        <div v-else-if="activeRuleCategory === 'cat5'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-map-marked-alt text-[#ff4655]"></i>
            V. Thể thức cấm/chọn bản đồ (Map Veto)
          </h4>
          <p class="italic text-slate-400 text-xs leading-tight mb-2">Đội có giá trị KOIN đội hình lớn hơn là Đội A, đội còn lại là Đội B.</p>
          
          <div class="space-y-6 pt-2">
            <div class="border-l-2 border-[#ff4655]/40 pl-4 space-y-2">
              <span class="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider block">1. Thể thức BO3</span>
              <ul class="space-y-1.5 text-slate-300 text-xs pl-1">
                <li>🔴 <strong>Lượt 1:</strong> Đội A Ban bản đồ thứ 1 (Còn 6 map)</li>
                <li>🔴 <strong>Lượt 2:</strong> Đội B Ban bản đồ thứ 2 (Còn 5 map)</li>
                <li>🟢 <strong>Lượt 3:</strong> Đội A Pick Map 1 -> <span class="text-slate-400">Đội B chọn bên (Công/Thủ)</span></li>
                <li>🟢 <strong>Lượt 4:</strong> Đội B Pick Map 2 -> <span class="text-slate-400">Đội A chọn bên (Công/Thủ)</span></li>
                <li>🔴 <strong>Lượt 5:</strong> Đội A Ban bản đồ thứ 5 (Còn 2 map)</li>
                <li>🔴 <strong>Lượt 6:</strong> Đội B Ban bản đồ thứ 6 (Còn 1 map)</li>
                <li>🟡 <strong>Lượt 7 (Decider):</strong> Bản đồ cuối cùng là Map 3 -> <span class="text-slate-400">Đội B chọn bên</span></li>
              </ul>
            </div>

            <div class="border-l-2 border-[#ff4655]/40 pl-4 space-y-2">
              <span class="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider block">2. Thể thức BO5</span>
              <ul class="space-y-1.5 text-slate-300 text-xs pl-1">
                <li>🔴 <strong>Lượt 1 & 2:</strong> Đội A Ban 1 map -> Đội B Ban 1 map.</li>
                <li>🟢 <strong>Lượt 3 & 4:</strong> Đội A Pick Map 1 (Đội B chọn bên) -> Đội B Pick Map 2 (Đội A chọn bên).</li>
                <li>🟢 <strong>Lượt 5 & 6:</strong> Đội A Pick Map 3 (Đội B chọn bên) -> Đội B Pick Map 4 (Đội A chọn bên).</li>
                <li>🟡 <strong>Lượt 7 (Decider):</strong> Map cuối cùng còn lại là Map 5 -> <span class="text-slate-400">Đội B chọn bên</span>.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- VI. ĐÚNG GIỜ & CHECK-IN -->
        <div v-else-if="activeRuleCategory === 'cat6'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-clock text-[#ff4655]"></i>
            VI. Đúng giờ & Check-in
          </h4>
          <ul class="space-y-2 text-slate-300 text-xs sm:text-sm list-disc list-inside pl-1">
            <li>Có mặt để check-in và kiểm tra kỹ thuật trước trận đấu <strong class="text-white">15 phút</strong>.</li>
            <li>
              <strong class="text-white">Quy định muộn giờ:</strong>
              <ul class="pl-4 space-y-1.5 list-disc mt-1 text-slate-400">
                <li>Trễ <strong class="text-white">15 phút</strong>: Cảnh báo lần 1.</li>
                <li>Trễ <strong class="text-white">30 phút</strong>: Xử thua Map 1.</li>
                <li>Nhận cảnh báo lần thứ 2 trong giải đấu sẽ bị <strong class="text-[#ff4655]">xử thua cả trận (FF)</strong>.</li>
              </ul>
            </li>
          </ul>
        </div>

        <!-- VII. TẠM DỪNG TRẬN ĐẤU (PAUSE) -->
        <div v-else-if="activeRuleCategory === 'cat7'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-pause-circle text-[#ff4655]"></i>
            VII. Tạm dừng trận đấu (Pause)
          </h4>
          <ul class="space-y-2 text-slate-300 text-xs sm:text-sm list-disc list-inside pl-1">
            <li><strong class="text-white">Tactical Pause:</strong> Tối đa <strong class="text-white">02 lần / map</strong>.</li>
            <li><strong class="text-white">Technical Pause:</strong> Không giới hạn số lần cho các lỗi về đường truyền, lỗi game, lỗi thiết bị phần cứng, "công nghệ lõi".</li>
          </ul>
        </div>

        <!-- VIII. QUY ĐỊNH VOICE & STREAM -->
        <div v-else-if="activeRuleCategory === 'cat8'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-headset text-[#ff4655]"></i>
            VIII. Quy định Voice & Stream
          </h4>
          <ul class="space-y-2 text-slate-300 text-xs sm:text-sm list-disc list-inside pl-1">
            <li>Bắt buộc sử dụng kênh thoại Discord của <strong class="text-white">DK Group</strong>.</li>
            <li>Mỗi đội phải có <strong class="text-white">ít nhất 1 thành viên livestream</strong> quá trình thi đấu (bật lưu trữ/VOD) để tổ trọng tài theo dõi và giám sát.</li>
          </ul>
        </div>

        <!-- IX. HÀNH VI BỊ CẤM -->
        <div v-else-if="activeRuleCategory === 'cat9'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-ban text-[#ff4655]"></i>
            IX. Hành vi bị cấm
          </h4>
          <ul class="space-y-2 text-slate-300 text-xs sm:text-sm list-disc list-inside pl-1">
            <li>Nghiêm cấm: Hack/Cheat, phần mềm bên thứ 3, Ghosting, Stream Sniping, mạo danh người chơi, AFK, dàn xếp tỷ số.</li>
            <li><strong>Lạm dụng bug game:</strong> Vô tình gặp bug thì tiếp tục đấu; cố ý lạm dụng sẽ bị phạt.</li>
          </ul>
        </div>

        <!-- X. HÌNH THỨC XỬ PHẠT -->
        <div v-else-if="activeRuleCategory === 'cat10'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-gavel text-[#ff4655]"></i>
            X. Hình thức xử phạt
          </h4>
          <ul class="space-y-2 text-slate-300 text-xs sm:text-sm list-disc list-inside pl-1">
            <li><strong>Trễ giờ thi đấu:</strong> Cảnh cáo / Xử thua map/trận.</li>
            <li><strong>Hack/Cheat:</strong> Loại khỏi giải đấu lập tức, ban vĩnh viễn khỏi server Discord.</li>
            <li><strong>Stream Sniping:</strong> Xử thua trận đấu.</li>
            <li><strong>Toxic, thái độ phi thể thao:</strong> Cảnh cáo / Loại khỏi giải.</li>
          </ul>
        </div>

        <!-- XI. KHIẾU NẠI & TRANH CHẤP -->
        <div v-else-if="activeRuleCategory === 'cat11'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-exclamation-triangle text-[#ff4655]"></i>
            XI. Khiếu nại & Tranh chấp
          </h4>
          <ul class="space-y-2 text-slate-300 text-xs sm:text-sm list-disc list-inside pl-1">
            <li>Khiếu nại gửi về BTC trong vòng <strong class="text-white">15 phút</strong> sau khi trận đấu kết thúc.</li>
            <li>Bắt buộc cung cấp minh chứng cụ thể (Video, ảnh chụp, clip tình huống).</li>
            <li><strong>Quyết định của BTC là quyết định cuối cùng.</strong></li>
          </ul>
        </div>

        <!-- XII. QUYỀN HẠN CỦA BAN TỔ CHỨC -->
        <div v-else-if="activeRuleCategory === 'cat12'" class="bg-gradient-to-b from-[#0c121f] to-[#0f192b] border border-white/[0.08] p-6 rounded-2xl space-y-4 animate-fadeIn">
          <h4 class="text-white font-bold font-valorant tracking-wide uppercase flex items-center gap-2 border-b border-white/5 pb-2 text-sm sm:text-base">
            <i class="fas fa-shield-alt text-[#ff4655]"></i>
            XII. Quyền hạn của Ban Tổ Chức
          </h4>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
            BTC có quyền điều chỉnh lịch thi đấu, thay đổi luật khi cần thiết, xử phạt gian lận và có toàn quyền đưa ra phán quyết cuối cùng trong mọi tranh chấp.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  tournament: {
    type: Object,
    default: null
  }
})

const activeRuleCategory = ref('cat1')

const ruleCategories = [
  { id: 'cat1', name: 'I. Thông tin & Giải thưởng', icon: 'fas fa-trophy' },
  { id: 'cat2', name: 'II. Điều kiện tham gia', icon: 'fas fa-user-shield' },
  { id: 'cat3', name: 'III. Lộ trình chi tiết', icon: 'fas fa-calendar-alt' },
  { id: 'cat4', name: 'IV. Thể thức thi đấu', icon: 'fas fa-project-diagram' },
  { id: 'cat5', name: 'V. Cấm/Chọn bản đồ', icon: 'fas fa-map-marked-alt' },
  { id: 'cat6', name: 'VI. Đúng giờ & Check-in', icon: 'fas fa-clock' },
  { id: 'cat7', name: 'VII. Tạm dừng trận đấu', icon: 'fas fa-pause-circle' },
  { id: 'cat8', name: 'VIII. Quy định Voice & Stream', icon: 'fas fa-headset' },
  { id: 'cat9', name: 'IX. Hành vi bị cấm', icon: 'fas fa-ban' },
  { id: 'cat10', name: 'X. Hình thức xử phạt', icon: 'fas fa-gavel' },
  { id: 'cat11', name: 'XI. Khiếu nại & Tranh chấp', icon: 'fas fa-exclamation-triangle' },
  { id: 'cat12', name: 'XII. Quyền hạn của BTC', icon: 'fas fa-shield-alt' }
]
</script>
