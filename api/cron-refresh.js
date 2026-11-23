// api/cron-refresh.js - 매일 새벽 전원 티어·LP·아이콘·모스트·닉변 자동 동기화
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TIER_ORDER = {
  IRON: 1, BRONZE: 2, SILVER: 3, GOLD: 4, PLATINUM: 5,
  EMERALD: 6, DIAMOND: 7, MASTER: 8, GRANDMASTER: 9, CHALLENGER: 10
};

async function getChampionIdToKoMap() {
  try {
    const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = verRes.ok ? await verRes.json() : [];
    const latest = Array.isArray(versions) && versions[0] ? versions[0] : '15.24.1';
    const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/ko_KR/champion.json`);
    if (!champRes.ok) return {};
    const champJson = await champRes.json();
    const map = {};
    Object.values(champJson.data || {}).forEach(c => {
      if (c && c.key && c.name) map[String(c.key)] = c.name;
    });
    return map;
  } catch (e) {
    return {};
  }
}

export default async function handler(req, res) {
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-a6320551-eb63-4c17-ad45-75ce5332f201";
  const rowId = 'main_scrim_data_row';

  try {
    const { data: current, error: readErr } = await supabase
      .from('scrim_data')
      .select('payload, updated_at')
      .eq('id', rowId)
      .single();

    if (readErr || !current || !current.payload) {
      return res.status(200).json({ success: false, message: 'No data found in scrim_data' });
    }

    const payload = current.payload;
    const summoners = Array.isArray(payload.summoners) ? payload.summoners : [];
    if (summoners.length === 0) {
      return res.status(200).json({ success: true, updated: 0 });
    }

    const champMap = await getChampionIdToKoMap();
    let updatedCount = 0;
    let renamedCount = 0;

    const updatedSummoners = [];
    for (const s of summoners) {
      try {
        let accData = null;
        if (s.puuid) {
          const r = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-puuid/${encodeURIComponent(s.puuid)}?api_key=${RIOT_API_KEY}`);
          if (r.ok) accData = await r.json();
        }
        if (!accData && s.name && s.name.includes('#')) {
          const [gName, gTag] = s.name.split('#');
          const r = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gName.trim())}/${encodeURIComponent((gTag || 'KR1').trim())}?api_key=${RIOT_API_KEY}`);
          if (r.ok) accData = await r.json();
        }
        if (!accData || !accData.puuid) {
          updatedSummoners.push(s);
          continue;
        }

        const latestFullName = `${accData.gameName}#${accData.tagLine}`;
        const [leagueRes, sumRes, masteryRes] = await Promise.all([
          fetch(`https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(accData.puuid)}?api_key=${RIOT_API_KEY}`),
          fetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(accData.puuid)}?api_key=${RIOT_API_KEY}`),
          fetch(`https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(accData.puuid)}/top?count=15&api_key=${RIOT_API_KEY}`)
        ]);

        let solo = null, flex = null;
        if (leagueRes.ok) {
          const entries = await leagueRes.json();
          if (Array.isArray(entries)) {
            entries.forEach(e => {
              if (e.queueType === 'RANKED_SOLO_5x5') solo = e;
              if (e.queueType === 'RANKED_FLEX_SR') flex = e;
            });
          }
        }

        let profileIconId = s.profileIconId ?? null;
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          if (sumData && sumData.profileIconId !== undefined) profileIconId = sumData.profileIconId;
        }

        let mostChamps = s.most || [];
        let playedChamps = s.playedChamps || s.most || [];
        if (masteryRes.ok) {
          const masteryData = await masteryRes.json();
          if (Array.isArray(masteryData) && masteryData.length > 0) {
            const names = masteryData.map(m => champMap[String(m.championId)]).filter(Boolean);
            if (names.length > 0) {
              mostChamps = names.slice(0, 5);
              playedChamps = names;
            }
          }
        }

        const primaryTier = solo ? solo.tier : (flex ? flex.tier : (s.tier || 'UNRANKED'));
        const soloDisplay = solo ? `${solo.tier.slice(0, 2)} ${solo.rank} (${solo.leaguePoints}LP)` : '언랭';
        const flexDisplay = flex ? `${flex.tier.slice(0, 2)} ${flex.rank} (${flex.leaguePoints}LP)` : '언랭';
        const activeRank = solo || flex;
        const activeDisplay = solo ? soloDisplay : (flex ? flexDisplay : '');

        let nextPeakTier = s.peakTier || s.tier || primaryTier;
        let nextPeakDetail = s.peakDetail || activeDisplay;
        if (activeRank && (TIER_ORDER[primaryTier] || 0) > (TIER_ORDER[nextPeakTier] || 0)) {
          nextPeakTier = primaryTier;
          nextPeakDetail = activeDisplay;
        } else if (!nextPeakDetail && activeRank && primaryTier === nextPeakTier) {
          nextPeakDetail = activeDisplay;
        }

        const aliases = Array.isArray(s.historyAliases) ? [...s.historyAliases] : [];
        if (s.name && s.name.trim().toLowerCase() !== latestFullName.trim().toLowerCase()) {
          if (!aliases.some(a => a.trim().toLowerCase() === s.name.trim().toLowerCase())) {
            aliases.push(s.name.trim());
          }
          renamedCount++;
        }

        updatedSummoners.push({
          ...s,
          puuid: accData.puuid,
          name: latestFullName,
          profileIconId,
          tier: primaryTier,
          peakTier: nextPeakTier,
          peakDetail: nextPeakDetail,
          flexBaseTier: flex ? flex.tier : 'UNRANKED',
          soloTier: soloDisplay,
          flexTier: flexDisplay,
          soloGames: solo ? (solo.wins + solo.losses) : 0,
          flexGames: flex ? (flex.wins + flex.losses) : 0,
          most: mostChamps,
          playedChamps,
          historyAliases: aliases
        });
        updatedCount++;
      } catch (innerErr) {
        updatedSummoners.push(s);
      }
    }

    const now = Math.max(Date.now(), (Number(current.updated_at) || 0) + 1);
    const nextPayload = {
      ...payload,
      summoners: updatedSummoners,
      updatedAt: now
    };

    const { error: writeErr } = await supabase
      .from('scrim_data')
      .upsert({ id: rowId, payload: nextPayload, updated_at: now });

    if (writeErr) throw writeErr;

    return res.status(200).json({
      success: true,
      updated: updatedCount,
      renamed: renamedCount,
      timestamp: now
    });
  } catch (err) {
    console.error('Cron refresh error:', err);
    return res.status(500).json({ error: err.message });
  }
}
