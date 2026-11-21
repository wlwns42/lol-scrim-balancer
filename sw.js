self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: '⚔️ 오늘 밤 롤 내전 인원 모집!',
    body: '지금 눌러서 1초 만에 참가/불참 투표를 완료하세요.',
    url: '/',
    dateKey: ''
  };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {}

  const options = {
    body: data.body,
    icon: '/scrim_banner.png',
    badge: '/scrim_banner.png',
    vibrate: [200, 100, 200],
    tag: 'scrim-rsvp-' + (data.dateKey || 'today'),
    renotify: true,
    data: {
      url: data.url || '/',
      dateKey: data.dateKey || '',
      playerId: data.playerId || '',
      playerName: data.playerName || '',
      voteToken: data.voteToken || ''
    },
    actions: [
      { action: 'JOIN', title: '✅ 참가하기' },
      { action: 'ABSENT', title: '❌ 불참하기' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const payload = event.notification.data || {};
  const action = event.action;

  if ((action === 'JOIN' || action === 'ABSENT') && payload.voteToken && payload.dateKey) {
    event.waitUntil(
      fetch('/api/push?action=quick-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateKey: payload.dateKey,
          voteToken: payload.voteToken,
          status: action
        })
      }).then((response) => {
        if (!response.ok) throw new Error('투표 저장 실패');
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          if (clientList.length > 0) {
            clientList[0].focus();
            clientList[0].postMessage({ type: 'REFRESH_SCRIM_DATA' });
          } else {
            return self.clients.openWindow('/?voted=' + action);
          }
        });
      }).catch(() => {
        return self.clients.openWindow(payload.url || '/?quickvote=' + encodeURIComponent(payload.dateKey || ''));
      })
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(payload.url || '/');
    })
  );
});
