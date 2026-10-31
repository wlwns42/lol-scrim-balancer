import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🌟 어제 치른 딥롤 실측 사설 내전 2경기 원본 (DB가 비었을 때 최초 자동 복구용)
const INITIAL_RESTORE_MATCHES = [
  {
    "id": "m-LCU-8439085779",
    "date": "2026-10-31 00:28",
    "dateKey": "2026-10-30",
    "matchId": "LCU_8439085779",
    "winner": "BLUE",
    "mvp": "다이애나 애호가#8888",
    "duration": "27분 02초",
    "blue": [
      { "name": "다이애나 애호가#8888", "tier": "UNRANKED", "role": "TOP", "champion": "모데카이저", "aiScore": 86, "kda": "13/2/7 (10.0)", "damage": "34,861", "cs": 196, "win": true },
      { "name": "김창숙 부띠끄 부산 영도점#0615", "tier": "UNRANKED", "role": "JUG", "champion": "자르반 4세", "aiScore": 60, "kda": "3/2/13 (8.0)", "damage": "8,852", "cs": 167, "win": true },
      { "name": "화상이#KR10", "tier": "UNRANKED", "role": "MID", "champion": "애니비아", "aiScore": 55, "kda": "5/4/6 (2.75)", "damage": "13,547", "cs": 198, "win": true },
      { "name": "임다물면 승리#KR1", "tier": "UNRANKED", "role": "ADC", "champion": "카이사", "aiScore": 68, "kda": "10/2/6 (8.0)", "damage": "20,219", "cs": 258, "win": true },
      { "name": "一念通天#1230", "tier": "UNRANKED", "role": "SUP", "champion": "노틸러스", "aiScore": 56, "kda": "1/5/15 (3.2)", "damage": "7,046", "cs": 22, "win": true }
    ],
    "red": [
      { "name": "한끼두끼X끼#밥먹자", "tier": "UNRANKED", "role": "TOP", "champion": "탐 켄치", "aiScore": 34, "kda": "0/6/3 (0.5)", "damage": "9,266", "cs": 136, "win": false },
      { "name": "펙탄 영수장#1114", "tier": "UNRANKED", "role": "MID", "champion": "제드", "aiScore": 33, "kda": "2/9/7 (1.0)", "damage": "16,070", "cs": 127, "win": false },
      { "name": "후니곰캐리#3075", "tier": "UNRANKED", "role": "JUG", "champion": "오리아나", "aiScore": 42, "kda": "4/7/4 (1.14)", "damage": "17,550", "cs": 179, "win": false },
      { "name": "KiiiKiiiLS#404", "tier": "UNRANKED", "role": "ADC", "champion": "징크스", "aiScore": 51, "kda": "9/5/3 (2.4)", "damage": "22,756", "cs": 242, "win": false },
      { "name": "UDT 62기#UDT", "tier": "UNRANKED", "role": "SUP", "champion": "브라움", "aiScore": 44, "kda": "0/5/10 (2.0)", "damage": "3,643", "cs": 31, "win": false }
    ]
  },
  {
    "id": "m-LCU-8438884614",
    "date": "2026-10-30 23:05",
    "dateKey": "2026-10-30",
    "matchId": "LCU_8438884614",
    "winner": "BLUE",
    "mvp": "임다물면 승리#KR1",
    "duration": "33분 24초",
    "blue": [
      { "name": "다이애나 애호가#8888", "tier": "UNRANKED", "role": "TOP", "champion": "트런들", "aiScore": 50, "kda": "7/8/10 (2.12)", "damage": "22,973", "cs": 196, "win": true },
      { "name": "김창숙 부띠끄 부산 영도점#0615", "tier": "UNRANKED", "role": "JUG", "champion": "리 신", "aiScore": 81, "kda": "14/3/11 (8.33)", "damage": "34,168", "cs": 222, "win": true },
      { "name": "화상이#KR10", "tier": "UNRANKED", "role": "MID", "champion": "리산드라", "aiScore": 55, "kda": "2/3/10 (4.0)", "damage": "22,563", "cs": 178, "win": true },
      { "name": "임다물면 승리#KR1", "tier": "UNRANKED", "role": "ADC", "champion": "진", "aiScore": 84, "kda": "13/2/9 (11.0)", "damage": "45,086", "cs": 311, "win": true },
      { "name": "一念通天#1230", "tier": "UNRANKED", "role": "SUP", "champion": "자이라", "aiScore": 40, "kda": "3/7/17 (2.86)", "damage": "20,753", "cs": 47, "win": true }
    ],
    "red": [
      { "name": "한끼두끼X끼#밥먹자", "tier": "UNRANKED", "role": "TOP", "champion": "크산테", "aiScore": 50, "kda": "6/7/4 (1.43)", "damage": "27,364", "cs": 200, "win": false },
      { "name": "펙탄 영수장#1114", "tier": "UNRANKED", "role": "MID", "champion": "제이스", "aiScore": 24, "kda": "6/12/6 (1.0)", "damage": "25,292", "cs": 200, "win": false },
      { "name": "후니곰캐리#3075", "tier": "UNRANKED", "role": "JUG", "champion": "사일러스", "aiScore": 56, "kda": "4/5/9 (2.6)", "damage": "31,616", "cs": 249, "win": false },
      { "name": "KiiiKiiiLS#404", "tier": "UNRANKED", "role": "ADC", "champion": "케이틀린", "aiScore": 40, "kda": "2/6/5 (1.17)", "damage": "12,598", "cs": 296, "win": false },
      { "name": "UDT 62기#UDT", "tier": "UNRANKED", "role": "SUP", "champion": "모르가나", "aiScore": 41, "kda": "4/9/8 (1.33)", "damage": "16,788", "cs": 50, "win": false }
    ]
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rowId = 'main_scrim_data_row';

  // 1. GET: Supabase DB의 최신 전체 원본 데이터 반환
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('scrim_data')
        .select('payload, updated_at')
        .eq('id', rowId)
        .single();

      if (error || !data || !data.payload) {
        return res.status(200).json({
          summoners: [],
          matchHistory: INITIAL_RESTORE_MATCHES,
          replayArchives: [],
          scrimSchedules: {},
          communityPosts: [],
          selectedPlayerIds: [],
          currentMatch: null,
          updatedAt: Date.now()
        });
      }

      const p = data.payload || {};
      // DB의 matchHistory가 비어있으면 복구 경기 제공
      const history = (Array.isArray(p.matchHistory) && p.matchHistory.length > 0)
        ? p.matchHistory
        : INITIAL_RESTORE_MATCHES;

      return res.status(200).json({
        ...p,
        matchHistory: history,
        updatedAt: data.updated_at || Date.now()
      });
    } catch (err) {
      console.error('Sync GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. POST: 클라이언트에서 수정된 전체 상태를 안전하게 Supabase에 저장
  if (req.method === 'POST') {
    try {
      const incoming = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const now = Date.now();

      // 기존 DB 읽기
      const { data: current } = await supabase
        .from('scrim_data')
        .select('payload')
        .eq('id', rowId)
        .single();

      const existing = current?.payload || {};

      // 🌟 [핵심 DB 방어막]
      // 사용자가 관리자 로그인 후 [히스토리 전체 삭제]를 명시적으로 누른 경우(incoming.allowEmptyHistory === true)를 제외하고는,
      // 실수나 로딩 미완료로 matchHistory가 []로 전송되더라도 기존 DB의 경기 기록을 절대 날리지 않습니다!
      let resolvedHistory = existing.matchHistory || [];
      if (incoming.allowEmptyHistory === true) {
        resolvedHistory = [];
      } else if (Array.isArray(incoming.matchHistory) && incoming.matchHistory.length > 0) {
        resolvedHistory = incoming.matchHistory;
      } else if (resolvedHistory.length === 0) {
        resolvedHistory = INITIAL_RESTORE_MATCHES;
      }

      // 게시글도 동일하게 보호 (기존 글이 있으면 빈 배열 덮어쓰기 방지)
      let resolvedPosts = existing.communityPosts || [];
      if (incoming.allowEmptyPosts === true) {
        resolvedPosts = [];
      } else if (Array.isArray(incoming.communityPosts) && incoming.communityPosts.length > 0) {
        resolvedPosts = incoming.communityPosts;
      }

      const payload = {
        summoners: (Array.isArray(incoming.summoners) && incoming.summoners.length > 0) ? incoming.summoners : (existing.summoners || []),
        matchHistory: resolvedHistory,
        replayArchives: Array.isArray(incoming.replayArchives) ? incoming.replayArchives : (existing.replayArchives || []),
        scrimSchedules: (incoming.scrimSchedules && typeof incoming.scrimSchedules === 'object') ? incoming.scrimSchedules : (existing.scrimSchedules || {}),
        communityPosts: resolvedPosts,
        selectedPlayerIds: Array.isArray(incoming.selectedPlayerIds) ? incoming.selectedPlayerIds : (existing.selectedPlayerIds || []),
        currentMatch: incoming.currentMatch !== undefined ? incoming.currentMatch : existing.currentMatch,
        updatedAt: now
      };

      const { error } = await supabase
        .from('scrim_data')
        .upsert({
          id: rowId,
          payload: payload,
          updated_at: now
        });

      if (error) throw error;
      return res.status(200).json({ success: true, timestamp: now, data: payload });

    } catch (err) {
      console.error('Sync POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
