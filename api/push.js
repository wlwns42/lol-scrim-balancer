import webpush from 'web-push';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    'mailto:admin@lol-scrim-balancer.vercel.app',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

function getTodayKstKey() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function bearerMatches(req, expected) {
  if (!expected) return false;
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createVoteToken(playerId, dateKey, exp) {
  const secret = process.env.VOTE_TOKEN_SECRET;
  if (!secret) throw new Error('VOTE_TOKEN_SECRET 환경변수가 설정되지 않았습니다.');
  const payload = Buffer.from(JSON.stringify({ playerId, dateKey, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyVoteToken(token) {
  const secret = process.env.VOTE_TOKEN_SECRET;
  if (!secret || typeof token !== 'string' || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, suppliedSig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(suppliedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.playerId || !/^\d{4}-\d{2}-\d{2}$/.test(data.dateKey) || !Number.isFinite(data.exp) || data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || '';
  const rowId = 'main_scrim_data_row';

  try {
    if (action === 'vapid-key') {
      return res.status(200).json({ publicKey: VAPID_PUBLIC || '' });
    }

    const { data: current } = await supabase
      .from('scrim_data')
      .select('payload, updated_at')
      .eq('id', rowId)
      .single();

    const payload = current?.payload || {};
    let subs = Array.isArray(payload.pushSubscriptions) ? payload.pushSubscriptions : [];

    if (action === 'subscribe' && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { subscription, playerId, playerName, kakaoId } = body || {};
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: '유효하지 않은 푸시 구독 정보입니다.' });
      }

      subs = subs.filter(s => s.subscription?.endpoint !== subscription.endpoint);
      subs.push({
        subscription,
        playerId: playerId || '',
        playerName: playerName || '',
        kakaoId: kakaoId || '',
        updatedAt: Date.now()
      });

      payload.pushSubscriptions = subs;
      await supabase.from('scrim_data').upsert({
        id: rowId,
        payload,
        updated_at: Date.now()
      });

      return res.status(200).json({ success: true, totalSubscribers: subs.length });
    }

    if (action === 'quick-vote' && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { voteToken, status } = body || {};
      if (!['JOIN', 'HOLD', 'ABSENT'].includes(status)) {
        return res.status(400).json({ error: '잘못된 투표 요청입니다.' });
      }
      const verified = verifyVoteToken(voteToken);
      if (!verified) return res.status(401).json({ error: '투표 토큰이 유효하지 않거나 만료되었습니다. 알림을 다시 받아주세요.' });
      const { playerId, dateKey: targetDate } = verified;
      const playerName = '';

      if (!payload.scrimSchedules) payload.scrimSchedules = {};
      if (!payload.scrimSchedules[targetDate]) {
        payload.scrimSchedules[targetDate] = { time: '22:00', participants: [], voteLogs: [] };
      }

      const sched = payload.scrimSchedules[targetDate];
      const summoners = Array.isArray(payload.summoners) ? payload.summoners : [];
      const playerObj = summoners.find(s => s.id === playerId);
      if (!playerObj) return res.status(404).json({ error: '등록된 소환사 계정을 찾을 수 없습니다.' });

      const existingIdx = sched.participants.findIndex(p => p.id === playerObj.id || p.name === playerObj.name);
      const oldStatus = existingIdx >= 0 ? sched.participants[existingIdx].status : '미투표';
      const now = Date.now();

      const newItem = {
        id: playerObj.id,
        name: playerObj.name,
        status,
        availTime: status === 'ABSENT' ? '불참' : '정시 가능',
        reason: status === 'ABSENT' ? '알림창 불참' : '',
        votedAt: now
      };

      if (existingIdx >= 0) sched.participants[existingIdx] = newItem;
      else sched.participants.push(newItem);

      const kstNow = new Date(now + 9 * 60 * 60 * 1000);
      const timeStr = `${String(kstNow.getUTCHours()).padStart(2, '0')}:${String(kstNow.getUTCMinutes()).padStart(2, '0')}:${String(kstNow.getUTCSeconds()).padStart(2, '0')}`;
      if (!Array.isArray(sched.voteLogs)) sched.voteLogs = [];
      sched.voteLogs.unshift({
        timestamp: timeStr,
        name: playerObj.name,
        oldStatus,
        newStatus: status,
        availTime: newItem.availTime,
        reason: '푸시 알림 원클릭'
      });

      const { error: voteSaveError } = await supabase.from('scrim_data').upsert({
        id: rowId,
        payload,
        updated_at: now
      });
      if (voteSaveError) throw voteSaveError;

      return res.status(200).json({ success: true, dateKey: targetDate, status });
    }

    if (action === 'cron' || action === 'send') {
      if (action === 'cron') {
        if (req.method !== 'GET' || !bearerMatches(req, process.env.CRON_SECRET)) {
          return res.status(401).json({ error: '크론 인증에 실패했습니다.' });
        }
      } else {
        if (req.method !== 'POST' || !bearerMatches(req, process.env.PUSH_ADMIN_TOKEN)) {
          return res.status(401).json({ error: '푸시 발송 관리자 인증에 실패했습니다.' });
        }
      }
      if (!process.env.VOTE_TOKEN_SECRET) {
        return res.status(500).json({ error: 'VOTE_TOKEN_SECRET 환경변수가 설정되지 않았습니다.' });
      }
      if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
        return res.status(500).json({ error: 'VAPID 키 환경변수가 설정되지 않았습니다.' });
      }

      const body = req.method === 'POST'
        ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}))
        : {};

      const targetDate = body.dateKey || getTodayKstKey();
      const sched = payload.scrimSchedules?.[targetDate] || { time: '22:00', participants: [] };
      const joinedCount = (sched.participants || []).filter(p => p.status === 'JOIN').length;
      const validSubs = [];
      let sentCount = 0;

      for (const item of subs) {
        if (!item.playerId) { validSubs.push(item); continue; }
        try {
          const exp = Date.now() + 24 * 60 * 60 * 1000;
          const pushPayload = JSON.stringify({
            title: body.title || `⚔️ [${targetDate} ${sched.time || '22:00'}] 롤 내전 인원 모집!`,
            body: body.body || `현재 ${joinedCount}/10명 참가 중! 알림에서 참가/불참, 앱에서 보류를 선택하세요.`,
            url: `/?quickvote=${encodeURIComponent(targetDate)}`,
            dateKey: targetDate,
            playerId: item.playerId || '',
            playerName: item.playerName || '',
            voteToken: item.playerId ? createVoteToken(item.playerId, targetDate, exp) : ''
          });

          await webpush.sendNotification(item.subscription, pushPayload);
          validSubs.push(item);
          sentCount++;
        } catch (err) {
          if (err.statusCode !== 410 && err.statusCode !== 404) {
            validSubs.push(item);
          }
        }
      }

      if (validSubs.length !== subs.length) {
        payload.pushSubscriptions = validSubs;
        await supabase.from('scrim_data').upsert({
          id: rowId,
          payload,
          updated_at: Date.now()
        });
      }

      return res.status(200).json({ success: true, sentCount, totalSubscribers: validSubs.length });
    }
