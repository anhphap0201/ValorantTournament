// General utility helper functions for Valorant Tracker - ES Modules
const Utils = {
  // Format Date to string (e.g. 17:00 13/06/2026)
  formatDate(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (isNaN(date)) return 'TBD';
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Get Rank styles based on Valorant ranks
  getRankBadgeClass(rankName) {
    if (!rankName) return 'bg-gray-600 text-white';
    
    const rank = rankName.toLowerCase();
    if (rank.includes('radiant')) return 'bg-yellow-400 text-black font-semibold ring-2 ring-yellow-300';
    if (rank.includes('immortal') || rank.includes('bất tử')) return 'bg-red-600 text-white font-semibold ring-1 ring-red-400';
    if (rank.includes('ascendant') || rank.includes('hộ vệ')) return 'bg-emerald-600 text-white';
    if (rank.includes('diamond') || rank.includes('kim cương')) return 'bg-purple-600 text-white';
    if (rank.includes('platinum') || rank.includes('bạch kim')) return 'bg-cyan-600 text-white';
    if (rank.includes('gold') || rank.includes('vàng')) return 'bg-yellow-600 text-white';
    if (rank.includes('silver') || rank.includes('bạc')) return 'bg-slate-400 text-black';
    if (rank.includes('bronze') || rank.includes('đồng')) return 'bg-amber-800 text-white';
    if (rank.includes('iron') || rank.includes('sắt')) return 'bg-zinc-500 text-white';
    
    return 'bg-gray-600 text-white';
  },

  // Get role color badges
  getRoleBadge(role) {
    if (!role) return 'bg-gray-800 text-gray-400';
    const r = role.toLowerCase();
    if (r === 'duelist' || r === 'đối đầu') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (r === 'initiator' || r === 'khởi tranh') return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    if (r === 'sentinel' || r === 'hộ vệ' || r === 'canh gác') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (r === 'controller' || r === 'kiểm soát') return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  },

  // Calculate KD Ratio
  calculateKD(kills, deaths) {
    const k = parseInt(kills) || 0;
    const d = parseInt(deaths) || 0;
    if (d === 0) return k.toFixed(2);
    return (k / d).toFixed(2);
  },

  // Calculate Headshot Percentage
  calculateHS(headshots, kills) {
    const hs = parseInt(headshots) || 0;
    const k = parseInt(kills) || 0;
    if (k === 0) return '0%';
    return `${Math.round((hs / (k * 4)) * 100)}%`; // assuming avg 4 hits per kill or similar, or just standard direct ratio
  },

  // Show toast notification
  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-4 right-4 z-50 flex flex-col  pointer-events-none';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded shadow-lg text-white pointer-events-auto transform translate-y-2 opacity-0 transition-all duration-300 flex items-center  max-w-sm ${
      type === 'success' ? 'bg-emerald-600 border-l-4 border-emerald-400' :
      type === 'error' ? 'bg-rose-600 border-l-4 border-rose-400' :
      'bg-blue-600 border-l-4 border-blue-400'
    }`;
    
    toast.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" class="ml-auto text-white/80 hover:text-white">&times;</button>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);
    
    // Auto-remove
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

export default Utils;
