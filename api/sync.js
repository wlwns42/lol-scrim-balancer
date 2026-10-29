import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

      if (error || !data) {
        return res.status(200).json({
          summoners: [],
          matchHistory: [],
          replayArchives: [],
          scrimSchedules: {},
          communityPosts: [],
          selectedPlayerIds: [],
          currentMatch: null,
          updatedAt: 0
        });
      }

      return res.status(200).json({
        ...data.payload,
        updatedAt: data.updated_at
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

      // 🌟 핵심: 하드코딩이나 임의의 합집합 부활 없이, 클라이언트의 의도(추가/수정/삭제)를 정확히 반영
      const payload = {
        summoners: Array.isArray(incoming.summoners) ? incoming.summoners : (existing.summoners || []),
        matchHistory: Array.isArray(incoming.matchHistory) ? incoming.matchHistory : (existing.matchHistory || []),
        replayArchives: Array.isArray(incoming.replayArchives) ? incoming.replayArchives : (existing.replayArchives || []),
        scrimSchedules: (incoming.scrimSchedules && typeof incoming.scrimSchedules === 'object') ? incoming.scrimSchedules : (existing.scrimSchedules || {}),
        communityPosts: Array.isArray(incoming.communityPosts) ? incoming.communityPosts : (existing.communityPosts || []),
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
