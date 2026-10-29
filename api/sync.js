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

  // 1. 데이터 저장 (POST) - 다른 사람이 누른 참여/글이 날아가지 않도록 병합(Merge)
  if (req.method === 'POST') {
    try {
      const incoming = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const now = Date.now();

      // 기존 Supabase에 저장되어 있는 최신 DB 읽기
      const { data: current } = await supabase
        .from('scrim_data')
        .select('payload')
        .eq('id', rowId)
        .single();

      const existingPayload = current?.payload || {};

      // 양쪽의 데이터 중 더 많은/최신 데이터를 안전하게 합침
      const mergedPayload = {
        summoners: incoming.summoners && incoming.summoners.length >= (existingPayload.summoners?.length || 0)
          ? incoming.summoners
          : (existingPayload.summoners || incoming.summoners || []),
        
        matchHistory: incoming.matchHistory || existingPayload.matchHistory || [],
        replayArchives: incoming.replayArchives || existingPayload.replayArchives || [],
        
        // 일정(참여 명단) 병합: 들어온 데이터가 우선하되 비어있지 않게 보호
        scrimSchedules: incoming.scrimSchedules || existingPayload.scrimSchedules || [],
        
        // 게시판 글 병합: ID 기준으로 중복 없이 합침
        communityPosts: mergePosts(existingPayload.communityPosts, incoming.communityPosts),
        
        selectedPlayerIds: incoming.selectedPlayerIds || existingPayload.selectedPlayerIds || [],
        currentMatch: incoming.currentMatch !== undefined ? incoming.currentMatch : existingPayload.currentMatch,
        updatedAt: now
      };

      const { error } = await supabase
        .from('scrim_data')
        .upsert({
          id: rowId,
          payload: mergedPayload,
          updated_at: now
        });

      if (error) {
        console.error('Supabase upsert error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, timestamp: now, data: mergedPayload });
    } catch (err) {
      console.error('Sync POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. 데이터 조회 (GET)
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('scrim_data')
        .select('payload, updated_at')
        .eq('id', rowId)
        .single();

      if (error || !data) {
        return res.status(200).json({ summoners: [], updatedAt: 0 });
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

  return res.status(405).json({ error: 'Method not allowed' });
}

// 게시판 글 ID 중복 제거 및 시간순 병합 헬퍼
function mergePosts(oldPosts = [], newPosts = []) {
  const map = new Map();
  [...oldPosts, ...newPosts].forEach(p => {
    if (p && p.id) map.set(p.id, p);
  });
  return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
