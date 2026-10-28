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

  // 1. 데이터 저장 (POST)
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const now = Date.now();
      payload.updatedAt = payload.updatedAt || now;

      const { error } = await supabase
        .from('scrim_data')
        .upsert({
          id: rowId,
          payload: payload,
          updated_at: payload.updatedAt
        });

      if (error) {
        console.error('Supabase upsert error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, timestamp: payload.updatedAt });
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
