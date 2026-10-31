import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('scrim_data')
      .select('payload')
      .eq('id', 'main_scrim_data_row')
      .single();

    if (error || !data || !data.payload) {
      return res.status(200).json({ message: '백업할 데이터가 없습니다.' });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    // 🌟 일별 자동 스냅샷 백업 보관
    await supabase.from('scrim_data').upsert({
      id: `backup_${todayStr}`,
      payload: data.payload,
      updated_at: Date.now()
    });

    return res.status(200).json({ success: true, backupDate: todayStr });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
