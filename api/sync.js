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

  // 1. GET: 최신 전체 데이터 조회
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('scrim_data')
        .select('payload, updated_at')
        .eq('id', rowId)
        .single();

      if (error || !data) {
        return res.status(200).json({ summoners: [], scrimSchedules: {}, communityPosts: [], updatedAt: 0 });
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

  // 2. POST: 데이터 저장 (삭제 반영 및 일정 보존)
  if (req.method === 'POST') {
    try {
      const incoming = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const now = Date.now();

      const { data: current } = await supabase
        .from('scrim_data')
        .select('payload')
        .eq('id', rowId)
        .single();

      const existing = current?.payload || {};

      // 게시판 글: 클라이언트에서 삭제된 경우를 존중하여 그대로 반영 (부활 방지)
      const finalPosts = Array.isArray(incoming.communityPosts) 
        ? incoming.communityPosts 
        : (existing.communityPosts || []);

      const mergedPayload = {
        summoners: incoming.summoners && incoming.summoners.length >= (existing.summoners?.length || 0)
          ? incoming.summoners
          : (existing.summoners || incoming.summoners || []),
        matchHistory: incoming.matchHistory || existing.matchHistory || [],
        replayArchives: incoming.replayArchives || existing.replayArchives || [],
        scrimSchedules: incoming.scrimSchedules || existing.scrimSchedules || {},
        communityPosts: finalPosts,
        selectedPlayerIds: incoming.selectedPlayerIds || existing.selectedPlayerIds || [],
        currentMatch: incoming.currentMatch !== undefined ? incoming.currentMatch : existing.currentMatch,
        updatedAt: now
      };

      const { error } = await supabase
        .from('scrim_data')
        .upsert({
          id: rowId,
          payload: mergedPayload,
          updated_at: now
        });

      if (error) throw error;
      return res.status(200).json({ success: true, timestamp: now, data: mergedPayload });

    } catch (err) {
      console.error('Sync POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
