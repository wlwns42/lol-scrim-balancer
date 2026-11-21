import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VOTE_FIELDS = ['id', 'name', 'status', 'availTime', 'reason'];
const MAX_VOTE_LOGS = 25;

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const voteKey = p => (p && (p.id || p.name)) || null;
const sameVote = (a, b) => VOTE_FIELDS.every(k => (a?.[k] ?? '') === (b?.[k] ?? ''));
const logKey = l => [l?.timestamp, l?.name, l?.oldStatus, l?.newStatus, l?.availTime, l?.reason].join('|');

function mergeParticipants(existingList, incomingList, cancelledNames, stamp) {
  const exMap = new Map();
  (Array.isArray(existingList) ? existingList : []).forEach(p => {
    const k = voteKey(p);
    if (k && !exMap.has(k)) exMap.set(k, p);
  });

  const outMap = new Map();
  const incomingOrder = [];

  (Array.isArray(incomingList) ? incomingList : []).forEach(p => {
    const k = voteKey(p);
    if (!k || outMap.has(k) || !isObj(p)) return;
    const e = exMap.get(k);

    if (e) {
      if (p.votedAt && e.votedAt && p.votedAt < e.votedAt) {
        outMap.set(k, e);
      } else if (sameVote(p, e)) {
        outMap.set(k, e);
      } else {
        outMap.set(k, { ...p, votedAt: stamp });
      }
    } else if (p.votedAt) {
      // 이미 서버에서 취소된 투표의 옛 사본은 되살리지 않음
    } else {
      outMap.set(k, { ...p, votedAt: stamp });
    }
    if (outMap.has(k)) incomingOrder.push(k);
  });

  for (const [k, e] of exMap) {
    if (!outMap.has(k) && !cancelledNames.has(e.name)) outMap.set(k, e);
  }

  const result = [];
  for (const k of exMap.keys()) if (outMap.has(k)) result.push(outMap.get(k));
  for (const k of incomingOrder) if (!exMap.has(k)) result.push(outMap.get(k));
  return result;
}

function mergeSchedules(existingSched, incomingSched, stamp) {
  const ex = isObj(existingSched) ? existingSched : {};
  const inc = isObj(incomingSched) ? incomingSched : {};
  const result = {};

  for (const date of new Set([...Object.keys(ex), ...Object.keys(inc)])) {
    const e = isObj(ex[date]) ? ex[date] : null;
    const i = isObj(inc[date]) ? inc[date] : null;

    if (!i) { result[date] = e; continue; }

    const exLogs = Array.isArray(e?.voteLogs) ? e.voteLogs : [];
    const incLogs = Array.isArray(i.voteLogs) ? i.voteLogs : [];
    const exLogKeys = new Set(exLogs.map(logKey));
    const newLogs = incLogs.filter(l => !exLogKeys.has(logKey(l)));
    const cancelledNames = new Set(newLogs.filter(l => l?.newStatus === 'CANCEL').map(l => l.name));

    result[date] = {
      ...(e || {}),
      ...i,
      time: i.time ?? e?.time,
      participants: mergeParticipants(e?.participants, i.participants, cancelledNames, stamp),
      voteLogs: [...newLogs, ...exLogs].slice(0, MAX_VOTE_LOGS)
    };
  }
  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  const rowId = 'main_scrim_data_row';

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
          matchHistory: [],
          replayArchives: [],
          scrimSchedules: {},
          communityPosts: [],
          selectedPlayerIds: [],
          currentMatch: null,
          kakaoBindings: {},
          pushSubscriptions: [],
          updatedAt: 0
        });
      }

      return res.status(200).json({
        ...data.payload,
        updatedAt: data.updated_at || Date.now()
      });
    } catch (err) {
      console.error('Sync GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const incoming = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const wallClock = Date.now();

      const { data: current } = await supabase
        .from('scrim_data')
        .select('payload, updated_at')
        .eq('id', rowId)
        .single();

      const existing = current?.payload || {};

      const clientTs = Number(incoming.updatedAt) || 0;
      const now = Math.max(
        wallClock,
        (Number(current?.updated_at) || 0) + 1,
        Math.min(clientTs, wallClock + 60000) + 1
      );

      let resolvedHistory = existing.matchHistory || [];
      if (incoming.allowEmptyHistory === true) {
        resolvedHistory = [];
      } else if (Array.isArray(incoming.matchHistory) && incoming.matchHistory.length > 0) {
        resolvedHistory = incoming.matchHistory;
      }

      let resolvedPosts = existing.communityPosts || [];
      if (incoming.allowEmptyPosts === true) {
        resolvedPosts = [];
      } else if (Array.isArray(incoming.communityPosts) && incoming.communityPosts.length > 0) {
        resolvedPosts = incoming.communityPosts;
      }

      let resolvedSchedules;
      if (!isObj(incoming.scrimSchedules)) {
        resolvedSchedules = existing.scrimSchedules || {};
      } else if (incoming.allowEmptyHistory === true && incoming.allowEmptyPosts === true) {
        resolvedSchedules = incoming.scrimSchedules;
      } else {
        resolvedSchedules = mergeSchedules(existing.scrimSchedules, incoming.scrimSchedules, now);
      }

      const nextMatch = incoming.currentMatch !== undefined ? incoming.currentMatch : existing.currentMatch;
      let nextSelected = Array.isArray(incoming.selectedPlayerIds)
        ? incoming.selectedPlayerIds
        : (existing.selectedPlayerIds || []);

      if (nextMatch) {
        nextSelected = [...(nextMatch.blue || []), ...(nextMatch.red || [])]
          .filter(Boolean)
          .map(p => p.id);
      }

      const mergedKakao = {
        ...(isObj(existing.kakaoBindings) ? existing.kakaoBindings : {}),
        ...(isObj(incoming.kakaoBindings) ? incoming.kakaoBindings : {})
      };

      const payload = {
        summoners: (Array.isArray(incoming.summoners) && incoming.summoners.length > 0) ? incoming.summoners : (existing.summoners || []),
        matchHistory: resolvedHistory,
        replayArchives: Array.isArray(incoming.replayArchives) ? incoming.replayArchives : (existing.replayArchives || []),
        scrimSchedules: resolvedSchedules,
        communityPosts: resolvedPosts,
        selectedPlayerIds: nextSelected,
        currentMatch: nextMatch,
        balancerPoll: incoming.balancerPoll !== undefined ? incoming.balancerPoll : (existing.balancerPoll || null),
        kakaoBindings: mergedKakao,
        pushSubscriptions: Array.isArray(existing.pushSubscriptions) ? existing.pushSubscriptions : [],
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
