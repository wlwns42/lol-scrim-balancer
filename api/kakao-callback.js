import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { code, error: oauthError, error_description: oauthDesc } = req.query;

  if (oauthError) {
    const detail = oauthDesc ? `${oauthError}: ${oauthDesc}` : String(oauthError);
    return res.redirect('/?kakao_error=' + encodeURIComponent(detail));
  }

  if (!code) {
    return res.redirect('/?kakao_error=' + encodeURIComponent('no_code (query: ' + JSON.stringify(req.query) + ')'));
  }

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const redirectUri = `${proto}://${host}/api/kakao-callback`;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_REST_API_KEY,
      redirect_uri: redirectUri,
      code: String(code)
    });
    if (process.env.KAKAO_CLIENT_SECRET) {
      tokenParams.append('client_secret', process.env.KAKAO_CLIENT_SECRET);
    }

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: tokenParams.toString()
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || '카카오 토큰 발급 실패');
    }

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    if (!userRes.ok || !userData.id) {
      throw new Error('카카오 프로필 조회 실패');
    }

    const kakaoId = String(userData.id);
    const kakaoNick = userData.kakao_account?.profile?.nickname || userData.properties?.nickname || '카카오유저';

    const rowId = 'main_scrim_data_row';
    const { data: current } = await supabase
      .from('scrim_data')
      .select('payload')
      .eq('id', rowId)
      .single();

    const payload = current?.payload || {};
    const bindings = payload.kakaoBindings || {};
    const summoners = Array.isArray(payload.summoners) ? payload.summoners : [];

    let matchedPlayerId = bindings[kakaoId]?.playerId || '';
    let matchedPlayerName = bindings[kakaoId]?.playerName || '';

    if (!matchedPlayerId) {
      const cleanNick = kakaoNick.replace(/\s+/g, '');
      const autoFound = summoners.find(s => {
        const desc = (s.description || '').replace(/\s+/g, '');
        const sName = (s.name || '').split('#')[0].replace(/\s+/g, '');
        return (desc && desc === cleanNick) || (sName && sName === cleanNick);
      });
      if (autoFound) {
        matchedPlayerId = autoFound.id;
        matchedPlayerName = autoFound.name;
        bindings[kakaoId] = {
          playerId: autoFound.id,
          playerName: autoFound.name,
          kakaoNick,
          updatedAt: Date.now()
        };
        payload.kakaoBindings = bindings;
        await supabase.from('scrim_data').upsert({
          id: rowId,
          payload,
          updated_at: Date.now()
        });
      }
    }

    const qs = new URLSearchParams({
      kakao_id: kakaoId,
      kakao_nick: kakaoNick,
      bound_id: matchedPlayerId,
      bound_name: matchedPlayerName
    });

    return res.redirect(`/?${qs.toString()}`);
  } catch (err) {
    console.error('Kakao OAuth error:', err);
    return res.redirect('/?kakao_error=' + encodeURIComponent(err.message));
  }
}
