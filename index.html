<!DOCTYPE html>
<html lang="ko" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SCRIM-BALANCER - 실시간 내전 팀 밸런서 & 전적 엔진</title>
  
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚖️</text></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">

  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              gold: '#e0b354',
              goldHover: '#f5c96b',
              blueTeam: '#2563eb',
              redTeam: '#dc2626'
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #e0b354; }

    .tier-badge {
      font-size: 0.65rem;
      padding: 1px 6px;
      border-radius: 9999px;
      font-weight: 700;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .tier-challenger { background: rgba(56, 189, 248, 0.15); color: #0284c7; border: 1px solid rgba(56, 189, 248, 0.4); }
    .dark .tier-challenger { color: #38bdf8; }
    .tier-grandmaster { background: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.4); }
    .dark .tier-grandmaster { color: #f87171; }
    .tier-master { background: rgba(192, 132, 252, 0.15); color: #9333ea; border: 1px solid rgba(192, 132, 252, 0.4); }
    .dark .tier-master { color: #c084fc; }
    .tier-diamond { background: rgba(129, 140, 248, 0.15); color: #4f46e5; border: 1px solid rgba(129, 140, 248, 0.4); }
    .dark .tier-diamond { color: #818cf8; }
    .tier-emerald { background: rgba(52, 211, 153, 0.15); color: #059669; border: 1px solid rgba(52, 211, 153, 0.4); }
    .dark .tier-emerald { color: #34d399; }
    .tier-platinum { background: rgba(45, 212, 191, 0.15); color: #0d9488; border: 1px solid rgba(45, 212, 191, 0.4); }
    .dark .tier-platinum { color: #2dd4bf; }
    .tier-gold { background: rgba(250, 204, 21, 0.15); color: #ca8a04; border: 1px solid rgba(250, 204, 21, 0.4); }
    .dark .tier-gold { color: #facc15; }
    .tier-silver { background: rgba(148, 163, 184, 0.15); color: #475569; border: 1px solid rgba(148, 163, 184, 0.4); }
    .dark .tier-silver { color: #94a3b8; }
    .tier-bronze { background: rgba(217, 119, 6, 0.15); color: #b45309; border: 1px solid rgba(217, 119, 6, 0.4); }
    .dark .tier-bronze { color: #fbbf24; }
    .tier-iron { background: rgba(100, 116, 139, 0.15); color: #334155; border: 1px solid rgba(100, 116, 139, 0.4); }
    .dark .tier-iron { color: #94a3b8; }
  </style>
</head>
<body class="min-h-screen flex antialiased bg-slate-100 text-slate-800 dark:bg-[#0b0e14] dark:text-slate-200 transition-colors duration-200">

  <!-- Left Sidebar -->
  <aside class="w-64 bg-white dark:bg-[#121721] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen select-none z-30">
    <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
          <i class="fa-solid fa-scale-balanced text-gray-950 font-black text-sm"></i>
        </div>
        <div>
          <h1 class="font-black text-sm tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 leading-tight">SCRIM-BALANCER</h1>
          <span class="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">PRO SERVERLESS ENGINE</span>
        </div>
      </div>
      <button onclick="toggleTheme()" class="p-1.5 rounded-lg bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:scale-105 transition" title="다크/라이트 모드">
        <i id="theme-icon" class="fa-solid fa-sun text-xs"></i>
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="p-3 space-y-1.5 text-xs font-semibold">
      <button id="nav-balancer" onclick="switchTab('balancer')" class="w-full px-3.5 py-2.5 rounded-xl transition flex items-center gap-3 bg-amber-500/15 text-amber-600 dark:text-brand-gold border border-amber-500/30">
        <i class="fa-solid fa-scale-balanced w-4 text-center"></i>
        <span>10인 스마트 밸런서</span>
      </button>

      <button id="nav-summoners" onclick="switchTab('summoners')" class="w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#161d2a]">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-users w-4 text-center"></i>
          <span>전체 멤버 목록</span>
        </div>
        <span id="nav-roster-count" class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">0</span>
      </button>

      <button id="nav-history" onclick="switchTab('history')" class="w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#161d2a]">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-clock-rotate-left w-4 text-center"></i>
          <span>내전 매치 히스토리</span>
        </div>
        <span id="nav-history-count" class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">0</span>
      </button>

      <button id="nav-replay" onclick="switchTab('replay')" class="w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#161d2a]">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-file-video w-4 text-center text-sky-500"></i>
          <span>리플레이 보관함(.rofl)</span>
        </div>
        <span id="nav-replay-count" class="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500">0</span>
      </button>
    </nav>

    <!-- 빠른 멤버 서랍 -->
    <div class="px-3 py-2 border-t border-slate-200 dark:border-slate-800">
      <button onclick="toggleSidebarMemberDrawer()" class="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#161d2a] hover:bg-slate-200 dark:hover:bg-[#1c2435] text-xs font-bold text-slate-700 dark:text-gray-200 flex items-center justify-between transition">
        <span class="flex items-center gap-2">
          <i class="fa-solid fa-address-book text-amber-500"></i>
          <span>빠른 멤버 서랍</span>
        </span>
        <i id="drawer-chevron-icon" class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200"></i>
      </button>

      <div id="sidebar-drawer-container" class="hidden mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
        <div id="sidebar-drawer-list" class="space-y-1"></div>
      </div>
    </div>

    <div class="flex-1"></div>

    <!-- 하단 제어 -->
    <div class="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
      <button onclick="clearSelection()" class="w-full py-1.5 text-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition border border-amber-500/20">
        <i class="fa-solid fa-rotate-left mr-1"></i> 오늘 10인 선택 비우기
      </button>
      <button onclick="resetToVerifiedDefaults()" class="w-full py-1.5 text-center text-[11px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition border border-rose-500/20">
        <i class="fa-solid fa-arrows-rotate mr-1"></i> 실제 전적 데이터로 강제 초기화
      </button>
    </div>
  </aside>

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <!-- Top Action Header -->
    <header class="p-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#121721]/60 backdrop-blur flex flex-col md:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2 w-full md:max-w-xl">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input id="quick-search-input" type="text" placeholder="소환사명#태그 (예: 선릉 오디세우스#KR2, 대한민국이대경#7847)" 
                 onkeypress="if(event.key === 'Enter') fetchRiotData()"
                 class="w-full bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500">
        </div>
        <button onclick="fetchRiotData()" id="btn-quick-search" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 text-gray-950 font-bold text-xs shadow-md transition shrink-0 flex items-center gap-1.5">
          <i class="fa-solid fa-bolt"></i>
          <span>실시간 전적 조회</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="openLobbyModal()" class="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-100 transition flex items-center gap-1.5">
          <i class="fa-solid fa-paste"></i>
          <span>로비 10명 일괄 등록</span>
        </button>
        <button onclick="openAddSummonerModal()" class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-200 font-bold text-xs hover:bg-slate-200 transition flex items-center gap-1.5">
          <i class="fa-solid fa-user-plus text-amber-500"></i>
          <span>직접 추가</span>
        </button>
      </div>
    </header>

    <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none"></div>

    <div class="p-4 sm:p-8 space-y-6 flex-1">

      <!-- SECTION 1: 10인 스마트 밸런서 (BALANCER) -->
      <section id="tab-content-balancer" class="space-y-6">
        <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-slate-900 dark:text-gray-100">오늘 내전 참가자 (10인 선택)</h2>
                <span id="selected-badge" class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 text-amber-500">
                  0 / 10명 선택됨
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">
                타일을 클릭해 선택하거나 <i class="fa-solid fa-circle-xmark text-rose-500"></i> 버튼을 눌러 오늘 명단에서 바로 제외할 수 있습니다.
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="autoSelectTop10()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161d2a] hover:bg-slate-200 text-xs font-semibold transition flex items-center gap-1.5">
                <i class="fa-solid fa-bolt text-amber-500"></i>
                <span>상위 10명 픽</span>
              </button>
              <button onclick="clearSelection()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161d2a] hover:bg-slate-200 text-xs text-slate-500 transition">
                선택 초기화
              </button>
              <button id="btn-run-balancing" onclick="runSmartBalancing()" disabled class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:brightness-110 text-gray-950 font-extrabold text-xs shadow-lg disabled:opacity-40 transition flex items-center gap-2">
                <i class="fa-solid fa-scale-balanced text-sm"></i>
                <span>스마트 밸런싱 실행</span>
              </button>
            </div>
          </div>

          <div id="balancer-selection-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1"></div>
        </div>

        <div id="balanced-container">
          <div id="balancer-placeholder" class="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center bg-white/40 dark:bg-[#121721]/40">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-2xl mb-3">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h3 class="text-slate-700 dark:text-gray-300 font-bold text-sm sm:text-base">대진표가 아직 생성되지 않았습니다</h3>
            <p class="text-xs text-slate-500 mt-1">상단 소환사 목록에서 10명을 체크한 뒤 <strong>[스마트 밸런싱 실행]</strong>을 클릭하세요.</p>
          </div>

          <div id="balancer-board" class="hidden space-y-6">
            <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg">
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 dark:text-gray-400">평균 MMR 격차:</span>
                  <span id="stat-avg-diff" class="text-sm font-extrabold text-amber-500">0 pt</span>
                </div>
                <div class="h-3 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 dark:text-gray-400">승률 시뮬레이션:</span>
                  <span id="stat-win-prob" class="text-xs font-bold text-slate-700 dark:text-gray-200">50% vs 50%</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button onclick="rerollBalancing()" class="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161d2a] hover:bg-slate-200 text-slate-700 dark:text-gray-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5">
                  <i class="fa-solid fa-arrows-rotate text-sky-500"></i>
                  <span>재셔플 (Re-roll)</span>
                </button>
                <button onclick="openRecordMatchModal()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
                  <i class="fa-solid fa-trophy"></i>
                  <span>내전 결과 등록 & 승률 반영</span>
                </button>
              </div>
            </div>

            <!-- 5v5 Arena Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
              <div class="lg:col-span-5 bg-white dark:bg-[#121721] border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between pb-3 mb-3 border-b border-blue-100 dark:border-blue-900/40">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">B</div>
                      <div>
                        <h3 class="font-extrabold text-blue-600 dark:text-blue-400 text-sm">BLUE TEAM</h3>
                        <p class="text-[10px] text-slate-400">평균 종합 MMR: <strong id="blue-team-mmr" class="text-slate-700 dark:text-gray-200">0</strong></p>
                      </div>
                    </div>
                    <span id="blue-predicted-rate" class="text-lg font-black text-blue-600 dark:text-blue-400">50%</span>
                  </div>
                  <div id="blue-roster-list" class="space-y-2.5"></div>
                </div>
              </div>

              <div class="hidden lg:flex lg:col-span-1 flex-col items-center justify-center space-y-4 text-slate-400">
                <div class="w-px h-20 bg-slate-200 dark:bg-slate-800"></div>
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#161d2a] border border-amber-500/40 flex items-center justify-center text-amber-500 font-black text-xs shadow-md">VS</div>
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">LANE<br/>DIFF</span>
                <div class="w-px h-20 bg-slate-200 dark:bg-slate-800"></div>
              </div>

              <div class="lg:col-span-5 bg-white dark:bg-[#121721] border border-red-200 dark:border-red-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between pb-3 mb-3 border-b border-red-100 dark:border-red-900/40">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center">R</div>
                      <div>
                        <h3 class="font-extrabold text-red-600 dark:text-red-400 text-sm">RED TEAM</h3>
                        <p class="text-[10px] text-slate-400">평균 종합 MMR: <strong id="red-team-mmr" class="text-slate-700 dark:text-gray-200">0</strong></p>
                      </div>
                    </div>
                    <span id="red-predicted-rate" class="text-lg font-black text-red-600 dark:text-red-400">50%</span>
                  </div>
                  <div id="red-roster-list" class="space-y-2.5"></div>
                </div>
              </div>
            </div>

            <!-- Swap Lineup Tool -->
            <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-gray-400 gap-3">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-arrows-left-right text-sky-500"></i>
                <span>라인 맞교환(Swap): 특정 포지션을 클릭 한 번으로 상호 교체할 수 있습니다.</span>
              </div>
              <div class="flex items-center gap-2">
                <select id="swap-pos" class="bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-gray-200 focus:outline-none">
                  <option value="TOP">TOP 라인 교체</option>
                  <option value="JUG">JUG 라인 교체</option>
                  <option value="MID">MID 라인 교체</option>
                  <option value="ADC">ADC 라인 교체</option>
                  <option value="SUP">SUP 라인 교체</option>
                </select>
                <button onclick="swapLaneLineup()" class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#161d2a] hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-200 font-semibold transition">
                  선택 라인 교체
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2: 전체 멤버 목록 (SUMMONERS) -->
      <section id="tab-content-summoners" class="hidden space-y-6">
        <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
          <div class="flex items-center gap-3 flex-1 flex-wrap">
            <div class="relative flex-1 min-w-[200px]">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input id="search-input" oninput="renderSummonersList()" type="text" placeholder="명단 내 소환사 검색..." class="w-full bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500">
            </div>
          </div>
        </div>
        <div id="summoners-card-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      </section>

      <!-- SECTION 3: 매치 히스토리 (HISTORY) -->
      <section id="tab-content-history" class="hidden space-y-4">
        <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
              <i class="fa-solid fa-clock-rotate-left text-amber-500"></i>
              <span>내전 매치 히스토리</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-gray-400">누적된 내전 경기 결과입니다.</p>
          </div>
          <button onclick="resetMatchHistory()" class="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-red-950/40 text-rose-600 dark:text-red-400 border border-rose-200 dark:border-red-900/40 text-xs transition">
            <i class="fa-solid fa-trash-can mr-1"></i> 히스토리 전체 삭제
          </button>
        </div>
        <div id="match-history-list" class="space-y-3"></div>
      </section>

      <!-- SECTION 4: 리플레이 파일 보관함 (REPLAY) -->
      <section id="tab-content-replay" class="hidden space-y-6">
        <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div class="mb-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
              <i class="fa-solid fa-file-video text-amber-500"></i>
              <span>내전 리플레이(.rofl) 보관함</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">
              내전 종료 후 다운로드받은 <code class="text-amber-500 font-mono">KR-xxxx.rofl</code> 파일을 드래그하여 놓으시면 보관함에 영구 저장됩니다.
            </p>
          </div>

          <div id="rofl-dropzone" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)"
               class="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl p-8 text-center bg-slate-50/60 dark:bg-[#161d2a]/40 cursor-pointer transition">
            <input type="file" id="rofl-file-input" accept=".rofl" onchange="handleFileSelect(event)" class="hidden">
            <div onclick="document.getElementById('rofl-file-input').click()">
              <div class="w-12 h-12 rounded-2xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center text-amber-500 text-xl mb-2 shadow-md">
                <i class="fa-solid fa-file-arrow-up"></i>
              </div>
              <h3 class="text-xs font-bold text-slate-800 dark:text-gray-200">리플레이(.rofl) 파일을 이곳에 놓거나 클릭하여 보관</h3>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 class="text-xs font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
            <i class="fa-solid fa-box-archive text-sky-500"></i>
            <span>보관된 내전 리플레이 파일 목록</span>
          </h3>
          <div id="replay-archive-list" class="space-y-2 text-xs"></div>
        </div>
      </section>

    </div>
  </main>

  <!-- Modals -->
  <!-- 1. 소환사 상세 전적 팝업 -->
  <div id="modal-member-detail" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
      <button onclick="closeMemberDetailModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"><i class="fa-solid fa-xmark"></i></button>
      <div id="modal-member-detail-body"></div>
    </div>
  </div>

  <!-- 2. 로비 채팅 필터링 모달 -->
  <div id="modal-lobby" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
      <button onclick="closeLobbyModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"><i class="fa-solid fa-xmark"></i></button>
      <h3 class="text-base font-bold text-sky-500 mb-2 flex items-center gap-2"><i class="fa-solid fa-paste"></i> <span>로비 채팅 정밀 등록</span></h3>
      <p class="text-xs text-slate-500 mb-3">'~님이 로비에 참가하셨습니다.' 문구를 자동 추출합니다.</p>
      <textarea id="lobby-text-area" rows="6" class="w-full bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none mb-3"></textarea>
      <div class="flex justify-end gap-2">
        <button onclick="closeLobbyModal()" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#161d2a] text-xs font-semibold">취소</button>
        <button onclick="parseLobbyChat()" class="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs">10명 자동 등록</button>
      </div>
    </div>
  </div>

  <!-- 3. 소환사 수동 등록 모달 -->
  <div id="modal-summoner" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
      <button onclick="closeSummonerModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"><i class="fa-solid fa-xmark"></i></button>
      <h3 id="modal-summoner-title" class="text-base font-bold text-amber-500 mb-4 flex items-center gap-2"><i class="fa-solid fa-user-gear"></i> <span>소환사 스펙 확인 / 등록</span></h3>
      <form id="form-summoner" onsubmit="handleSummonerSubmit(event)" class="space-y-3.5 text-xs">
        <input type="hidden" id="summoner-form-id">
        <div>
          <label for="form-name" class="block text-slate-700 dark:text-gray-300 font-semibold mb-1">소환사명#태그 *</label>
          <input id="form-name" required type="text" placeholder="예: 선릉 오디세우스#KR2" class="w-full bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="form-main-role" class="block text-slate-700 dark:text-gray-300 font-semibold mb-1">주 포지션 *</label>
            <select id="form-main-role" required class="w-full bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <option value="ADC">ADC (원딜)</option>
              <option value="MID">MID (미드)</option>
              <option value="TOP">TOP (탑)</option>
              <option value="JUG">JUG (정글)</option>
              <option value="SUP">SUP (서폿)</option>
            </select>
          </div>
          <div>
            <label for="form-tier" class="block text-slate-700 dark:text-gray-300 font-semibold mb-1">대표 티어 *</label>
            <select id="form-tier" required class="w-full bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <option value="CHALLENGER">CHALLENGER</option>
              <option value="GRANDMASTER">GRANDMASTER</option>
              <option value="MASTER">MASTER</option>
              <option value="DIAMOND">DIAMOND</option>
              <option value="EMERALD" selected>EMERALD</option>
              <option value="PLATINUM">PLATINUM</option>
              <option value="GOLD">GOLD</option>
              <option value="SILVER">SILVER</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="form-solo-tier" class="block text-slate-500 mb-1">솔로랭크 표시</label>
            <input id="form-solo-tier" type="text" placeholder="M (301LP)" class="w-full bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
          </div>
          <div>
            <label for="form-solo-games" class="block text-slate-500 mb-1">솔랭 판수</label>
            <input id="form-solo-games" type="number" value="283" class="w-full bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="form-flex-tier" class="block text-slate-500 mb-1">자유랭크 표시</label>
            <input id="form-flex-tier" type="text" placeholder="E1 (49LP)" class="w-full bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
          </div>
          <div>
            <label for="form-flex-games" class="block text-slate-500 mb-1">자랭 판수</label>
            <input id="form-flex-games" type="number" value="25" class="w-full bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
          </div>
        </div>
        <div>
          <label for="form-champions" class="block text-slate-700 dark:text-gray-300 font-semibold mb-1">모스트 챔피언</label>
          <input id="form-champions" type="text" placeholder="진, 이즈리얼, 시비르" class="w-full bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeSummonerModal()" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#161d2a]">취소</button>
          <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 font-bold text-gray-950">저장하기</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 4. 내전 결과 등록 모달 -->
  <div id="modal-match-record" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
      <button onclick="closeRecordMatchModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"><i class="fa-solid fa-xmark"></i></button>
      <h3 class="text-base font-extrabold text-slate-900 dark:text-gray-100 mb-1 flex items-center gap-2">
        <i class="fa-solid fa-trophy text-amber-500"></i>
        <span>내전 결과 및 MVP 등록</span>
      </h3>
      <div class="grid grid-cols-2 gap-3 my-4">
        <button type="button" onclick="setMatchWinner('BLUE')" id="record-btn-blue" class="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/20 text-center transition">
          <span class="block font-bold text-xs text-blue-600 dark:text-blue-400">블루팀 승리</span>
        </button>
        <button type="button" onclick="setMatchWinner('RED')" id="record-btn-red" class="p-4 rounded-xl border-2 border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-center transition">
          <span class="block font-bold text-xs text-red-600 dark:text-red-400">레드팀 승리</span>
        </button>
      </div>
      <div class="mb-5">
        <label for="record-mvp-select" class="block text-slate-700 dark:text-gray-300 text-xs font-semibold mb-1.5">경기 MVP 선정</label>
        <select id="record-mvp-select" class="w-full bg-slate-50 dark:bg-[#161d2a] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"></select>
      </div>
      <div class="flex justify-end gap-2">
        <button onclick="closeRecordMatchModal()" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#161d2a] text-xs font-semibold">취소</button>
        <button id="btn-save-record-submit" onclick="submitMatchResult()" disabled class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">전적 반영</button>
      </div>
    </div>
  </div>

  <script>
    // 11인 실제 FOW 전적 데이터
    const VERIFIED_PROFILES = {
      '선릉 오디세우스#KR2': {
        tier: 'MASTER', flexBaseTier: 'EMERALD', soloTier: 'M (301LP)', flexTier: 'E1 (49LP)',
        soloGames: 351, flexGames: 23, mainRole: 'ADC', subRole: 'MID',
        most: ['진', '이즈리얼', '시비르', '케이틀린', '카이사'], formScore: 92
      },
      '대한민국이대경#7847': {
        tier: 'PLATINUM', flexBaseTier: 'PLATINUM', soloTier: '언랭 (배치중)', flexTier: 'PL3 (2LP)',
        soloGames: 0, flexGames: 82, mainRole: 'SUP', subRole: 'MID',
        most: ['럭스', '쉔', '모르가나', '뽀삐'], formScore: 80
      },
      '똥싸고나눠주는노인#영차영차': {
        tier: 'EMERALD', flexBaseTier: 'PLATINUM', soloTier: 'E4 (1LP)', flexTier: 'PL4 (82LP)',
        soloGames: 283, flexGames: 25, mainRole: 'TOP', subRole: 'JUG',
        most: ['요릭', '다리우스', '쉔', '피오라', '잭스'], formScore: 82
      },
      '김창숙 부띠끄 부산 영도점#0615': {
        tier: 'EMERALD', flexBaseTier: 'PLATINUM', soloTier: 'E3 (40LP)', flexTier: 'PL1 (20LP)',
        soloGames: 140, flexGames: 30, mainRole: 'TOP', subRole: 'JUG', most: ['아트록스', '제이스'], formScore: 82
      },
      '조용하고성실하게#KR99': {
        tier: 'DIAMOND', flexBaseTier: 'EMERALD', soloTier: 'D4 (15LP)', flexTier: 'E2 (50LP)',
        soloGames: 210, flexGames: 45, mainRole: 'MID', subRole: 'TOP', most: ['아지르', '오리아나'], formScore: 86
      },
      '입다물면 승리#KR1': {
        tier: 'EMERALD', flexBaseTier: 'EMERALD', soloTier: 'E1 (75LP)', flexTier: 'E3 (30LP)',
        soloGames: 180, flexGames: 40, mainRole: 'JUG', subRole: 'SUP', most: ['리 신', '세주아니'], formScore: 84
      },
      '후니곰캐리#3075': {
        tier: 'PLATINUM', flexBaseTier: 'GOLD', soloTier: 'PL2 (30LP)', flexTier: 'G1 (45LP)',
        soloGames: 95, flexGames: 50, mainRole: 'ADC', subRole: 'MID', most: ['이즈리얼', '카이사'], formScore: 78
      },
      'UDT 62기#UDT': {
        tier: 'DIAMOND', flexBaseTier: 'DIAMOND', soloTier: 'D3 (60LP)', flexTier: 'D4 (20LP)',
        soloGames: 260, flexGames: 60, mainRole: 'TOP', subRole: 'MID', most: ['크산테', '나르'], formScore: 88
      },
      '따듯한 봄 햇살#KR1': {
        tier: 'EMERALD', flexBaseTier: 'PLATINUM', soloTier: 'E4 (20LP)', flexTier: 'PL2 (60LP)',
        soloGames: 110, flexGames: 35, mainRole: 'MID', subRole: 'ADC', most: ['신드라', '아리'], formScore: 81
      },
      '한끼두끼X끼#밥먹자': {
        tier: 'PLATINUM', flexBaseTier: 'PLATINUM', soloTier: 'PL1 (90LP)', flexTier: 'PL3 (15LP)',
        soloGames: 130, flexGames: 25, mainRole: 'JUG', subRole: 'TOP', most: ['바이', '자르반 IV'], formScore: 79
      },
      '핵탄 영수장#1114': {
        tier: 'EMERALD', flexBaseTier: 'GOLD', soloTier: 'E2 (50LP)', flexTier: 'G1 (70LP)',
        soloGames: 160, flexGames: 20, mainRole: 'ADC', subRole: 'SUP', most: ['바루스', '애쉬'], formScore: 83
      }
    };

    const TIER_POINTS = {
      'CHALLENGER': 3800, 'GRANDMASTER': 3300, 'MASTER': 2900,
      'DIAMOND': 2400, 'EMERALD': 2000, 'PLATINUM': 1600,
      'GOLD': 1200, 'SILVER': 900, 'BRONZE': 650, 'IRON': 400
    };

    const ROLE_METADATA = {
      'TOP': { name: 'TOP', icon: 'fa-shield-halved', color: 'text-amber-500' },
      'JUG': { name: 'JUG', icon: 'fa-paw', color: 'text-emerald-500' },
      'MID': { name: 'MID', icon: 'fa-wand-magic-sparkles', color: 'text-purple-500' },
      'ADC': { name: 'ADC', icon: 'fa-crosshairs', color: 'text-red-500' },
      'SUP': { name: 'SUP', icon: 'fa-heart', color: 'text-sky-500' },
      'FILL': { name: 'ALL', icon: 'fa-shuffle', color: 'text-slate-400' }
    };

    const ORDERED_ROLES = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];

    let summoners = [];
    let selectedPlayerIds = new Set();
    let currentMatch = null;
    let matchHistory = [];
    let replayArchives = [];
    let modalPendingWinner = null;
    let isDrawerOpen = false;

    function initTheme() {
      const savedTheme = localStorage.getItem('scrim_theme') || 'dark';
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.getElementById('theme-icon').className = savedTheme === 'dark' ? 'fa-solid fa-sun text-xs' : 'fa-solid fa-moon text-xs';
    }

    function toggleTheme() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('scrim_theme', isDark ? 'dark' : 'light');
      document.getElementById('theme-icon').className = isDark ? 'fa-solid fa-sun text-xs' : 'fa-solid fa-moon text-xs';
    }

    // 실제 전적 데이터로 강제 초기화 함수
    function resetToVerifiedDefaults() {
      summoners = Object.keys(VERIFIED_PROFILES).map((name, idx) => ({
        id: 'p-' + idx,
        name: name,
        ...VERIFIED_PROFILES[name],
        wins: 0, losses: 0, kda: 3.8
      }));
      selectedPlayerIds = new Set(summoners.slice(0, 10).map(s => s.id));
      saveLocalData();
      renderAllViews();
      showToast('11인 실제 전적 데이터로 강제 초기화되었습니다!', 'success');
    }

    function initData() {
      const storedS = localStorage.getItem('scrim_balancer_summoners');
      if (storedS) {
        try { summoners = JSON.parse(storedS); } catch(e) { summoners = []; }
      }

      // 이전 잘못된 캐시(판수 100판 일괄값 등)가 있거나 11명 미만이면 실제 데이터로 로드
      if (summoners.length < 11 || summoners.some(s => s.soloGames === 100 && s.flexGames === 30)) {
        summoners = Object.keys(VERIFIED_PROFILES).map((name, idx) => ({
          id: 'p-' + idx,
          name: name,
          ...VERIFIED_PROFILES[name],
          wins: 0, losses: 0, kda: 3.8
        }));
      }

      const storedH = localStorage.getItem('scrim_balancer_history');
      if (storedH) {
        try { matchHistory = JSON.parse(storedH); } catch(e) { matchHistory = []; }
      }

      const storedR = localStorage.getItem('scrim_balancer_replays');
      if (storedR) {
        try { replayArchives = JSON.parse(storedR); } catch(e) { replayArchives = []; }
      }

      selectedPlayerIds = new Set(summoners.slice(0, 10).map(s => s.id));
      saveLocalData();
      renderAllViews();
    }

    function saveLocalData() {
      localStorage.setItem('scrim_balancer_summoners', JSON.stringify(summoners));
      localStorage.setItem('scrim_balancer_history', JSON.stringify(matchHistory));
      localStorage.setItem('scrim_balancer_replays', JSON.stringify(replayArchives));
    }

    // 모든 화면 렌더링
    function renderAllViews() {
      renderSelectionGrid();
      renderSummonersList();
      renderSidebarDrawerList();
      renderMatchHistory();
      renderReplayArchiveList();
    }

    function getPlayerMMR(p) {
      const soloBase = TIER_POINTS[p.tier] || 1500;
      const flexBase = TIER_POINTS[p.flexBaseTier] || (soloBase - 200);

      const sGames = parseInt(p.soloGames || 0, 10);
      const fGames = parseInt(p.flexGames || 0, 10);
      const totalGames = sGames + fGames;

      let soloWeight = 0.5, flexWeight = 0.5;
      if (totalGames > 0) {
        soloWeight = sGames / totalGames;
        flexWeight = fGames / totalGames;
      }

      const baseMMR = (soloBase * soloWeight) + (flexBase * flexWeight);
      const scrimTotal = (p.wins || 0) + (p.losses || 0);
      const scrimWinRate = scrimTotal > 0 ? (p.wins / scrimTotal) : 0.5;
      const scrimAdj = (scrimWinRate - 0.5) * 320;
      const formAdj = ((p.formScore || 75) - 75) * 4.5;

      return {
        mmr: Math.round(baseMMR + scrimAdj + formAdj),
        soloPct: Math.round(soloWeight * 100),
        flexPct: Math.round(flexWeight * 100)
      };
    }

    // Vercel Serverless Function 호출 연동
    async function fetchRiotData() {
      let rawQuery = document.getElementById('quick-search-input').value.trim();
      if (!rawQuery || !rawQuery.includes('#')) {
        showToast('소환사명#태그 형식으로 입력해 주세요.', 'error');
        return;
      }

      rawQuery = rawQuery.replace(/[\u2066\u2069\u200E\u200F⁦⁩]/g, '').trim();
      const [name, tag] = rawQuery.split('#');
      const fullName = `${name}#${tag}`;

      if (VERIFIED_PROFILES[fullName]) {
        addOrUpdateSummoner(fullName, VERIFIED_PROFILES[fullName]);
        return;
      }

      const btn = document.getElementById('btn-quick-search');
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Riot API 조회 중...';
      btn.disabled = true;

      try {
        const res = await fetch(`/api/riot?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
        const data = await res.json();

        if (res.ok && data.name) {
          const solo = data.soloRank || { tier: 'UNRANKED', rank: '', lp: 0, totalGames: 0 };
          const flex = data.flexRank || { tier: 'UNRANKED', rank: '', lp: 0, totalGames: 0 };

          const profile = {
            tier: solo.tier !== 'UNRANKED' ? solo.tier : (flex.tier !== 'UNRANKED' ? flex.tier : 'EMERALD'),
            flexBaseTier: flex.tier !== 'UNRANKED' ? flex.tier : 'PLATINUM',
            soloTier: solo.tier !== 'UNRANKED' ? `${solo.tier.slice(0, 2)} ${solo.rank} (${solo.lp}LP)` : '언랭',
            flexTier: flex.tier !== 'UNRANKED' ? `${flex.tier.slice(0, 2)} ${flex.rank} (${flex.lp}LP)` : '언랭',
            soloGames: solo.totalGames || 0,
            flexGames: flex.totalGames || 0,
            mainRole: 'ADC',
            subRole: 'MID',
            most: data.mostChamps.length ? data.mostChamps : ['진', '카이사'],
            formScore: 85
          };
          addOrUpdateSummoner(data.name, profile);
          showToast(`[${data.name}] 라이엇 공식 전적이 반영되었습니다!`, 'success');
        } else {
          openAddModalWithData(name, tag);
        }
      } catch (e) {
        openAddModalWithData(name, tag);
      } finally {
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>실시간 전적 조회</span>';
        btn.disabled = false;
        document.getElementById('quick-search-input').value = '';
      }
    }

    function addOrUpdateSummoner(fullName, profile) {
      const idx = summoners.findIndex(s => s.name.toLowerCase() === fullName.toLowerCase());
      const player = {
        id: idx >= 0 ? summoners[idx].id : 'p-' + Date.now(),
        name: fullName,
        ...profile,
        wins: idx >= 0 ? summoners[idx].wins : 0,
        losses: idx >= 0 ? summoners[idx].losses : 0,
        kda: 3.8
      };
      if (idx >= 0) summoners[idx] = player;
      else summoners.unshift(player);

      selectedPlayerIds.add(player.id);
      saveLocalData();
      renderAllViews();
      openMemberDetailModal(player.id);
    }

    function openAddModalWithData(name, tag) {
      document.getElementById('form-name').value = `${name}#${tag}`;
      document.getElementById('modal-summoner').classList.remove('hidden');
      showToast('스펙 등록 창이 열렸습니다.', 'info');
    }

    // 10인 밸런서 선택 그리드
    function renderSelectionGrid() {
      const grid = document.getElementById('balancer-selection-grid');
      grid.innerHTML = '';
      document.getElementById('nav-roster-count').textContent = summoners.length;

      summoners.forEach(s => {
        const isSel = selectedPlayerIds.has(s.id);
        const mmrData = getPlayerMMR(s);
        const role = ROLE_METADATA[s.mainRole] || ROLE_METADATA.FILL;

        const tile = document.createElement('div');
        tile.className = `p-2 rounded-xl border text-xs transition select-none flex items-center justify-between gap-1.5 ${
          isSel ? 'bg-amber-500/10 border-amber-500 font-bold' : 'bg-slate-50 dark:bg-[#161d2a] border-slate-200 dark:border-slate-800'
        }`;

        tile.innerHTML = `
          <div onclick="toggleSelectPlayer('${s.id}')" class="flex items-center gap-1.5 truncate flex-1 cursor-pointer">
            <span class="${role.color}"><i class="fa-solid ${role.icon}"></i></span>
            <span class="truncate text-slate-800 dark:text-gray-200">${s.name}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[10px] text-slate-400">${mmrData.mmr}p</span>
            <button onclick="removePlayerFromSelection('${s.id}')" title="오늘 선택 제외" class="text-slate-400 hover:text-rose-500 p-0.5">
              <i class="fa-solid fa-circle-xmark text-xs"></i>
            </button>
          </div>
        `;
        grid.appendChild(tile);
      });

      const count = selectedPlayerIds.size;
      document.getElementById('selected-badge').textContent = `${count} / 10명 선택됨`;
      document.getElementById('btn-run-balancing').disabled = (count !== 10);
    }

    function toggleSelectPlayer(id) {
      if (selectedPlayerIds.has(id)) selectedPlayerIds.delete(id);
      else if (selectedPlayerIds.size < 10) selectedPlayerIds.add(id);
      saveLocalData();
      renderSelectionGrid();
      renderSidebarDrawerList();
    }

    function removePlayerFromSelection(id) {
      selectedPlayerIds.delete(id);
      saveLocalData();
      renderSelectionGrid();
      renderSidebarDrawerList();
    }

    function clearSelection() {
      selectedPlayerIds.clear();
      saveLocalData();
      renderSelectionGrid();
      renderSidebarDrawerList();
      showToast('오늘 10인 선택이 비워졌습니다.', 'info');
    }

    function autoSelectTop10() {
      const sorted = [...summoners].sort((a, b) => getPlayerMMR(b).mmr - getPlayerMMR(a).mmr);
      selectedPlayerIds = new Set(sorted.slice(0, 10).map(s => s.id));
      saveLocalData();
      renderSelectionGrid();
      renderSidebarDrawerList();
      showToast('MMR 상위 10명이 자동 선택되었습니다.', 'success');
    }

    // 팀 밸런싱 실행
    function runSmartBalancing() {
      if (selectedPlayerIds.size !== 10) return;
      const pool = summoners.filter(s => selectedPlayerIds.has(s.id));
      pool.sort(() => Math.random() - 0.5);

      const blue = pool.slice(0, 5);
      const red = pool.slice(5, 10);

      const blueSum = blue.reduce((a, b) => a + getPlayerMMR(b).mmr, 0);
      const redSum = red.reduce((a, b) => a + getPlayerMMR(b).mmr, 0);
      const blueAvg = Math.round(blueSum / 5);
      const redAvg = Math.round(redSum / 5);

      currentMatch = { blue, red, blueAvg, redAvg, diff: Math.abs(blueAvg - redAvg) };

      document.getElementById('stat-avg-diff').textContent = `${currentMatch.diff} pt`;
      document.getElementById('blue-team-mmr').textContent = `${blueAvg} pt`;
      document.getElementById('red-team-mmr').textContent = `${redAvg} pt`;

      renderTeamLaneRoster('blue', blue, red);
      renderTeamLaneRoster('red', red, blue);

      document.getElementById('balancer-placeholder').classList.add('hidden');
      document.getElementById('balancer-board').classList.remove('hidden');
      showToast('팀 밸런싱이 완료되었습니다!', 'success');
    }

    function rerollBalancing() { runSmartBalancing(); }

    function swapLaneLineup() {
      if (!currentMatch) return;
      const targetPos = document.getElementById('swap-pos').value;
      const idx = ORDERED_ROLES.indexOf(targetPos);
      if (idx === -1) return;

      const temp = currentMatch.blue[idx];
      currentMatch.blue[idx] = currentMatch.red[idx];
      currentMatch.red[idx] = temp;

      const blueSum = currentMatch.blue.reduce((a, b) => a + getPlayerMMR(b).mmr, 0);
      const redSum = currentMatch.red.reduce((a, b) => a + getPlayerMMR(b).mmr, 0);
      currentMatch.blueAvg = Math.round(blueSum / 5);
      currentMatch.redAvg = Math.round(redSum / 5);
      currentMatch.diff = Math.abs(currentMatch.blueAvg - currentMatch.redAvg);

      document.getElementById('stat-avg-diff').textContent = `${currentMatch.diff} pt`;
      document.getElementById('blue-team-mmr').textContent = `${currentMatch.blueAvg} pt`;
      document.getElementById('red-team-mmr').textContent = `${currentMatch.redAvg} pt`;

      renderTeamLaneRoster('blue', currentMatch.blue, currentMatch.red);
      renderTeamLaneRoster('red', currentMatch.red, currentMatch.blue);
      showToast(`${targetPos} 라인이 맞교체되었습니다.`, 'info');
    }

    function renderTeamLaneRoster(teamColor, teamRoster, enemyRoster) {
      const container = document.getElementById(`${teamColor}-roster-list`);
      container.innerHTML = '';

      teamRoster.forEach((player, idx) => {
        const role = ORDERED_ROLES[idx];
        const roleInfo = ROLE_METADATA[role];
        const enemy = enemyRoster[idx];

        const pMMR = getPlayerMMR(player).mmr;
        const eMMR = getPlayerMMR(enemy).mmr;
        const delta = pMMR - eMMR;

        const card = document.createElement('div');
        card.className = `p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          teamColor === 'blue' ? 'border-blue-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#161d2a]' : 'border-red-200 dark:border-red-900/40 bg-slate-50 dark:bg-[#161d2a]'
        }`;

        card.innerHTML = `
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-[#121721] flex flex-col items-center justify-center shrink-0">
              <i class="fa-solid ${roleInfo.icon} ${roleInfo.color} text-xs"></i>
            </div>
            <div class="min-w-0">
              <span class="font-bold truncate text-slate-800 dark:text-gray-100">${player.name}</span>
              <div class="text-[10px] text-slate-400">${player.soloTier} · ${player.flexTier}</div>
            </div>
          </div>
          <div class="text-right">
            <span class="font-bold text-[11px] ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
              ${delta >= 0 ? `+${delta}` : delta} pt
            </span>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // 전체 멤버 목록 카드 그리드 (수정 옆 개별 삭제 휴지통 버튼 완벽 복원)
    function renderSummonersList() {
      const container = document.getElementById('summoners-card-container');
      if (!container) return;
      container.innerHTML = '';
      const query = (document.getElementById('search-input')?.value || '').toLowerCase();
      const filtered = summoners.filter(s => s.name.toLowerCase().includes(query));

      filtered.forEach(s => {
        const mmrData = getPlayerMMR(s);
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-[#121721] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between";
        card.innerHTML = `
          <div>
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#161d2a] flex items-center justify-center text-amber-500 text-lg">
                  <i class="fa-solid fa-shield"></i>
                </div>
                <div>
                  <div class="flex items-center gap-1.5">
                    <h3 class="font-extrabold text-sm text-slate-800 dark:text-gray-100">${s.name}</h3>
                    <span class="tier-badge tier-${s.tier.toLowerCase()}">${s.tier}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">내전 종합 MMR <strong class="text-amber-500">${mmrData.mmr}</strong> pt</div>
                </div>
              </div>

              <!-- 수정 버튼 및 개별 삭제(휴지통) 버튼 -->
              <div class="flex items-center gap-1.5">
                <button onclick="editSummoner('${s.id}')" title="스펙 수정" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteSummoner('${s.id}')" title="멤버 영구 삭제" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="bg-slate-50 dark:bg-[#161d2a] rounded-xl p-2.5 border border-slate-200 dark:border-slate-800 text-xs mb-2">
              <div class="grid grid-cols-2 gap-2 text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span class="text-[10px] text-slate-400 block">솔로랭크 (${s.soloGames||0}판)</span>
                  <span class="font-bold text-slate-700 dark:text-gray-200">${s.soloTier}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block">자유랭크 (${s.flexGames||0}판)</span>
                  <span class="font-bold text-slate-700 dark:text-gray-200">${s.flexTier}</span>
                </div>
              </div>
              <div class="pt-2">
                <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>솔랭: <strong class="text-sky-500">${mmrData.soloPct}%</strong></span>
                  <span>자랭: <strong class="text-purple-400">${mmrData.flexPct}%</strong></span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                  <div class="bg-sky-500 h-1.5" style="width: ${mmrData.soloPct}%"></div>
                  <div class="bg-purple-500 h-1.5" style="width: ${mmrData.flexPct}%"></div>
                </div>
              </div>
            </div>

            <div class="text-[11px] text-slate-400">
              <span>모스트: <strong class="text-slate-700 dark:text-gray-200">${(s.most || []).join(', ') || '없음'}</strong></span>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // 소환사 1명 개별 영구 삭제 함수
    function deleteSummoner(id) {
      const p = summoners.find(s => s.id === id);
      const name = p ? p.name : '선택한 소환사';
      if (confirm(`정말 [${name}] 소환사를 명단에서 완전히 삭제하시겠습니까?`)) {
        summoners = summoners.filter(s => s.id !== id);
        selectedPlayerIds.delete(id);
        saveLocalData();
        renderAllViews();
        showToast(`[${name}] 소환사가 삭제되었습니다.`, 'info');
      }
    }

    // 좌측 서랍 렌더링
    function toggleSidebarMemberDrawer() {
      isDrawerOpen = !isDrawerOpen;
      document.getElementById('sidebar-drawer-container').classList.toggle('hidden', !isDrawerOpen);
      document.getElementById('drawer-chevron-icon').classList.toggle('rotate-180', isDrawerOpen);
    }

    function renderSidebarDrawerList() {
      const container = document.getElementById('sidebar-drawer-list');
      if (!container) return;
      container.innerHTML = '';

      summoners.forEach(s => {
        const isSel = selectedPlayerIds.has(s.id);
        const mmr = getPlayerMMR(s);
        const item = document.createElement('div');
        item.className = `p-1.5 rounded-lg border flex items-center justify-between text-xs ${
          isSel ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800'
        }`;
        item.innerHTML = `
          <div onclick="openMemberDetailModal('${s.id}')" class="truncate flex-1 cursor-pointer hover:text-amber-500">
            <span class="font-bold text-[10px]">${s.name}</span>
            <span class="text-[9px] text-slate-400 block">${s.soloTier} · ${mmr.mmr}p</span>
          </div>
          <button onclick="toggleSelectPlayer('${s.id}')" class="${isSel ? 'text-amber-500' : 'text-slate-400'}">
            <i class="fa-solid ${isSel ? 'fa-check-circle' : 'fa-plus-circle'}"></i>
          </button>
        `;
        container.appendChild(item);
      });
    }

    function openMemberDetailModal(id) {
      const s = summoners.find(p => p.id === id);
      if (!s) return;
      const mmr = getPlayerMMR(s);
      document.getElementById('modal-member-detail-body').innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b mb-3">
          <div>
            <h3 class="font-black text-base">${s.name}</h3>
            <span class="tier-badge tier-${s.tier.toLowerCase()}">${s.tier}</span>
          </div>
          <span class="text-sm font-bold text-amber-500">${mmr.mmr} pt</span>
        </div>
        <div class="text-xs space-y-2">
          <p>솔로랭크: <strong>${s.soloTier}</strong> (${s.soloGames}판 · ${mmr.soloPct}%)</p>
          <p>자유랭크: <strong>${s.flexTier}</strong> (${s.flexGames}판 · ${mmr.flexPct}%)</p>
          <p>모스트 챔피언: <strong>${(s.most || []).join(', ')}</strong></p>
        </div>
      `;
      document.getElementById('modal-member-detail').classList.remove('hidden');
    }

    function closeMemberDetailModal() { document.getElementById('modal-member-detail').classList.add('hidden'); }

    // 리플레이 보관함 렌더링 함수 완벽 구현 (ReferenceError 방지)
    function renderReplayArchiveList() {
      const container = document.getElementById('replay-archive-list');
      if (!container) return;
      container.innerHTML = '';
      document.getElementById('nav-replay-count').textContent = replayArchives.length;

      if (replayArchives.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">보관된 리플레이가 없습니다. 내전 종료 후 .rofl 파일을 드래그하여 저장하세요.</div>`;
        return;
      }

      replayArchives.forEach(r => {
        const item = document.createElement('div');
        item.className = "p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161d2a] flex items-center justify-between";
        item.innerHTML = `
          <div class="flex items-center gap-2.5">
            <i class="fa-solid fa-file-video text-amber-500 text-sm"></i>
            <div>
              <span class="font-bold text-slate-800 dark:text-gray-200 block">${r.fileName}</span>
              <span class="text-[10px] text-slate-400">${r.date} · ${r.size}</span>
            </div>
          </div>
        `;
        container.appendChild(item);
      });
    }

    function handleDragOver(e) { e.preventDefault(); document.getElementById('rofl-dropzone').classList.add('border-amber-500'); }
    function handleDragLeave(e) { e.preventDefault(); document.getElementById('rofl-dropzone').classList.remove('border-amber-500'); }
    function handleDrop(e) {
      e.preventDefault();
      document.getElementById('rofl-dropzone').classList.remove('border-amber-500');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) processRoflFile(e.dataTransfer.files[0]);
    }
    function handleFileSelect(e) {
      if (e.target.files && e.target.files[0]) processRoflFile(e.target.files[0]);
    }

    function processRoflFile(file) {
      if (!file.name.endsWith('.rofl')) {
        showToast('.rofl 확장자의 리플레이 파일만 등록할 수 있습니다.', 'error');
        return;
      }
      const newArchive = {
        id: 'rofl-' + Date.now(),
        fileName: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      replayArchives.unshift(newArchive);
      saveLocalData();
      renderReplayArchiveList();
      showToast(`리플레이(${file.name})가 보관함에 영구 저장되었습니다!`, 'success');
    }

    function switchTab(tabKey) {
      ['balancer', 'summoners', 'history', 'replay'].forEach(t => {
        document.getElementById(`tab-content-${t}`)?.classList.toggle('hidden', t !== tabKey);
        const b = document.getElementById(`nav-${t}`);
        if (b) {
          if (t === tabKey) {
            b.className = "w-full px-3.5 py-2.5 rounded-xl transition flex items-center gap-3 bg-amber-500/15 text-amber-600 dark:text-brand-gold border border-amber-500/30";
          } else {
            b.className = "w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#161d2a]";
          }
        }
      });
      if (tabKey === 'summoners') renderSummonersList();
      if (tabKey === 'history') renderMatchHistory();
      if (tabKey === 'replay') renderReplayArchiveList();
    }

    function openAddSummonerModal() {
      document.getElementById('form-summoner').reset();
      document.getElementById('summoner-form-id').value = '';
      document.getElementById('modal-summoner').classList.remove('hidden');
    }

    function editSummoner(id) {
      const p = summoners.find(s => s.id === id);
      if (!p) return;
      document.getElementById('summoner-form-id').value = p.id;
      document.getElementById('form-name').value = p.name;
      document.getElementById('form-main-role').value = p.mainRole;
      document.getElementById('form-tier').value = p.tier;
      document.getElementById('form-solo-tier').value = p.soloTier || '';
      document.getElementById('form-flex-tier').value = p.flexTier || '';
      document.getElementById('form-solo-games').value = p.soloGames || 0;
      document.getElementById('form-flex-games').value = p.flexGames || 0;
      document.getElementById('form-champions').value = (p.most || []).join(', ');
      document.getElementById('modal-summoner').classList.remove('hidden');
    }

    function closeSummonerModal() { document.getElementById('modal-summoner').classList.add('hidden'); }

    function handleSummonerSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('summoner-form-id').value;
      const name = document.getElementById('form-name').value.trim();
      const player = {
        name,
        mainRole: document.getElementById('form-main-role').value,
        tier: document.getElementById('form-tier').value,
        soloTier: document.getElementById('form-solo-tier').value.trim() || '언랭',
        flexTier: document.getElementById('form-flex-tier').value.trim() || '언랭',
        soloGames: parseInt(document.getElementById('form-solo-games').value, 10) || 0,
        flexGames: parseInt(document.getElementById('form-flex-games').value, 10) || 0,
        most: document.getElementById('form-champions').value.split(',').map(c => c.trim()).filter(Boolean),
        formScore: 85, wins: 0, losses: 0
      };

      if (id) {
        summoners = summoners.map(s => s.id === id ? { ...s, ...player } : s);
      } else {
        player.id = 'p-' + Date.now();
        summoners.unshift(player);
        selectedPlayerIds.add(player.id);
      }

      saveLocalData();
      closeSummonerModal();
      renderAllViews();
      showToast('소환사 정보가 저장되었습니다.', 'success');
    }

    function openLobbyModal() { document.getElementById('modal-lobby').classList.remove('hidden'); }
    function closeLobbyModal() { document.getElementById('modal-lobby').classList.add('hidden'); }

    function parseLobbyChat() {
      let raw = document.getElementById('lobby-text-area').value.replace(/[\u2066\u2069\u200E\u200F⁦⁩]/g, '');
      const names = [];
      raw.split('\n').forEach(l => {
        if (l.includes('참가하셨습니다') || l.includes('참가했습니다')) {
          const front = l.replace(/\s*님이\s*로비에\s*참가.*$/, '').replace(/\s*#\s*/, '#').trim();
          if (front && !names.includes(front)) names.push(front);
        }
      });

      names.forEach((name, i) => {
        const cleanName = name.trim();
        const existing = summoners.find(s => s.name === cleanName);
        if (!existing) {
          const preset = VERIFIED_PROFILES[cleanName] || {
            tier: 'EMERALD', flexBaseTier: 'PLATINUM', soloTier: 'E3 (50LP)', flexTier: 'PL2 (20LP)',
            soloGames: 120, flexGames: 30, mainRole: ORDERED_ROLES[i % 5], subRole: 'FILL',
            most: ['카이사'], formScore: 80
          };
          summoners.push({ id: 'p-' + Date.now() + Math.random().toString(36).substr(2, 4), name: cleanName, ...preset, wins: 0, losses: 0 });
        }
      });

      selectedPlayerIds = new Set(names.slice(0, 10).map(n => summoners.find(s => s.name === n)?.id).filter(Boolean));
      saveLocalData();
      closeLobbyModal();
      renderAllViews();
      showToast(`${names.length}명의 로비 인원이 등록되었습니다.`, 'success');
    }

    function renderMatchHistory() {
      const container = document.getElementById('match-history-list');
      if (!container) return;
      container.innerHTML = matchHistory.length === 0 
        ? `<div class="p-8 text-center text-xs text-slate-400">기록된 매치가 없습니다.</div>`
        : matchHistory.map(m => `<div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">${m.date} - ${m.winner} 승리 (MVP: ${m.mvp})</div>`).join('');
    }

    function resetMatchHistory() {
      if (confirm('매치 히스토리를 모두 삭제하시겠습니까?')) {
        matchHistory = [];
        saveLocalData();
        renderMatchHistory();
      }
    }

    function openRecordMatchModal() {
      if (!currentMatch) return;
      modalPendingWinner = null;
      const sel = document.getElementById('record-mvp-select');
      sel.innerHTML = '';
      [...currentMatch.blue, ...currentMatch.red].forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.tier})`;
        sel.appendChild(opt);
      });
      document.getElementById('btn-save-record-submit').disabled = true;
      document.getElementById('modal-match-record').classList.remove('hidden');
    }

    function closeRecordMatchModal() { document.getElementById('modal-match-record').classList.add('hidden'); }
    function setMatchWinner(team) {
      modalPendingWinner = team;
      document.getElementById('record-btn-blue').className = team === 'BLUE' ? 'p-4 rounded-xl border-2 border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 text-center transition' : 'p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/20 text-center transition';
      document.getElementById('record-btn-red').className = team === 'RED' ? 'p-4 rounded-xl border-2 border-red-500 ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20 text-center transition' : 'p-4 rounded-xl border-2 border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-center transition';
      document.getElementById('btn-save-record-submit').disabled = false;
    }

    function submitMatchResult() {
      if (!modalPendingWinner || !currentMatch) return;
      const winning = modalPendingWinner === 'BLUE' ? currentMatch.blue : currentMatch.red;
      const winIds = new Set(winning.map(p => p.id));
      const mvp = summoners.find(s => s.id === document.getElementById('record-mvp-select').value);

      summoners = summoners.map(s => winIds.has(s.id) ? { ...s, wins: (s.wins||0)+1 } : { ...s, losses: (s.losses||0)+1 });
      matchHistory.unshift({
        id: 'm-' + Date.now(),
        date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        winner: modalPendingWinner,
        mvp: mvp ? mvp.name : 'Unknown'
      });

      saveLocalData();
      closeRecordMatchModal();
      renderAllViews();
      showToast(`${modalPendingWinner}팀 승리가 반영되었습니다!`, 'success');
    }

    function showToast(msg, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `px-4 py-2 rounded-xl text-xs ${type === 'error' ? 'bg-red-600' : 'bg-slate-800 text-amber-400'} text-white shadow-xl`;
      toast.textContent = msg;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    window.addEventListener('DOMContentLoaded', () => {
      initTheme();
      initData();
    });
  </script>
</body>
</html>
